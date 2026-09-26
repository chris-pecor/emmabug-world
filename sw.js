const CACHE = 'emmabug-v17-longer-adventures';
const FILES = [
  "./",
  "./index.html",
  "./icon.svg",
  "./manifest.webmanifest",
  "./sea/",
  "./sea/index.html",
  "./sea/icon.svg",
  "./sea/manifest.webmanifest",
  "./candy/",
  "./candy/index.html",
  "./candy/classic.html",
  "./candy/icon.svg",
  "./candy/manifest.webmanifest",
  "./candy/preview/",
  "./candy/preview/index.html",
  "./candy/preview/style.css",
  "./candy/preview/vendor/peerjs.min.js",
  "./candy/preview/adventure.mjs",
  "./candy/preview/art.mjs",
  "./candy/preview/creative.mjs",
  "./candy/preview/family-ui.mjs",
  "./candy/preview/family.mjs",
  "./candy/preview/furniture.mjs",
  "./candy/preview/game.mjs",
  "./candy/preview/levels.mjs",
  "./candy/preview/migration.mjs",
  "./candy/preview/physics.mjs",
  "./candy/preview/progress.mjs",
  "./candy/preview/puzzles.mjs",
  "./candy/preview/workshop.mjs"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('emmabug-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try {
      const response=await fetch(request);
      if(response.ok && response.type==='basic')await cache.put(request,response.clone());
      return response;
    }catch{
      const cached=await cache.match(request,{ignoreSearch:request.mode==='navigate'});
      if(cached)return cached;
      // Only navigation receives an HTML fallback; missing scripts stay failed requests.
      if(request.mode==='navigate') {
        const base=new URL('./',self.location.href).pathname;
        const route=url.pathname.slice(base.length);
        const fallback=route.startsWith('candy/preview')?'./candy/preview/index.html':route==='candy/classic.html'?'./candy/classic.html':route.startsWith('candy')?'./candy/index.html':route.startsWith('sea')?'./sea/index.html':'./index.html';
        return await cache.match(fallback)||Response.error();
      }
      return Response.error();
    }
  })());
});
