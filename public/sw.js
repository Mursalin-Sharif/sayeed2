self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'ORDER_ALERT') return
  event.waitUntil(
    self.registration.showNotification(data.title || 'নতুন অর্ডার এসেছে', {
      body: data.body || 'একটি নতুন অর্ডার এসেছে',
      icon: '/js-agro-shop-logo.png',
      badge: '/js-agro-shop-logo.png',
      tag: data.tag || `order-${Date.now()}`,
      renotify: true,
      silent: false,
      vibrate: [200, 80, 200, 80, 400],
      requireInteraction: true,
      data: { url: data.url || '/admin/orders' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = event.notification.data && event.notification.data.url ? event.notification.data.url : '/admin/orders'
  const url = new URL(path, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    }),
  )
})
