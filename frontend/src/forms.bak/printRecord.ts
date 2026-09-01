export function printRecord(r: any) {
  const logo = `${window.location.origin}/yazoo.png`
  const payload = typeof r.payload === 'string' ? r.payload : JSON.stringify(r.payload || r.data || {}, null, 2)
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${r.form_code || 'ficha'}</title>
    <style>body{font-family:Arial;padding:18px}pre{white-space:pre-wrap;font-size:12px}</style></head><body>
    <div style="display:flex;justify-content:space-between">
      <img src="${logo}" height="48"/>
      <div style="text-align:center"><b>${r.title || ''}</b><br/>${r.form_code || ''}</div>
      <div style="font-size:11px;text-align:right">Creado por: ${r.created_by_name || '—'}<br/>Modificado por: ${r.updated_by_name || '—'}</div>
    </div>
    <pre>${String(payload).replace(/[<>]/g, '')}</pre>
    </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}