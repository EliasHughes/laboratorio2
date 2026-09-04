export function isYazooPwa(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone) return true
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return true
    if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  } catch {
    /* ignore */
  }
  return false
}

function printViaIframe(html: string) {
  document.getElementById('yazoo-print-frame')?.remove()
  const iframe = document.createElement('iframe')
  iframe.id = 'yazoo-print-frame'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(html)
  doc.close()
  const run = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    window.setTimeout(() => iframe.remove(), 2500)
  }
  if (iframe.contentDocument?.readyState === 'complete') run()
  else iframe.onload = run
}

function printViaTab(html: string): boolean {
  const w = window.open('', '_blank', 'width=900,height=1100')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  w.focus()
  window.setTimeout(() => w.print(), 300)
  return true
}

export function printInApp(html: string) {
  printViaIframe(html)
}