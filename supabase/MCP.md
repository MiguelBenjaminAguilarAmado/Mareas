# Mareas · Conexión MCP

Permite que un asistente de IA compatible con [MCP](https://modelcontextprotocol.io) consulte (y, si lo autorizas, modifique) tus datos de Mareas **sincronizados en la nube**. Sin cuenta en la nube no hay nada que consultar.

## Cómo encaja

```
Asistente de IA ──HTTPS + clave mrs_…──▶ Edge Function «mareas-mcp» ──▶ funciones SQL ──▶ mareas_state
```

- La clave se crea en **Ajustes → Conexión con IA (MCP)**. En la base solo se guarda su hash SHA-256; la clave en claro se muestra una vez.
- La Edge Function usa la clave de servicio, pero solo habla con dos funciones SQL (`mcp_read_state`, `mcp_push_state`) que resuelven al usuario **a partir del hash de la clave**. Una clave nunca llega a datos de otro usuario.
- Las escrituras usan el mismo número de revisión que la app (`rev`): si otro dispositivo cambió la nube, se relee y se reintenta. Antes de cada escritura se guarda una copia (`mareas_mcp_backups`, últimas 5).

## Despliegue

1. En el editor SQL de Supabase ejecuta `supabase/mcp.sql` (después de `schema.sql`).
2. Despliega la función (sin verificación JWT: la autenticación es la clave MCP):
   ```bash
   supabase functions deploy mareas-mcp --no-verify-jwt
   # opcional: zona horaria con la que se agrupan los días
   supabase secrets set MAREAS_TZ=Europe/Madrid
   ```
3. En Mareas, con la sesión iniciada: Ajustes → Conexión con IA → **Crear clave** (solo lectura al empezar).
4. La dirección del servidor es `https://<tu-proyecto>.supabase.co/functions/v1/mareas-mcp`.

## Conectar un cliente

Cualquier cliente MCP que permita enviar la cabecera `Authorization: Bearer mrs_…`:

```bash
# Claude Code
claude mcp add --transport http mareas https://<proyecto>.supabase.co/functions/v1/mareas-mcp \
  --header "Authorization: Bearer mrs_TU_CLAVE"
```

```json
// Cursor y similares (mcp.json)
{ "mcpServers": { "mareas": {
  "url": "https://<proyecto>.supabase.co/functions/v1/mareas-mcp",
  "headers": { "Authorization": "Bearer mrs_TU_CLAVE" } } } }
```

Para clientes que solo hablan stdio, un puente como `npx mcp-remote <url> --header "Authorization: Bearer mrs_…"`.

> Los conectores web que exigen OAuth y no permiten una cabecera fija no podrán usar claves. Añadir OAuth sería el siguiente paso.

## Herramientas

| Herramienta | Permiso | Qué hace |
|---|---|---|
| `get_overview` | lectura | Recuentos, rango de fechas y permiso de la clave |
| `list_entries` | lectura | Entradas con filtros (fechas, ánimo, actividad, persona, texto) |
| `mood_summary` | lectura | Media, distribución, consistencia y actividades/personas que suben o bajan la media |
| `list_people` | lectura | Personas, categoría, confianza, grupos y ánimo con ellas |
| `get_relationship_graph` | lectura | Personas, grupos y conexiones dirigidas |
| `list_events` | lectura | Tareas, exámenes y entregas |
| `get_schedule` | lectura | Horario semanal y asignaturas |
| `create_entry` | escritura | Nueva entrada (actividades y personas deben existir) |
| `create_event` | escritura | Nueva tarea, examen, entrega, clase puntual o quedada |
| `set_event_done` | escritura | Marca un evento como hecho |
| `add_relation` | escritura | Conexión entre dos personas |

## Seguridad y límites

- Son datos sensibles de salud mental y **no están cifrados de extremo a extremo**: el servidor y el asistente los ven en claro. Usa solo asistentes en los que confíes.
- Empieza con claves de **solo lectura**; revoca cualquier clave desde la app en un toque.
- Si en un dispositivo tienes cambios sin sincronizar y una IA escribe, Mareas mostrará su diálogo de conflicto habitual.
- Fotos, vídeos y el nivel de estrés estimado no se exponen todavía.
- No hay límite de peticiones propio: si quieres uno, añádelo en la función o con las reglas de Supabase.
