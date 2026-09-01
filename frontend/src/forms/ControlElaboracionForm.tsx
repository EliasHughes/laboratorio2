import { useState } from 'react'

const KEY = 'form-y-fo-cc-009'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const COLS = [1, 2, 3, 4]
const PARAMS = [
  ['fecha', 'FECHA', true],
  ['hora_muestra', 'HORA DE ENTREGA DE MUESTRA', true],
  ['operador', 'OPERADOR', true],
  ['tanque', 'TANQUE', true],
  ['volumen', 'VOLUMEN, L', true],
  ['grado_dir', 'GRADO DIRECTO, °GL', false],
  ['grado_dest', 'GRADO DESTILADO, °GL', false],
  ['ph', 'pH', false],
  ['color', 'COLOR, %T - Abs  Long. Onda nm', false],
  ['densidad', 'DENSIDAD', false],
  ['visc', 'VISCOSIDAD, cP', false],
  ['azucar', 'AZUCAR TOTAL, g/L', false],
  ['acidez', 'ACIDEZ, como acido acetico mg/100ml AA', false],
  ['dureza', 'DUREZA, ppm', false],
  ['taninos', 'TANINOS, mg/100ml AA', false],
  ['turbidez', 'TURBIDEZ, nTu', false],
  ['aldehidos', 'ALDEHIDOS', false],
  ['metanol', 'METANOL', false],
  ['fusel', 'FUSEL TOTAL (ALCOHOLES SUPERIORES)', false],
  ['esteres', 'ESTERES', false],
  ['furfural', 'FURFURAL', false],
  ['cong', 'CONGENERES TOTALES', false],
  ['aspecto', 'ASPECTO', false],
  ['olor', 'OLOR', false],
  ['sabor', 'SABOR', false],
  ['analista', 'ANALISTA', true],
  ['hora_res', 'HORA DE ENTREGA DE RESULTADOS', true],
] as const

