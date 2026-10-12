const V='mareas-v14';
const FILES=['./','./index.html','./style.css','./Themes/glass.css','./Themes/android.css','./Themes/opencode.css','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  /* tolerante: un recurso que falle (por ejemplo un icono) ya no impide instalar el resto */
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
/* Caché primero con revalidación en segundo plano: abre al instante y las actualizaciones llegan solas a la siguiente visita */
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||new URL(rq.url).origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(rq,{ignoreSearch:true});
    const net=fetch(rq).then(async r=>{
      if(r&&r.ok&&r.type==='basic'){
        /* si ya había copia y el contenido cambió, avisamos a la app para que ofrezca recargar */
        if(hit){try{const a=await hit.clone().text(),b=await r.clone().text();if(a!==b)notify();}catch(_){}}
        await c.put(rq,r.clone());
      }
      return r;
    }).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    const r=await net;
    if(r)return r;
    if(rq.mode==='navigate')return (await c.match('./index.html'))||Response.error();
    return Response.error();
  }));
});

let told=false;
async function notify(){
  if(told)return;told=true;
  const cl=await self.clients.matchAll({type:'window'});
  cl.forEach(w=>w.postMessage({type:'mareas-update'}));
}
