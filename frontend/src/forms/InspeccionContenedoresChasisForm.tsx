import { useState } from 'react'

const KEY = 'form-y-fo-si-004'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const BLOCKS: { g: string; rows: string[] }[] = [
  {
    g: 'CONTENEDOR',
    rows: ['Pared Frontal', 'Lado Izquierdo', 'Lado Derecho', 'Piso Exterior', 'Techo', 'Puertas', 'Longitud', 'Altura', 'Estatus de Bisagras', 'Sellos de Seguridad'],
  },
  {
    g: 'ISOTANQUE',
    rows: ['Vigas de Soporte', 'Superficie de Isotanque', 'Valvula de Carga', 'Visagra de la compuerta superior', 'Sellos de Seguridad'],
  },
  {
    g: 'CHASIS / CABINA',
    rows: ['Neumaticos y quinta rueda', 'Posterior, parachoques y puertas', 'Exterior, frente y costado', 'Interior de la cabina'],
  },
]

const SVG_BOX = `<svg viewBox="0 0 260 140" width="250" height="135" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="35" width="170" height="70" fill="#6B7C86" stroke="#1A120E" stroke-width="2"/>
  <polygon points="50,35 30,55 30,115 50,105" fill="#4E5C64" stroke="#1A120E"/>
  <polygon points="220,35 245,50 245,110 220,105" fill="#3E4A50" stroke="#1A120E"/>
  <text x="135" y="75" text-anchor="middle" font-size="9" fill="#fff">CONTENEDOR</text>
  <line x1="50" y1="35" x2="20" y2="18" stroke="#111"/><text x="2" y="14" font-size="7">1 Techo</text>
  <line x1="50" y1="70" x2="8" y2="70" stroke="#111"/><text x="2" y="68" font-size="7">2 Lado</text>
  <line x1="135" y1="105" x2="135" y2="128" stroke="#111"/><text x="110" y="138" font-size="7">3 Piso</text>
  <line x1="220" y1="70" x2="255" y2="70" stroke="#111"/><text x="200" y="66" font-size="7">4 Puerta</text>
</svg>`

const SVG_TANK = `<svg viewBox="0 0 260 140" width="250" height="135" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="40" width="180" height="70" fill="none" stroke="#1A120E" stroke-width="6"/>
  <ellipse cx="130" cy="75" rx="70" ry="24" fill="#D8D2C8" stroke="#1A120E"/>
  <rect x="62" y="58" width="136" height="34" fill="#E8E2D8" stroke="#1A120E"/>
  <circle cx="130" cy="48" r="6" fill="#555"/>
  <text x="130" y="78" text-anchor="middle" font-size="8">ISOTANQUE</text>
  <line x1="130" y1="42" x2="130" y2="16" stroke="#111"/><text x="100" y="12" font-size="7">Compuerta</text>
  <line x1="55" y1="90" x2="20" y2="120" stroke="#111"/><text x="2" y="132" font-size="7">Descarga</text>
</svg>`

