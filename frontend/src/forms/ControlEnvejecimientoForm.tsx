import { useState } from 'react'

const KEY = 'form-envejecimiento'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}
const COLS = [1, 2, 3, 4, 5]
const ROWS: [string, string, boolean][] = [
  ['fecha', 'FECHA', true],
  ['operador', 'OPERADOR', true],
  ['grado', 'GRADO ALCOHOLICO, °GL', false],
  ['ph', 'pH', false],
  ['acidez', 'ACIDEZ TOTAL como ácido acético mg/100ml AA', false],
  ['color', 'COLOR, %T a 450nm', false],
  ['taninos', 'TANINOS, mg ac tanico/100ml AA', false],
  ['aldehidos', 'ALDEHIDOS', false],
  ['metanol', 'METANOL', false],
  ['fusel', 'FUSEL TOTAL (ALCOHOLES SUPERIORES)', false],
  ['esteres', 'ESTERES', false],
  ['cong', 'CONGENERES TOTALES', false],
  ['furfural', 'FURFURAL', false],
  ['aspecto', 'ASPECTO', false],
  ['olor', 'OLOR', false],
  ['sabor', 'SABOR', false],
  ['analista', 'ANALISTA', false],
  ['obs', 'OBSERVACIÓN', false],
]

export default function ControlEnvejecimientoForm({ onCancel, onSave }: any) {
  const [h, setH] = useState<any>(() => ({ fecha_inicio: load().fecha_inicio || today(), ...load() }))
  const set = (k: string, v: string) => {
    if (k === 'fecha_inicio') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const v = (k: string) => h[k] || ''
  const save = () => {
    const d = { ...h, fecha_inicio: h.fecha_inicio || today() }
    localStorage.setItem(KEY, JSON.stringify(d))
    onSave?.(d)
  }
  const cells = (k: string) =>
    COLS.map((n) => (
      <td key={n} className="border border-black p-0">
        <input className="w-full h-7 text-center text-[11px] outline-none" value={v(`${k}_${n}`)} onChange={(e) => set(`${k}_${n}`, e.target.value)} />
      </td>
    ))

  const print = () => {
    const logo = `${window.location.origin}/yazoo.png`
    const pv = (k: string) => COLS.map((n) => `<td>${v(k + '_' + n) || '&nbsp;'}</td>`).join('')
    const w = window.open('', '_blank', 'width=1100,height=900')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Envejecimiento</title>
      <style>body{font-family:Arial;font-size:11px;padding:12px}table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #000;padding:3px;text-align:center}</style></head><body>
      <div style="display:flex;justify-content:space-between"><img src="${logo}" height="40"/>
      <b>CONTROL DE PROCESO ENVEJECIMIENTO</b><span></span></div>
      <p>N° LOTE/N° SERIE: ${v('lote')} SERIE: ${v('serie')} FECHA DE INICIO: ${h.fecha_inicio} FECHA DE VACIADO: ${v('fecha_vaciado')}</p>
      <table><tr><th>PARAMETROS</th><th>ESPECIFICACION</th>
        ${COLS.map((n) => `<th>ENVEJECIMIENTO ${n}</th>`).join('')}</tr>
      ${ROWS.map(([k, l, slash]) => `<tr><td style="text-align:left">${l}</td><td>${slash ? '' : v(k + '_esp')}</td>${pv(k)}</tr>`).join('')}
      </table>
      <p>Nota: los congenericos se reportan en mg/100ml AA</p>
      <p style="font-size:10px">Y-FO-CS-001 REV. 01</p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-4 max-w-[1100px] mx-auto text-[11px]">
        <div className="flex justify-between items-start mb-3">
          <img src="/yazoo.png" className="h-10" alt="" />
          <p className="text-center font-bold text-sm">
            CONTROL DE PROCESO
            <br />
            ENVEJECIMIENTO
          </p>
          <p className="text-[10px] text-right">PAG.: 1 de 1</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            N° LOTE/N° SERIE: <input className="border-b border-black w-40" value={v('lote')} onChange={(e) => set('lote', e.target.value)} />
          </label>
          <label>
            FECHA DE INICIO <input className="border-b border-black w-32 bg-[#F3EFE8]" value={h.fecha_inicio} readOnly />
          </label>
          <label>
            SERIE: <input className="border-b border-black w-40" value={v('serie')} onChange={(e) => set('serie', e.target.value)} />
          </label>
          <label>
            FECHA DE VACIADO <input className="border-b border-black w-32" placeholder="dd/mm/aaaa" value={v('fecha_vaciado')} onChange={(e) => set('fecha_vaciado', e.target.value)} />
          </label>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black">PARAMETROS</th>
              <th className="border border-black w-28">ESPECIFICACION</th>
              {COLS.map((n) => (
                <th key={n} className="border border-black">
                  ENVEJECIMIENTO {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, l, slash]) => (
              <tr key={k}>
                <td className="border border-black px-1 text-left">{l}</td>
                <td className="border border-black p-0 bg-[#F7F4EF]">
                  {slash ? (
                    <div className="h-7 bg-[linear-gradient(to_top_right,transparent_49%,#000_50%,transparent_51%)]" />
                  ) : (
                    <input className="w-full h-7 text-center" value={v(k + '_esp')} onChange={(e) => set(k + '_esp', e.target.value)} />
                  )}
                </td>
                {cells(k)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] mt-2">Nota: los congenericos se reportan en mg/100ml AA</p>
        <p className="text-[10px] mt-2">Y-FO-CS-001 REV. 01</p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[1100px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}