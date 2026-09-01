import { useState } from 'react'
import { finishPrintHtml } from './printEvidence'

const KEY = 'form-y-fo-cc-018'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const ISO = [
  'Limpieza del Revestimiento',
  'Pasarela',
  'Compuerta de carga superior',
  'Válvula de descarga inferior',
  'Válvula entrada de aire',
  'Olores extraños',
  'Presencia de grasas, manchas o lubricantes',
]
const CONT = [
  'Limpieza de las paredes',
  'Limpieza del piso contenedor',
  'Olores extraños (contenedor)',
  'Integridad de las paredes',
  'Presencia de grasas, manchas o lubricantes (contenedor)',
]
const OPT = ['BUENO', 'REGULAR', 'DEFICIENTE']

const SVG_TANK = `<svg viewBox="0 0 480 240" width="320" height="160" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,70 400,70 440,30 80,30" fill="#8B1E1E" stroke="#4A0D0D"/>
  <rect x="40" y="70" width="360" height="130" fill="none" stroke="#8B1E1E" stroke-width="10"/>
  <polygon points="400,70 440,30 440,160 400,200" fill="#6E1515" stroke="#4A0D0D"/>
  <line x1="40" y1="200" x2="400" y2="200" stroke="#8B1E1E" stroke-width="10"/>
  <ellipse cx="220" cy="128" rx="155" ry="48" fill="#F4F1EC" stroke="#333"/>
  <rect x="70" y="95" width="300" height="66" fill="#F7F4EF" stroke="#333"/>
  <ellipse cx="220" cy="161" rx="155" ry="18" fill="#D9D4CC" stroke="#333"/>
  <circle cx="175" cy="78" r="10" fill="#C9C3B8" stroke="#333"/>
  <circle cx="250" cy="76" r="8" fill="#B7B0A6" stroke="#333"/>
  <text x="200" y="130" font-size="9" fill="#333">ISOTANQUE</text>
  <rect x="392" y="110" width="10" height="50" fill="#C9C3B8" stroke="#333"/>
</svg>`

const SVG_BOX = `<svg viewBox="0 0 480 240" width="320" height="160" xmlns="http://www.w3.org/2000/svg">
  <rect x="70" y="40" width="340" height="150" fill="#4F6F88" stroke="#2C4254" stroke-width="6"/>
  <rect x="82" y="52" width="316" height="118" fill="#E8EEF2"/>
  ${Array.from({ length: 16 }, (_, i) => {
    const x = 90 + i * 19
    return `<rect x="${x}" y="54" width="8" height="100" fill="#D5DEE5"/>`
  }).join('')}
  <rect x="82" y="154" width="316" height="16" fill="#C5CED6"/>
  <rect x="70" y="40" width="28" height="150" fill="#3E5A70"/>
  <text x="240" y="120" text-anchor="middle" font-size="14" font-weight="700" fill="#2C4254">PARED INTERNA</text>
  <text x="240" y="168" text-anchor="middle" font-size="11" fill="#2C4254">PISO</text>
</svg>`

