// Mareas · servidor MCP (Streamable HTTP, sin estado) como Edge Function de Supabase.
// Despliegue:  supabase functions deploy mareas-mcp --no-verify-jwt
// Autenticación: Authorization: Bearer mrs_...  (clave creada en Mareas → Ajustes → Conexión con IA).
// Variables opcionales:  MAREAS_TZ (zona horaria para agrupar por días, por defecto Europe/Madrid).

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TZ = Deno.env.get("MAREAS_TZ") || "Europe/Madrid";
const MAX_OUT = 60000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id, mcp-protocol-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MOODS = ["", "Fatal", "Mal", "Regular", "Bien", "Genial"];

// deno-lint-ignore no-explicit-any
type Json = any;
class HttpErr extends Error { constructor(public status: number, m: string) { super(m); } }

async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function rpc(name: string, args: Json) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const t = await r.text();
  if (!r.ok) {
    if (t.includes("invalid token")) throw new HttpErr(401, "Clave no válida, revocada o caducada.");
    if (t.includes("read-only")) throw new Error("Esta clave es de solo lectura. Crea una con permiso de escritura en Mareas.");
    throw new Error("Error de base de datos: " + t.slice(0, 200));
  }
  return t ? JSON.parse(t) : null;
}
async function readState(hash: string) {
  const rows = await rpc("mcp_read_state", { p_hash: hash });
  if (!rows || !rows.length) throw new Error("Esta cuenta todavía no tiene datos sincronizados en la nube.");
  const r = rows[0];
  return { data: r.out_data as Json, rev: r.out_rev as number, scope: r.out_scope as string, updated: r.out_updated as string };
}
/** Lee, modifica y guarda respetando el número de revisión; si otro dispositivo cambió la nube, reintenta. */
async function mutate(hash: string, fn: (d: Json) => Json) {
  for (let i = 0; i < 4; i++) {
    const st = await readState(hash);
    if (st.scope !== "write") throw new Error("Esta clave es de solo lectura. Crea una con permiso de escritura en Mareas.");
    const d = structuredClone(st.data);
    const out = fn(d);
    const rev = await rpc("mcp_push_state", { p_hash: hash, p_data: d, p_base: st.rev });
    if (rev === -1) continue;
    if (rev === -2) throw new Error("No hay datos en la nube para modificar.");
    return { ...out, nueva_revision: rev };
  }
  throw new Error("La nube cambió varias veces mientras se guardaba. Inténtalo de nuevo.");
}

// ---------- utilidades ----------
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dkey = (ts: number) => dayFmt.format(new Date(ts));
const hm = (ts: number) => new Intl.DateTimeFormat("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ts));
const plain = (s: unknown) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const r2 = (x: number) => Math.round(x * 100) / 100;
const isDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d\d-\d\d$/.test(s) && !isNaN(Date.parse(s + "T00:00:00Z"));
const arr = (x: Json) => (Array.isArray(x) ? x : []);
function nid(p: string) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }

function maps(d: Json) {
  const acts = new Map<string, string>(arr(d.acts).map((a: Json) => [a.id, a.name]));
  const people = new Map<string, string>(arr(d.people).map((p: Json) => [p.id, p.name]));
  people.set("self", "Yo");
  const subjects = new Map<string, Json>(arr(d.subjects).map((s: Json) => [s.id, s]));
  return { acts, people, subjects };
}
function personId(d: Json, name: string): string | null {
  const n = plain(name);
  if (n === "yo" || n === "self") return "self";
  const exact = arr(d.people).find((p: Json) => plain(p.name) === n);
  if (exact) return exact.id;
  const part = arr(d.people).filter((p: Json) => plain(p.name).includes(n));
  return part.length === 1 ? part[0].id : null;
}
function entryOut(e: Json, m: ReturnType<typeof maps>, notes: boolean) {
  return {
    id: e.id, fecha: dkey(e.ts), hora: hm(e.ts), animo: e.mood, animo_nombre: MOODS[e.mood] || "",
    titulo: e.title || undefined, nota: notes ? e.note || undefined : undefined,
    actividades: arr(e.acts).map((id: string) => m.acts.get(id)).filter(Boolean),
    personas: arr(e.pp).map((id: string) => m.people.get(id)).filter(Boolean),
    escalas: e.sc && Object.keys(e.sc).length ? e.sc : undefined,
    con_multimedia: arr(e.m).length || undefined,
  };
}

