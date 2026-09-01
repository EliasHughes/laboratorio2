import { useState } from 'react'

const KEY = 'form-y-fo-cc-011'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}
const COLS = [1, 2, 3, 4, 5, 6]

export default function RecepcionGranelForm({ onCancel, onSave, initialData }: any) {
  const [h, setH] = useState<any>(() => ({
    fecha_doc: today(),
    mes: today().slice(0, 7),
    ...(initialData || {}),
  }))
  const set = (k: string, v: string) => {
    if (k === 'fecha_doc') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const v = (k: string) => h[k] || ''
  const save = () => {
    const d = { ...h, fecha_doc: h.fecha_doc || today() }
    onSave?.(d)
  }

  const inp = (k: string) => (
    <input
      className="w-full h-7 bg-transparent text-center text-[11px] outline-none"
      value={v(k)}
      onChange={(e) => set(k, e.target.value)}
    />
  )
  const cells = (k: string) =>
    COLS.map((n) => (
      <td key={n} className="border border-black p-0 h-7">
        {inp(`${k}_${n}`)}
      </td>
    ))
  const pv = (k: string) => COLS.map((n) => `<td>${v(`${k}_${n}`) || '&nbsp;'}</td>`).join('')

  const print = () => {
    const d = { ...h, fecha_doc: h.fecha_doc || today() }
    const w = window.open('', '_blank', 'width=1100,height=800')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-011</title>
      <style>
        body{font-family:Arial;font-size:11px;padding:14px;color:#000}
        table{border-collapse:collapse;width:100%;table-layout:fixed}
        th,td{border:1px solid #000;padding:3px;text-align:center;height:20px}
        .l{text-align:left;padding-left:6px}
        @media print{body{padding:0}}
      </style></head><body>
      <table style="border:none;margin-bottom:8px">
        <tr>
          <td style="border:none;width:110px"><img src="${location.origin}/yazoo.png" height="44"/></td>
          <td style="border:none;text-align:center;font-weight:700;font-size:16px">RECEPCIÓN PRODUCTOS A GRANEL</td>
          <td style="border:none;width:150px;text-align:right;font-size:10px">CODIGO: Y-FO-CC-011<br/>REV.: 03<br/>PAG.: 1 de 1</td>
        </tr>
      </table>
      <p>PRODUCTO: ${d.producto || '____________'} &nbsp;&nbsp; MES: ${d.mes || ''}</p>
      <table>
        <tr><td class="l" colspan="2">FECHA</td>${pv('fecha')}</tr>
        <tr><td class="l" colspan="2">PROVEEDOR</td>${pv('proveedor')}</tr>
        <tr><td class="l" colspan="2">N° CONTENEDOR</td>${pv('contenedor')}</tr>
        <tr><td class="l" colspan="2">GRADO ALCOHOLICO DESPACHADO (SEGUN COA)</td>${pv('grado_coa')}</tr>
        <tr><td class="l" rowspan="2">LOTE</td><td class="l">PROVEEDOR</td>${pv('lote_prov')}</tr>
        <tr><td class="l">YAZOO</td>${pv('lote_yazoo')}</tr>
        <tr><td class="l" colspan="2">TANQUE RECEPTOR N°</td>${pv('tanque')}</tr>
        <tr><td class="l" colspan="2">VOLUMEN RECIBIDO (L)</td>${pv('volumen')}</tr>
        <tr><td rowspan="10" style="writing-mode:vertical-rl;transform:rotate(180deg);font-weight:700;width:28px">ESPECIFICACIONES</td>
            <td class="l">GRADO ALCOHÓLICO MEDIDO</td>${pv('grado_med')}</tr>
        <tr><td class="l">PH</td>${pv('ph')}</tr>
        <tr><td class="l">ACETALDEHIDO</td>${pv('acet')}</tr>
        <tr><td class="l">METANOL</td>${pv('metanol')}</tr>
        <tr><td class="l">FUSELES</td>${pv('fuseles')}</tr>
        <tr><td class="l">ESTERES</td>${pv('esteres')}</tr>
        <tr><td class="l">FURFURAL</td>${pv('furfural')}</tr>
        <tr><td class="l">TOTALES</td>${pv('totales')}</tr>
        <tr><td class="l">ACIDEZ TOTAL</td>${pv('acidez')}</tr>
        <tr><td class="l">TANINOS</td>${pv('taninos')}</tr>
        <tr><td class="l" colspan="2">COLOR %T 450nm</td>${pv('color')}</tr>
        <tr><td class="l" colspan="2">APROBADO/RECHAZADO</td>${pv('dictamen')}</tr>
        <tr><td class="l" colspan="2">FIRMA CALIDAD</td>${pv('firma')}</tr>
        <tr><td class="l" colspan="2">OBSERVACIONES</td>${pv('obs')}</tr>
      </table>
      <p style="font-size:10px;display:flex;justify-content:space-between;margin-top:10px">
        <span>Y-FO-CS-001 REV.: 01</span><span>Aprobado: 03/06/2020</span>
      </p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  const lab = 'border border-black px-2 text-left text-[11px]'

  return (
    <div className="bg-[#EDE8E0] p-4 max-h-[80vh] overflow-auto text-[#1A120E]">
      <div className="bg-white p-5 max-w-[1100px] mx-auto">
        <div className="flex justify-between items-start mb-4">
          <img src="/yazoo.png" className="h-11" alt="" />
          <p className="text-[15px] font-bold tracking-wide mt-2">RECEPCIÓN PRODUCTOS A GRANEL</p>
          <p className="text-[10px] text-right leading-4">
            CODIGO: Y-FO-CC-011
            <br />
            REV.: 03
            <br />
            PAG.: 1 de 1
          </p>
        </div>

        <div className="flex gap-8 text-sm mb-3">
          <label>
            PRODUCTO:{' '}
            <input className="border-0 border-b border-black w-64 bg-transparent" value={v('producto')} onChange={(e) => set('producto', e.target.value)} />
          </label>
          <label>
            MES:{' '}
            <input className="border-0 border-b border-black w-36 bg-[#F3EFE8]" value={v('mes')} readOnly />
          </label>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <tbody>
            <tr>
              <td className={lab} colSpan={2}>FECHA</td>
              {cells('fecha')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>PROVEEDOR</td>
              {cells('proveedor')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>N° CONTENEDOR</td>
              {cells('contenedor')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>GRADO ALCOHOLICO DESPACHADO (SEGUN COA)</td>
              {cells('grado_coa')}
            </tr>
            <tr>
              <td className={`${lab} font-semibold w-[90px]`} rowSpan={2}>
                LOTE
              </td>
              <td className={`${lab} w-[130px]`}>PROVEEDOR</td>
              {cells('lote_prov')}
            </tr>
            <tr>
              <td className={lab}>YAZOO</td>
              {cells('lote_yazoo')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>TANQUE RECEPTOR N°</td>
              {cells('tanque')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>VOLUMEN RECIBIDO (L)</td>
              {cells('volumen')}
            </tr>
            <tr>
              <td className={`${lab} font-bold text-center align-middle w-8`} rowSpan={10} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                ESPECIFICACIONES
              </td>
              <td className={lab}>GRADO ALCOHÓLICO MEDIDO</td>
              {cells('grado_med')}
            </tr>
            <tr><td className={lab}>PH</td>{cells('ph')}</tr>
            <tr><td className={lab}>ACETALDEHIDO</td>{cells('acet')}</tr>
            <tr><td className={lab}>METANOL</td>{cells('metanol')}</tr>
            <tr><td className={lab}>FUSELES</td>{cells('fuseles')}</tr>
            <tr><td className={lab}>ESTERES</td>{cells('esteres')}</tr>
            <tr><td className={lab}>FURFURAL</td>{cells('furfural')}</tr>
            <tr><td className={lab}>TOTALES</td>{cells('totales')}</tr>
            <tr><td className={lab}>ACIDEZ TOTAL</td>{cells('acidez')}</tr>
            <tr><td className={lab}>TANINOS</td>{cells('taninos')}</tr>
            <tr>
              <td className={lab} colSpan={2}>COLOR %T 450nm</td>
              {cells('color')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>APROBADO/RECHAZADO</td>
              {cells('dictamen')}
            </tr>
            <tr>
              <td className={lab} colSpan={2}>FIRMA CALIDAD</td>
              {cells('firma')}
            </tr>
            <tr>
              <td className={`${lab} h-12`} colSpan={2}>OBSERVACIONES</td>
              {cells('obs')}
            </tr>
          </tbody>
        </table>

        <p className="text-[10px] flex justify-between mt-4">
          <span>Y-FO-CS-001 REV.: 01</span>
          <span>Aprobado: 03/06/2020</span>
        </p>
      </div>

      <div className="flex justify-end gap-2 mt-3 max-w-[1100px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border border-black px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}