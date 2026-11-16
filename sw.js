/* অফলাইনে অ্যাপের কাঠামো (UI) লোড করার জন্য; ভিডিও চালাতে ইন্টারনেট লাগবে */
const V = 'troyee-v27', SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png'];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
/* GitHub Pages ফাইল ১০ মিনিট ক্যাশ করে; তাই ইনস্টলে 'reload' ও পেজ খোলায় 'no-cache' দিয়ে সবসময় সর্বশেষ কপি আনা হয় */
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const same = u.origin === location.origin;
  if (!same && !CDN.includes(u.hostname)) return; /* YouTube ইত্যাদি সরাসরি নেটওয়ার্কে */
  if (r.mode === 'navigate') {
    /* নেট ধীর হলে ৪ সেকেন্ড পরে ক্যাশ থেকে খোলে */
    e.respondWith(Promise.race([fetch(r, { cache: 'no-cache' }), new Promise((_, j) => setTimeout(j, 4000))]).then(res => { if (res && res.ok) { const c = res.clone(); caches.open(V).then(x => x.put('index.html', c)); } return res; }).catch(() => caches.match('index.html').then(h => h || fetch(r))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