// ---------- herramientas ----------
type Tool = {
  name: string; description: string; inputSchema: Json; write?: boolean;
  run: (a: Json, hash: string) => Promise<Json>;
};
const str = (d: string) => ({ type: "string", description: d });
const obj = (properties: Json, required: string[] = []) => ({ type: "object", properties, required, additionalProperties: false });

const TOOLS: Tool[] = [
  {
    name: "get_overview",
    description: "Resumen general de los datos de Mareas: cantidad de entradas, personas, asignaturas, tareas, rango de fechas y permiso de la clave. Úsalo primero para situarte.",
    inputSchema: obj({}),
    run: async (_a, h) => {
      const { data: d, rev, scope, updated } = await readState(h);
      const ts = arr(d.entries).map((e: Json) => e.ts).sort((a: number, b: number) => a - b);
      return {
        permiso: scope, revision: rev, actualizado: updated, zona_horaria: TZ,
        entradas: ts.length, primera_entrada: ts.length ? dkey(ts[0]) : null, ultima_entrada: ts.length ? dkey(ts[ts.length - 1]) : null,
        actividades: arr(d.acts).length, personas: arr(d.people).length, relaciones: arr(d.rels).length, grupos: arr(d.pgroups).length,
        asignaturas: arr(d.subjects).length, profesores: arr(d.teachers).length, clases_semanales: arr(d.classes).length,
        pendientes: arr(d.events).filter((x: Json) => !x.done).length, escala_animo: "1 Fatal · 2 Mal · 3 Regular · 4 Bien · 5 Genial",
      };
    },
  },
  {
    name: "list_entries",
    description: "Lista entradas del diario de ánimo (más recientes primero) con filtros opcionales por fechas, ánimo, actividad, persona o texto.",
    inputSchema: obj({
      from: str("Fecha inicial YYYY-MM-DD"), to: str("Fecha final YYYY-MM-DD"),
      mood_min: { type: "integer", minimum: 1, maximum: 5 }, mood_max: { type: "integer", minimum: 1, maximum: 5 },
      activity: str("Nombre (o parte) de una actividad"), person: str("Nombre de una persona"), text: str("Texto a buscar en título o nota"),
      limit: { type: "integer", minimum: 1, maximum: 200, description: "Máximo de entradas (por defecto 40)" },
      include_notes: { type: "boolean", description: "Incluir el texto de las notas (por defecto true)" },
    }),
    run: async (a, h) => {
      const { data: d } = await readState(h), m = maps(d);
      const pid = a.person ? personId(d, a.person) : null;
      if (a.person && !pid) throw new Error(`No encuentro a la persona «${a.person}».`);
      let l: Json[] = arr(d.entries).filter((e: Json) => {
        const k = dkey(e.ts);
        if (a.from && k < a.from) return false;
        if (a.to && k > a.to) return false;
        if (a.mood_min && e.mood < a.mood_min) return false;
        if (a.mood_max && e.mood > a.mood_max) return false;
        if (a.activity && !arr(e.acts).some((id: string) => plain(m.acts.get(id)).includes(plain(a.activity)))) return false;
        if (pid && !arr(e.pp).includes(pid)) return false;
        if (a.text && !plain((e.title || "") + " " + (e.note || "")).includes(plain(a.text))) return false;
        return true;
      }).sort((x: Json, y: Json) => y.ts - x.ts);
      const total = l.length, lim = Math.min(200, a.limit || 40);
      l = l.slice(0, lim);
      return { total_coincidentes: total, devueltas: l.length, entradas: l.map((e) => entryOut(e, m, a.include_notes !== false)) };
    },
  },
  {
    name: "mood_summary",
    description: "Estadísticas de ánimo de los últimos N días: media, distribución, días con registro (consistencia), media diaria y actividades/personas que más suben o bajan la media (relación, no causa).",
    inputSchema: obj({ days: { type: "integer", minimum: 3, maximum: 730, description: "Ventana en días (por defecto 30)" } }),
    run: async (a, h) => {
      const { data: d } = await readState(h), m = maps(d), days = a.days || 30;
      const from = Date.now() - days * 864e5;
      const es: Json[] = arr(d.entries).filter((e: Json) => e.ts >= from);
      if (!es.length) return { dias: days, entradas: 0 };
      const all = mean(es.map((e) => e.mood));
      const dist: Record<string, number> = {};
      es.forEach((e) => { const k = `${e.mood} ${MOODS[e.mood]}`; dist[k] = (dist[k] || 0) + 1; });
      const byDay = new Map<string, number[]>();
      es.forEach((e) => { const k = dkey(e.ts); byDay.set(k, [...(byDay.get(k) || []), e.mood]); });
      const effect = (has: (e: Json) => boolean) => {
        const w = es.filter(has).map((e) => e.mood), wo = es.filter((e) => !has(e)).map((e) => e.mood);
        return w.length >= 3 && wo.length >= 3 ? { veces: w.length, media_con: r2(mean(w)), media_sin: r2(mean(wo)), diferencia: r2(mean(w) - mean(wo)) } : null;
      };
      const rank = (ids: string[], name: (id: string) => string | undefined, has: (id: string) => (e: Json) => boolean) =>
        ids.map((id) => ({ nombre: name(id), ...effect(has(id)) })).filter((x) => x.veces)
          .sort((x: Json, y: Json) => y.diferencia - x.diferencia);
      const acts = rank([...m.acts.keys()], (id) => m.acts.get(id), (id) => (e) => arr(e.acts).includes(id));
      const ppl = rank(arr(d.people).map((p: Json) => p.id), (id) => m.people.get(id), (id) => (e) => arr(e.pp).includes(id));
      return {
        dias: days, entradas: es.length, animo_medio: r2(all), dias_con_registro: byDay.size,
        consistencia_pct: Math.round((byDay.size / days) * 100), distribucion: dist,
        media_diaria: Object.fromEntries([...byDay].sort().map(([k, v]) => [k, r2(mean(v))])),
        actividades_que_mas_suben: acts.slice(0, 5), actividades_que_mas_bajan: acts.slice(-5).reverse().filter((x: Json) => x.diferencia < 0),
        personas_que_mas_suben: ppl.slice(0, 5), personas_que_mas_bajan: ppl.slice(-3).reverse().filter((x: Json) => x.diferencia < 0),
        aviso: "Muestra relación entre variables, no causa. No es un diagnóstico clínico.",
      };
    },
  },
  {
    name: "list_people",
    description: "Personas guardadas con categoría, confianza personal (1-5), grupos, nº de entradas y ánimo medio cuando están presentes.",
    inputSchema: obj({}),
    run: async (_a, h) => {
      const { data: d } = await readState(h);
      const gname = new Map<string, string>(arr(d.pgroups).map((g: Json) => [g.id, g.name]));
      return arr(d.people).slice(0, 300).map((p: Json) => {
        const es = arr(d.entries).filter((e: Json) => arr(e.pp).includes(p.id));
        return {
          nombre: p.name, categoria: p.cat || null, confianza: p.tr || null, grupos: arr(p.g).map((g: string) => gname.get(g)).filter(Boolean),
          ciudad: p.city || undefined, pais: p.country || undefined, cumpleanos: p.bd || undefined,
          entradas: es.length, animo_medio_con_ella: es.length ? r2(mean(es.map((e: Json) => e.mood))) : null,
        };
      });
    },
  },
  {
    name: "get_relationship_graph",
    description: "Grafo de relaciones: nodos (personas, «Yo» y grupos) y conexiones registradas entre personas (con tipo y dirección origen→destino).",
    inputSchema: obj({}),
    run: async (_a, h) => {
      const { data: d } = await readState(h), m = maps(d);
      return {
        personas: [...m.people.values()],
        grupos: arr(d.pgroups).map((g: Json) => ({ nombre: g.name, miembros: arr(d.people).filter((p: Json) => arr(p.g).includes(g.id)).map((p: Json) => p.name) })),
        conexiones: arr(d.rels).map((r: Json) => ({ de: m.people.get(r.a), a: m.people.get(r.b), tipo: r.t || null })),
      };
    },
  },
  {
    name: "list_events",
    description: "Agenda escolar: tareas, exámenes, entregas, clases puntuales y quedadas, con asignatura, fecha, hora, prioridad y si están hechas.",
    inputSchema: obj({
      from: str("Fecha inicial YYYY-MM-DD"), to: str("Fecha final YYYY-MM-DD"),
      type: { type: "string", enum: ["task", "exam", "delivery", "class", "social"] },
      pending_only: { type: "boolean", description: "Solo no hechos (por defecto false)" }, subject: str("Nombre de asignatura"),
    }),
    run: async (a, h) => {
      const { data: d } = await readState(h), m = maps(d);
      const l = arr(d.events).filter((x: Json) => {
        if (a.from && x.date < a.from) return false;
        if (a.to && x.date > a.to) return false;
        if (a.type && x.type !== a.type) return false;
        if (a.pending_only && x.done) return false;
        if (a.subject && !plain(m.subjects.get(x.sid)?.name).includes(plain(a.subject))) return false;
        return true;
      }).sort((x: Json, y: Json) => (x.date + (x.time || "")).localeCompare(y.date + (y.time || "")));
      return l.slice(0, 200).map((x: Json) => ({
        id: x.id, tipo: x.type, titulo: x.title, fecha: x.date, hora: x.time || undefined, asignatura: m.subjects.get(x.sid)?.name,
        prioridad: ["baja", "media", "alta"][x.prio ?? 1], hecho: !!x.done, nota: x.note || undefined,
      }));
    },
  },
  {
    name: "get_schedule",
    description: "Horario semanal de clases (día, hora, asignatura, aula, profesor) y lista de asignaturas.",
    inputSchema: obj({}),
    run: async (_a, h) => {
      const { data: d } = await readState(h), m = maps(d);
      const teachers = new Map<string, string>(arr(d.teachers).map((t: Json) => [t.id, t.name]));
      const DN = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
      return {
        semanas_AB: !!d.sched?.ab,
        clases: arr(d.classes).slice().sort((x: Json, y: Json) => x.day - y.day || String(x.start).localeCompare(String(y.start))).map((c: Json) => ({
          dia: DN[c.day], inicio: c.start, fin: c.end, asignatura: m.subjects.get(c.sid)?.name, aula: c.room || undefined, semana: c.week || undefined,
          profesor: teachers.get(m.subjects.get(c.sid)?.teacher),
        })),
        asignaturas: arr(d.subjects).map((s: Json) => ({ nombre: s.name, profesor: teachers.get(s.teacher), aula: s.room || undefined })),
      };
    },
  },

  // ---------- escritura (requieren clave con permiso de escritura) ----------
  {
    name: "create_entry", write: true,
    description: "Crea una entrada en el diario de ánimo. Las actividades y personas deben existir ya (se buscan por nombre). Antes de escribir, confirma con la persona los datos de la entrada.",
    inputSchema: obj({
      mood: { type: "integer", minimum: 1, maximum: 5, description: "1 Fatal, 2 Mal, 3 Regular, 4 Bien, 5 Genial" },
      title: str("Título (máx. 120)"), note: str("Nota (máx. 5000)"),
      activities: { type: "array", items: { type: "string" }, description: "Nombres de actividades existentes" },
      people: { type: "array", items: { type: "string" }, description: "Nombres de personas existentes" },
      datetime: str("Fecha y hora ISO 8601 con zona (por defecto, ahora)"),
    }, ["mood"]),
    run: (a, h) => mutate(h, (d) => {
      if (!Number.isInteger(a.mood) || a.mood < 1 || a.mood > 5) throw new Error("mood debe ser un entero de 1 a 5.");
      const ts = a.datetime ? Date.parse(a.datetime) : Date.now();
      if (isNaN(ts)) throw new Error("datetime no es una fecha ISO válida.");
      const acts: string[] = [], bad: string[] = [];
      (a.activities || []).forEach((n: string) => {
        const f = arr(d.acts).find((x: Json) => plain(x.name) === plain(n));
        if (f) acts.push(f.id); else bad.push(n);
      });
      const pp: string[] = [];
      (a.people || []).forEach((n: string) => { const id = personId(d, n); if (id) pp.push(id); else bad.push(n); });
      if (bad.length) throw new Error("No existen en Mareas: " + bad.join(", ") + ". Créalas primero en la app.");
      const e: Json = { id: "e" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), ts, mood: a.mood, acts, note: String(a.note || "").slice(0, 5000), title: String(a.title || "").slice(0, 120) };
      if (pp.length) e.pp = pp;
      d.entries = arr(d.entries); d.entries.push(e);
      return { creada: e.id, fecha: dkey(ts), hora: hm(ts) };
    }),
  },
  {
    name: "create_event", write: true,
    description: "Crea una tarea, examen, entrega, clase puntual o quedada en la agenda.",
    inputSchema: obj({
      type: { type: "string", enum: ["task", "exam", "delivery", "class", "social"] }, title: str("Título (máx. 120)"), date: str("YYYY-MM-DD"),
      time: str("HH:MM (opcional)"), subject: str("Nombre de una asignatura existente (opcional)"),
      priority: { type: "integer", minimum: 0, maximum: 2, description: "0 baja, 1 media, 2 alta" }, note: str("Nota (máx. 1000)"),
    }, ["type", "title", "date"]),
    run: (a, h) => mutate(h, (d) => {
      if (!["task", "exam", "delivery", "class", "social"].includes(a.type)) throw new Error("type no válido.");
      if (!isDate(a.date)) throw new Error("date debe tener formato YYYY-MM-DD.");
      if (!String(a.title || "").trim()) throw new Error("title es obligatorio.");
      let sid = "";
      if (a.subject) {
        const s = arr(d.subjects).find((x: Json) => plain(x.name) === plain(a.subject));
        if (!s) throw new Error(`No existe la asignatura «${a.subject}».`);
        sid = s.id;
      }
      const ev: Json = {
        id: nid("v"), type: a.type, title: String(a.title).trim().slice(0, 120), sid, date: a.date,
        time: /^\d\d:\d\d$/.test(a.time || "") ? a.time : "", prio: [0, 1, 2].includes(a.priority) ? a.priority : 1, gradeWeight: 1, stress: true,
        done: false, rem: -1, note: String(a.note || "").slice(0, 1000),
      };
      d.events = arr(d.events); d.events.push(ev);
      return { creado: ev.id };
    }),
  },
  {
    name: "set_event_done", write: true,
    description: "Marca un evento de la agenda como hecho o pendiente (usa el id de list_events).",
    inputSchema: obj({ id: str("Id del evento"), done: { type: "boolean" } }, ["id", "done"]),
    run: (a, h) => mutate(h, (d) => {
      const ev = arr(d.events).find((x: Json) => x.id === a.id);
      if (!ev) throw new Error("No existe un evento con ese id.");
      ev.done = !!a.done;
      return { id: ev.id, hecho: ev.done };
    }),
  },
  {
    name: "add_relation", write: true,
    description: "Registra una conexión entre dos personas existentes (puede ser «Yo»). La dirección es de la primera hacia la segunda.",
    inputSchema: obj({ from: str("Persona origen (o «Yo»)"), to: str("Persona destino"), type: str("Tipo, p. ej. Hermanos o Amistad (máx. 40)") }, ["from", "to"]),
    run: (a, h) => mutate(h, (d) => {
      const x = personId(d, a.from), y = personId(d, a.to);
      if (!x) throw new Error(`No encuentro a «${a.from}».`);
      if (!y) throw new Error(`No encuentro a «${a.to}».`);
      if (x === y) throw new Error("Elige dos personas distintas.");
      d.rels = arr(d.rels);
      if (d.rels.some((r: Json) => (r.a === x && r.b === y) || (r.a === y && r.b === x))) throw new Error("Ya hay una conexión entre esas dos personas.");
      const r = { id: nid("rl"), a: x, b: y, t: String(a.type || "").trim().slice(0, 40) };
      d.rels.push(r);
      return { creada: r.id };
    }),
  },
];