export default function InspeccionContenedoresChasisForm({ onCancel, onSave, initialData }: any) {
  const [h, setH] = useState<any>(() => ({ fecha: today(), ...(initialData || {}) }))
  const set = (k: string, v: string) => {
    if (k === 'fecha') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const v = (k: string) => h[k] || ''
  const save = () => {
    const d = { ...h, fecha: h.fecha || today() }
    onSave?.(d)
  }

  const print = () => {
    const logo = `${window.location.origin}/yazoo.png`
    const w = window.open('', '_blank', 'width=1100,height=800')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-SI-004</title>
      <style>body{font-family:Arial;font-size:11px;padding:12px}table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #000;padding:3px}</style></head><body>
      <div style="display:flex;justify-content:space-between"><img src="${logo}" height="40"/>
      <b>INSPECCION DE CONTENEDORES (CAMION), ISOTANQUE Y CHASIS/REMOLQUE</b>
      <span>Y-FO-SI-004 REV.:01 Fecha ${h.fecha}</span></div>
      <p>No de Contenedor: ${v('numero')} Compañía: ${v('compania')} ${h.mov === 'Carga' ? '☑' : '☐'} Carga ${h.mov === 'Descarga' ? '☑' : '☐'} Descarga Nave: ${v('nave')}</p>
      <div>${SVG_BOX}${SVG_TANK}</div>
      <table><tr><th></th><th>ITEM</th><th>PREVIO</th><th>POSTERIOR</th></tr>
      ${BLOCKS.map((b) =>
        b.rows
          .map(
            (r, i) =>
              `<tr>${i === 0 ? `<td rowspan="${b.rows.length}"><b>${b.g}</b></td>` : ''}<td>${r}</td><td>${v(r + '_pre')}</td><td>${v(r + '_pos')}</td></tr>`
          )
          .join('')
      ).join('')}
      </table>
      <p>COMENTARIOS: ${v('com')}</p>
      <p>Personal en la carga: ${v('personal')}</p>
      <p>Inspeccionado por: ${v('insp')} Supervisor: ${v('sup')} Chofer: ${v('chofer')}</p>
      <p>Hora de Entrada: ${v('h_in')} Hora de Salida: ${v('h_out')}</p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-4 max-w-[1100px] mx-auto text-[12px]">
        <div className="flex justify-between items-start">
          <img src="/yazoo.png" className="h-10" alt="" />
          <p className="text-center font-bold text-sm">
            INSPECCION DE CONTENEDORES
            <br />
            (CAMION), ISOTANQUE Y CHASIS/REMOLQUE
          </p>
          <p className="text-[10px] text-right">
            CODIGO: Y-FO-SI-004
            <br />
            REV.: 01
            <br />
            PAGINA: 1 de 1
            <br />
            Fecha <input className="w-24 bg-[#F3EFE8] border-b border-black" value={h.fecha} readOnly />
          </p>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-4 mt-3">
          <div>
            <label className="block">
              No de Contenedor <input className="border-b border-black w-full" value={v('numero')} onChange={(e) => set('numero', e.target.value)} />
            </label>
            <label className="block mt-1">
              Compañía de transporte <input className="border-b border-black w-full" value={v('compania')} onChange={(e) => set('compania', e.target.value)} />
            </label>
            <div className="flex gap-6 mt-2">
              {['Carga', 'Descarga'].map((o) => (
                <label key={o} className="flex items-center gap-1">
                  <input type="radio" name="mov" checked={h.mov === o} onChange={() => set('mov', o)} /> {o}
                </label>
              ))}
            </div>
            <table className="w-full border-collapse mt-3">
              <thead>
                <tr>
                  <th className="border border-black w-8" />
                  <th className="border border-black">ITEM</th>
                  <th className="border border-black w-20">PREVIO</th>
                  <th className="border border-black w-20">POSTERIOR</th>
                </tr>
              </thead>
              <tbody>
                {BLOCKS.map((b) =>
                  b.rows.map((r, i) => (
                    <tr key={r}>
                      {i === 0 && (
                        <td className="border border-black font-bold text-center" rowSpan={b.rows.length} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {b.g}
                        </td>
                      )}
                      <td className="border border-black px-1">{r}</td>
                      <td className="border border-black p-0">
                        <input className="w-full h-6 text-center" value={v(r + '_pre')} onChange={(e) => set(r + '_pre', e.target.value)} />
                      </td>
                      <td className="border border-black p-0">
                        <input className="w-full h-6 text-center" value={v(r + '_pos')} onChange={(e) => set(r + '_pos', e.target.value)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs mb-1">
              Nave: <input className="border-b border-black w-40" value={v('nave')} onChange={(e) => set('nave', e.target.value)} />
            </p>
            <div dangerouslySetInnerHTML={{ __html: SVG_BOX }} />
            <div dangerouslySetInnerHTML={{ __html: SVG_TANK }} />
            <p className="mt-2">COMENTARIOS:</p>
            <textarea className="w-full border-b border-black h-16 outline-none" value={v('com')} onChange={(e) => set('com', e.target.value)} />
            <p className="mt-2">Personal en la carga</p>
            <input className="w-full border-b border-black" value={v('personal')} onChange={(e) => set('personal', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <label>
            Inspeccionado por <input className="border-b border-black w-full" value={v('insp')} onChange={(e) => set('insp', e.target.value)} />
          </label>
          <label>
            Hora de Entrada: <input className="border-b border-black w-24" value={v('h_in')} onChange={(e) => set('h_in', e.target.value)} />
          </label>
          <label>
            Supervisor de la carga <input className="border-b border-black w-full" value={v('sup')} onChange={(e) => set('sup', e.target.value)} />
          </label>
          <label>
            Hora de Salida: <input className="border-b border-black w-24" value={v('h_out')} onChange={(e) => set('h_out', e.target.value)} />
          </label>
          <label>
            Chofer o transportista <input className="border-b border-black w-full" value={v('chofer')} onChange={(e) => set('chofer', e.target.value)} />
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[1100px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}