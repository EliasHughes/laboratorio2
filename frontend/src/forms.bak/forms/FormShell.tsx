import { useEffect, useState } from 'react'

export type FormShellProps = {
  code: string
  title: string
  storageKey: string
  fields: { name: string; label: string; type?: string }[]
  onCancel?: () => void
  onSave?: (data: Record<string, string>) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function load(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

export default function FormShell({ code, title, storageKey, fields, onCancel, onSave }: FormShellProps) {
  const saved = load(storageKey)
  const [h, setH] = useState<Record<string, string>>(() => ({
    fecha_emision: saved.fecha_emision || today(),
    ...Object.fromEntries(fields.map((f) => [f.name, saved[f.name] || ''])),
    ...saved,
  }))

  useEffect(() => {
    if (!h.fecha_emision) setH((p) => ({ ...p, fecha_emision: today() }))
  }, [])

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'fecha_emision') return
    setH((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const save = () => {
    const data = { ...h, fecha_emision: h.fecha_emision || today() }
    localStorage.setItem(storageKey, JSON.stringify(data))
    onSave?.(data)
  }

  const print = () => {
    const data = { ...h, fecha_emision: h.fecha_emision || today() }
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    const rows = [
      ['Código', code],
      ['Fecha de emisión', data.fecha_emision],
      ...fields.map((f) => [f.label, data[f.name] || '—']),
    ]
      .map(([k, v]) => `<tr><th style="width:34%;text-align:left">${k}</th><td>${v}</td></tr>`)
      .join('')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
      <style>body{font-family:Arial;font-size:12px;padding:16px}table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #000;padding:6px}</style></head><body>
      <div style="display:grid;grid-template-columns:90px 1fr 140px;border:1px solid #000;margin-bottom:12px">
        <div style="padding:8px;text-align:center"><img src="${location.origin}/yazoo.png" height="44"/></div>
        <div style="padding:8px;text-align:center;border-left:1px solid #000;border-right:1px solid #000">
          <b>YAZOO · ${code}</b><br/>${title}
        </div>
        <div style="padding:8px;font-size:11px">${data.fecha_emision}</div>
      </div>
      <table>${rows}</table>
      <p style="font-size:10px;margin-top:16px">Yazoo Investments, S.R.L.</p>
      </body></html>`)
    w.document.close()
    w.print()
  }

  const box = 'w-full border border-[#C9C2B6] rounded px-2 py-1 text-sm text-[#1A120E] bg-white'
  const locked = box + ' bg-[#F3EFE8] text-[#5C5046]'

  return (
    <div className="bg-white text-[#1A120E] p-4 space-y-4">
      <div className="flex justify-between gap-3 border-b border-[#DCA54C] pb-3">
        <div>
          <p className="text-xs text-[#8A8076]">{code}</p>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <label className="text-xs">
          Fecha de emisión
          <input className={locked} name="fecha_emision" value={h.fecha_emision} readOnly />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <label key={f.name} className="text-xs text-[#5C5046]">
            {f.label}
            {f.type === 'textarea' ? (
              <textarea name={f.name} value={h[f.name] || ''} onChange={set} className={box + ' min-h-[72px]'} />
            ) : (
              <input name={f.name} type={f.type || 'text'} value={h[f.name] || ''} onChange={set} className={box} />
            )}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-3 py-1 text-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="px-3 py-1 text-sm border" onClick={print}>Imprimir</button>
        <button type="button" className="px-4 py-1 text-sm rounded-full bg-[#DCA54C]" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}

export function printStored(storageKey: string, code: string, title: string, fields: { name: string; label: string }[]) {
  const data = { fecha_emision: today(), ...load(storageKey) }
  const fake = { code, title, storageKey, fields, onCancel: () => undefined }
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<pre>${code} ${title}\nEmisión: ${data.fecha_emision}\n${JSON.stringify(data, null, 2)}</pre>`)
  w.document.close()
  w.print()
}