export function printControlElaboracion(h: Record<string, any> = {}) {
  const v = (k: string) => h[k] || ''
  const pv = (k: string) => COLS.map((n) => `<td>${v(`${k}_${n}`) || '&nbsp;'}</td>`).join('')
  const w = window.open('', '_blank', 'width=1100,height=900')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-009</title>
    <style>body{font-family:Arial;font-size:11px;padding:12px}table{border-collapse:collapse;width:100%}
    td,th{border:1px solid #000;padding:3px;text-align:center}</style></head><body>
    <h3 style="text-align:center">CONTROL DE ELABORACION DE PRODUCTOS ENVEJECIDOS Y DESTILADOS</h3>
    <p>PRODUCTO: ${v('producto')} &nbsp; ${h.tipo === 'ENVASADO' ? '☑' : '☐'} ENVASADO &nbsp; ${h.tipo === 'GRANEL' ? '☑' : '☐'} GRANEL</p>
    <p>NOMBRE DEL CLIENTE: ${v('cliente')} &nbsp; LOTE: ${v('lote')} &nbsp; LOTE DE ENVASADO: ${v('lote_env')}</p>
    <table><tr><th>PARAMETROS</th><th>ESPECIFICACION</th><th>INCERTIDUMBRE</th>
      <th>MEZCLADO</th><th>MEZCLADO</th><th>MEZCLADO</th><th>MEZCLADO</th></tr>
    ${PARAMS.map(([k, l]) => `<tr><td style="text-align:left">${l}</td><td>${v(k + '_esp') || ''}</td><td>${v(k + '_inc') || ''}</td>${pv(k)}</tr>`).join('')}
    <tr><td>OBSERVACIONES</td><td colspan="6">${v('obs')}</td></tr></table>
    <p>APROBADO POR: ${v('aprobado')}</p>
    <p>VERIFICACION PREVIO AL DESPACHO — FECHA: ${v('ver_fecha')} GRADO: ${v('ver_grado')} COLOR: ${v('ver_color')} VERIFICADO POR: ${v('ver_por')}</p>
    <p style="font-size:10px">FO-CS-001 REV.:01 &nbsp; NOTA: la verificacion solo a ser realizada en graneles &nbsp; Aprobado: 15/07/2026</p>
    </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

export default function ControlElaboracionForm({ onCancel, onSave, initialData }: any) {
  const saved = { ...(initialData || {}) }
  const [h, setH] = useState<any>(saved)
  const role = (localStorage.getItem('role') || localStorage.getItem('yazoo_role') || '').toLowerCase()
  const isAdmin = role === 'admin' || role === 'administrador'
  const locked = !!saved._saved && !isAdmin

  const set = (k: string, v: string) => {
    if (locked && (k.startsWith('fecha') || k === 'ver_fecha')) return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const v = (k: string) => h[k] || ''
  const save = () => {
    const d = { ...h, _saved: true }
    onSave?.(d)
  }

  const cells = (k: string) =>
    COLS.map((n) => (
      <td key={n} className="border border-black p-0">
        <input
          className="w-full h-7 text-center text-[11px] bg-transparent outline-none"
          value={v(`${k}_${n}`)}
          readOnly={locked && k === 'fecha'}
          onChange={(e) => set(`${k}_${n}`, e.target.value)}
        />
      </td>
    ))

  const print = () => printControlElaboracion(h)

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-4 max-w-[1100px] mx-auto">
        <div className="flex justify-between items-start mb-3">
          <img src="/yazoo.png" className="h-10" alt="" />
          <div className="text-center font-bold text-sm">
            CONTROL DE ELABORACION DE
            <br />
            PRODUCTOS ENVEJECIDOS
            <br />
            Y DESTILADOS
          </div>
          <div className="text-[10px] text-right">
            CODIGO: Y-FO-CC-009
            <br />
            REV.: 06
            <br />
            PAG.: 1 de 1
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm mb-2">
          <label>
            PRODUCTO <input className="border-b border-black w-40" value={v('producto')} onChange={(e) => set('producto', e.target.value)} />
          </label>
          {['ENVASADO', 'GRANEL'].map((t) => (
            <label key={t} className="flex items-center gap-1">
              <input type="radio" name="tipo" checked={h.tipo === t} onChange={() => set('tipo', t)} /> {t}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm mb-3">
          <label>
            NOMBRE DEL CLIENTE <input className="border-b border-black w-48" value={v('cliente')} onChange={(e) => set('cliente', e.target.value)} />
          </label>
          <label>
            LOTE <input className="border-b border-black w-28" value={v('lote')} onChange={(e) => set('lote', e.target.value)} />
          </label>
          <label>
            LOTE DE ENVASADO: <input className="border-b border-black w-28" value={v('lote_env')} onChange={(e) => set('lote_env', e.target.value)} />
          </label>
        </div>

        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="border border-black">PARAMETROS</th>
              <th className="border border-black w-24">ESPECIFICACION</th>
              <th className="border border-black w-24">INCERTIDUMBRE</th>
              {COLS.map((n) => (
                <th key={n} className="border border-black">MEZCLADO</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARAMS.map(([k, l, slash]) => (
              <tr key={k}>
                <td className="border border-black px-1 text-left">{l}</td>
                <td className="border border-black p-0 bg-[#F7F4EF]">
                  {slash ? <div className="h-7 bg-[linear-gradient(to_top_right,transparent_49%,#000_50%,transparent_51%)]" /> : (
                    <input className="w-full h-7 text-center bg-transparent" value={v(`${k}_esp`)} onChange={(e) => set(`${k}_esp`, e.target.value)} />
                  )}
                </td>
                <td className="border border-black p-0 bg-[#F7F4EF]">
                  {slash ? <div className="h-7 bg-[linear-gradient(to_top_right,transparent_49%,#000_50%,transparent_51%)]" /> : (
                    <input className="w-full h-7 text-center bg-transparent" value={v(`${k}_inc`)} onChange={(e) => set(`${k}_inc`, e.target.value)} />
                  )}
                </td>
                {cells(k)}
              </tr>
            ))}
            <tr>
              <td className="border border-black px-1 font-semibold">OBSERVACIONES</td>
              <td className="border border-black p-0" colSpan={6}>
                <input className="w-full h-10 px-1 bg-transparent" value={v('obs')} onChange={(e) => set('obs', e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex gap-6 mt-4 text-sm">
          <label>
            APROBADO POR:
            <input className="border-b border-black w-48 ml-2" value={v('aprobado')} onChange={(e) => set('aprobado', e.target.value)} />
          </label>
          <div className="border border-black p-2 flex-1">
            <p className="font-semibold text-center text-[11px]">VERIFICACION DE PRODUCTO PREVIO AL DESPACHO</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label>
                FECHA:
                <input
                  className={`border-b border-black w-28 ${locked ? 'bg-[#F3EFE8]' : ''}`}
                  value={v('ver_fecha')}
                  readOnly={locked}
                  onChange={(e) => set('ver_fecha', e.target.value)}
                />
              </label>
              <label>
                VERIFICADO POR: <input className="border-b border-black w-36" value={v('ver_por')} onChange={(e) => set('ver_por', e.target.value)} />
              </label>
              <label>
                GRADO: <input className="border-b border-black w-24" value={v('ver_grado')} onChange={(e) => set('ver_grado', e.target.value)} />
              </label>
              <label>
                COLOR <input className="border-b border-black w-24" value={v('ver_color')} onChange={(e) => set('ver_color', e.target.value)} />
              </label>
            </div>
            <p className="text-[10px] mt-1">NOTA: la verificacion solo a ser realizada en graneles</p>
          </div>
        </div>
        <p className="text-[10px] flex justify-between mt-3">
          <span>FO-CS-001 REV.:01</span>
          <span>Aprobado: 15/07/2026</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[1100px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}