export default function InspeccionIsotanquesForm({ onCancel, onSave, initialData, formId }: any) {
  const [h, setH] = useState<any>(() => ({ fecha: today(), ...(initialData || {}) }))
  const set = (k: string, v: string) => {
    if (k === 'fecha') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const save = () => {
    const d = { ...h, fecha: h.fecha || today() }
    onSave?.(d)
  }
  const row = (it: string) =>
    `<tr><td style="text-align:left">${it.replace(' (contenedor)', '')}</td>
      ${OPT.map((o) => `<td>${h[it] === o ? '☑' : '☐'}</td>`).join('')}</tr>`

  const print = async () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-018</title>
      <style>body{font-family:Arial;font-size:12px;padding:16px}table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #000;padding:3px;text-align:center}.ln{border-bottom:1px solid #000;min-width:200px;display:inline-block}</style></head><body>
      <h3 style="text-align:center">INSPECCION DE ISOTANQUES, CISTERNAS Y CONTENEDORES (CAMION)</h3>
      <p style="text-align:right">CODIGO: Y-FO-CC-018 · REV.: 00 · Fecha ${h.fecha}</p>
      <p>No de Isotanque, Cisterna o Contenedor: <span class="ln">${h.numero || ''}</span></p>
      <p>Capacidad o Dimension: <span class="ln">${h.capacidad || ''}</span></p>
      <p>Producto a cargar: <span class="ln">${h.producto || ''}</span></p>
      <p>Lote del producto: <span class="ln">${h.lote || ''}</span></p>
      <p>Nave/Localidad: <span class="ln">${h.nave || ''}</span></p>
      <div style="display:flex;gap:10px">${SVG_TANK}${SVG_BOX}</div>
      <table><tr><th>ITEM</th><th>BUENO</th><th>REGULAR</th><th>DEFICIENTE</th></tr>
      <tr><td colspan="4"><b>ISOTANQUE O CISTERNA</b></td></tr>${ISO.map(row).join('')}
      <tr><td colspan="4"><b>CONTENEDOR</b></td></tr>${CONT.map(row).join('')}</table>
      <p>COMENTARIOS: ${h.comentarios || ''}</p>
      <p>Rechazado ${h.resultado === 'Rechazado' ? '☑' : '☐'} Aprobado ${h.resultado === 'Aprobado' ? '☑' : '☐'}
      Inspeccionado Por: ${h.inspector || ''}</p>
      <p style="text-align:right;font-size:10px">Aprobado: 24/02/2020</p>
      </body></html>`
    await finishPrintHtml(html, formId)
  }

  const line = 'border-0 border-b border-black bg-transparent w-full outline-none'
  const radios = (it: string) => (
    <tr key={it}>
      <td className="border border-black px-2 text-left text-[12px]">{it.replace(' (contenedor)', '')}</td>
      {OPT.map((o) => (
        <td key={o} className="border border-black text-center w-16">
          <input type="radio" name={it} checked={h[it] === o} onChange={() => set(it, o)} />
        </td>
      ))}
    </tr>
  )

  return (
    <div className="bg-[#EDE8E0] p-4 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-5 max-w-[980px] mx-auto">
        <div className="flex justify-between items-start">
          <img src="/yazoo.png" className="h-10" alt="" />
          <div className="text-center font-bold text-sm">
            INSPECCION DE ISOTANQUES, CISTERNAS
            <br />
            Y CONTENEDORES (CAMION)
          </div>
          <div className="text-[10px] text-right">
            CODIGO: Y-FO-CC-018
            <br />
            REV.: 00
            <br />
            PAGINA: 1 de 1
            <br />
            Fecha <input className="w-24 bg-[#F3EFE8] border-b border-black" value={h.fecha} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-6 mt-4">
          <div className="space-y-2 text-sm">
            {[
              ['numero', 'No de Isotanque, Cisterna o Contenedor'],
              ['capacidad', 'Capacidad o Dimension:'],
              ['producto', 'Producto a cargar:'],
              ['lote', 'Lote del producto:'],
              ['nave', 'Nave/Localidad:'],
            ].map(([k, l]) => (
              <label key={k} className="block">
                {l}
                <input className={line} value={h[k] || ''} onChange={(e) => set(k, e.target.value)} />
              </label>
            ))}
          </div>
          <div>
            <div dangerouslySetInnerHTML={{ __html: SVG_TANK }} />
            <div dangerouslySetInnerHTML={{ __html: SVG_BOX }} />
          </div>
        </div>

        <table className="w-full border-collapse text-[12px] mt-3">
          <thead>
            <tr>
              <th className="border border-black">ITEM</th>
              {OPT.map((o) => (
                <th key={o} className="border border-black w-16">{o}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="border border-black text-center font-bold bg-[#EEE]">ISOTANQUE O CISTERNA</td>
            </tr>
            {ISO.map(radios)}
            <tr>
              <td colSpan={4} className="border border-black text-center font-bold bg-[#EEE]">CONTENEDOR</td>
            </tr>
            {CONT.map(radios)}
          </tbody>
        </table>

        <p className="text-sm mt-4">COMENTARIOS:</p>
        <input className={line} value={h.comentarios || ''} onChange={(e) => set('comentarios', e.target.value)} />
        <input className={line + ' mt-2'} value={h.com2 || ''} onChange={(e) => set('com2', e.target.value)} />

        <div className="flex justify-between mt-5 text-sm">
          <div className="flex gap-6">
            {['Rechazado', 'Aprobado'].map((o) => (
              <label key={o} className="flex gap-2 items-center">
                <input type="radio" name="resultado" checked={h.resultado === o} onChange={() => set('resultado', o)} />
                {o}
              </label>
            ))}
          </div>
          <label>
            Inspeccionado Por:
            <input className={line + ' w-48 ml-2'} value={h.inspector || ''} onChange={(e) => set('inspector', e.target.value)} />
          </label>
        </div>
        <p className="text-[10px] text-right mt-6">Aprobado: 24/02/2020</p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[980px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}