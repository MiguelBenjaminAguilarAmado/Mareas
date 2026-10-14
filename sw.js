const V='mareas-v26';
const FILES=['./','./index.html','./landing.html','./style.css','./themes/glass.css','./themes/android.css','./themes/opencode.css','./themes/paper.css','./manifest.webmanifest','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
self.addEventListener('install',e=>{
  /* tolerante: un recurso que falle (por ejemplo un icono) no impide instalar el resto */
  e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});

/* ¿Cambió el archivo? Se compara la huella del servidor (ETag / Last-Modified / tamaño) y solo
   si no hay ninguna se lee el texto. Antes se leían y comparaban los dos textos completos en cada visita. */
async function changed(oldR,newR){
  const h=n=>[oldR.headers.get(n),newR.headers.get(n)];
  for(const n of ['etag','last-modified','content-length']){
    const [a,b]=h(n);
    if(a&&b)return a!==b;
  }
  try{return (await oldR.clone().text())!==(await newR.clone().text());}catch(_){return false;}
}

/* Caché primero con revalidación en segundo plano: abre al instante y las actualizaciones llegan solas a la siguiente visita */
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||new URL(rq.url).origin!==location.origin)return;
  /* los vídeos piden rangos de bytes (respuesta 206): no se pueden guardar en caché, se dejan pasar */
  if(rq.headers.has('range'))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(rq,{ignoreSearch:true});
    const net=fetch(rq).then(async r=>{
      if(r&&r.ok&&r.status===200&&r.type==='basic'){
        /* si ya había copia y el contenido cambió, avisamos a la app para que ofrezca recargar */
        if(hit){try{if(await changed(hit,r))notify();}catch(_){}}
        /* un fallo al guardar (cuota llena, por ejemplo) ya no hace perder la respuesta de red */
        try{await c.put(rq,r.clone());}catch(_){}
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
