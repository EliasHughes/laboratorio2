import { registerSW } from 'virtual:pwa-register'

export function setupPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Hay una nueva versión de Yazoo Lab. ¿Actualizar ahora?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('Yazoo Lab listo para uso offline (caché de interfaz)')
    },
  })
}