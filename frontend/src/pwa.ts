/*export function setupPWA() {
  if (!('serviceWorker' in navigator)) return
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true })
    })
    .catch(() => undefined)
}*/

export function setupPWA() {
  if (import.meta.env.DEV) return
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined)
}