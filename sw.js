const CACHE='ro-diary-v0.2.4-beta';
const ASSETS=[
  './',
  './styles.css?v=0.2.4',
  './pdf-export.js?v=0.2.4',
  './app.js?v=0.2.4',
  './manifest.webmanifest?v=0.2.4',
  './icons/icon-192.png?v=0.2.4',
  './icons/icon-512.png?v=0.2.4'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(resp=>{
      if(resp && resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./',copy));}
      return resp;
    }).catch(()=>caches.match('./')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{
    if(resp && resp.status===200 && resp.type==='basic'){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return resp;
  })));
});