// ---------- JSON-RPC / MCP ----------
const INSTRUCTIONS =
  "Datos personales de Mareas (diario de ánimo y agenda escolar). Son información sensible de salud mental: trátala con discreción, " +
  "no la reveles a terceros y no hagas diagnósticos clínicos. Las estadísticas muestran relación, no causa. " +
  "Empieza con get_overview. Antes de usar herramientas de escritura, confirma con la persona lo que vas a guardar.";

async function handle(msg: Json, hash: string): Promise<Json | null> {
  const { id, method, params } = msg;
  const ok = (result: Json) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
  if (id === undefined || id === null) return null; // notificación
  switch (method) {
    case "initialize":
      try { await readState(hash); } catch (e) { if (e instanceof HttpErr) throw e; }
      return ok({
        protocolVersion: params?.protocolVersion || "2025-03-26",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "mareas", version: "1.0.0" }, instructions: INSTRUCTIONS,
      });
    case "ping": return ok({});
    case "tools/list":
      return ok({
        tools: TOOLS.map((t) => ({
          name: t.name, description: t.description, inputSchema: t.inputSchema,
          annotations: { readOnlyHint: !t.write, destructiveHint: false, idempotentHint: !t.write, openWorldHint: false },
        })),
      });
    case "tools/call": {
      const t = TOOLS.find((x) => x.name === params?.name);
      if (!t) return fail(-32602, "Herramienta desconocida: " + params?.name);
      try {
        let text = JSON.stringify(await t.run(params?.arguments || {}, hash));
        if (text.length > MAX_OUT) text = text.slice(0, MAX_OUT) + `…[recortado: usa filtros o un límite menor]`;
        return ok({ content: [{ type: "text", text }] });
      } catch (e) {
        if (e instanceof HttpErr) throw e;
        return ok({ isError: true, content: [{ type: "text", text: (e as Error).message }] });
      }
    }
    default: return fail(-32601, "Método no soportado: " + method);
  }
}

Deno.serve(async (req) => {
  const json = (b: Json, status = 200, extra: Record<string, string> = {}) =>
    new Response(b === null ? null : JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "Usa POST (MCP Streamable HTTP)." }, 405, { Allow: "POST, OPTIONS" });
  const m = /^Bearer\s+(mrs_[A-Za-z0-9]{20,80})$/.exec(req.headers.get("authorization") || "");
  if (!m) return json({ error: "Falta la clave MCP (Authorization: Bearer mrs_…)." }, 401, { "WWW-Authenticate": 'Bearer realm="mareas"' });
  let body: Json;
  try { body = await req.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON no válido" } }, 400); }
  try {
    const hash = await sha256(m[1]);
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((x) => handle(x, hash)))).filter((x) => x !== null);
      return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
    }
    const out = await handle(body, hash);
    return out === null ? new Response(null, { status: 202, headers: CORS }) : json(out);
  } catch (e) {
    if (e instanceof HttpErr) return json({ error: e.message }, e.status, { "WWW-Authenticate": 'Bearer realm="mareas"' });
    return json({ jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32603, message: (e as Error).message } }, 500);
  }
});
