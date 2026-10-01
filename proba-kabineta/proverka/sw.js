self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  let d={title:'ТОР ГРУПП',body:'Новое уведомление'};
  try{d=Object.assign(d,e.data.json())}catch(_){ if(e.data) d.body=e.data.text() }
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'icon-192.png',badge:'icon-192.png'}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.openWindow('./'))});
