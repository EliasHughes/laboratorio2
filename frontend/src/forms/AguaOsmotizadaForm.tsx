import { useOfficialForm } from './useOfficialForm'

const today = () => new Date().toISOString().slice(0, 10)
const COLS = [1, 2, 3, 4, 5, 6]

const DEFAULTS: Record<string, any> = { fecha: today() }

export function printAguaOsmotizada(h: Record<string, any> = {}) {
  const v = (k: string) => h[k] || ''
  const pv = (k: string) => COLS.map((n) => `<td>${v(`${k}_${n}`) || '&nbsp;'}</td>`).join('')
  const w = window.open('', '_blank', 'width=1000,height=800')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-012</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:16px}
        table{border-collapse:collapse;width:100%;table-layout:fixed}
        th,td{border:1px solid #000;padding:4px;text-align:center;height:22px}
        .l{text-align:left}
        @media print{body{padding:0}}
      </style></head><body>
      <table style="border:none;margin-bottom:12px">
        <tr>
          <td style="border:none;width:120px"><img src="${location.origin}/yazoo.png" height="48"/></td>
          <td style="border:none;text-align:center;font-weight:700">ANALISIS DE CALIDAD DEL AGUA</td>
          <td style="border:none;width:140px;text-align:right;font-size:10px">CODIGO: Y-FO-CC-012<br/>REV.: 02<br/>PAG.: 1 de 1</td>
        </tr>
      </table>
      <p>Planta de Agua: ${v('planta') || '____________'}</p>
      <table>
        <tr><th style="width:22%">PARAMETROS</th><th style="width:16%">ESPECIFICACIONES</th>
          ${COLS.map((n) => `<th>${n}</th>`).join('')}</tr>
        <tr><td colspan="2">FECHA</td>${COLS.map(() => `<td>${h.fecha}</td>`).join('')}</tr>
        <tr><td colspan="2">HORA DE ENTREGA DE MUESTRA</td>${pv('hora1')}</tr>
        <tr><td colspan="2">OPERADOR</td>${pv('op1')}</tr>
        <tr><td rowspan="5"><b>AGUA<br/>OSMOTIZADA</b></td>
            <td class="l">CONDUCTIVIDAD ELÉCTRICA (µs/cm)<br/>&lt; 10 µS/cm</td>${pv('ce')}</tr>
        <tr><td class="l">pH, adim<br/>4.5 - 7.5</td>${pv('ph')}</tr>
        <tr><td class="l">DUREZA (ppm)<br/>0 - 1 ppm</td>${pv('dureza')}</tr>
        <tr><td class="l">*TDS (ppm)<br/>&lt; 500 ppm</td>${pv('tds')}</tr>
        <tr><td class="l">TURBIDEZ (NTU)<br/>&lt; 5 NTU</td>${pv('ntu')}</tr>
        <tr><td colspan="2">ANALISTA</td>${pv('an1')}</tr>
        <tr><td colspan="2">HORA DE ENTREGA DE RESULTADOS</td>${pv('hr1')}</tr>
        <tr><td colspan="2">OBSERVACIONES</td>${pv('obs1')}</tr>
      </table>
      <table style="margin-top:14px">
        <tr><td colspan="2" style="width:38%">HORA DE ENTREGA DE MUESTRA</td>${pv('hora2')}</tr>
        <tr><td colspan="2">OPERADOR</td>${pv('op2')}</tr>
        <tr><td>CISTERNA</td><td class="l">Cloro (ppm)<br/>1 - 4 ppm</td>${pv('cisterna')}</tr>
        <tr><td>FILTRO DE CARBÓN</td><td class="l">Cloro (ppm)<br/>0 ppm</td>${pv('carbon')}</tr>
        <tr><td colspan="2">ANALISTA</td>${pv('an2')}</tr>
        <tr><td colspan="2">HORA DE ENTREGA DE RESULTADOS</td>${pv('hr2')}</tr>
        <tr><td colspan="2">OBSERVACIONES</td>${pv('obs2')}</tr>
      </table>
      <p style="font-size:10px">*TDS = Sólidos Totales Disueltos</p>
      <p style="font-size:10px;display:flex;justify-content:space-between"><span>Y-FO-CS-001 REV.:01</span><span>Aprobado: 19/08/2026</span></p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
}

export default function AguaOsmotizadaForm({ initialData, onCancel, onSave }: any) {
  const { f: h, set } = useOfficialForm(DEFAULTS, initialData)

  const save = () => {
    onSave?.({ ...h, fecha: h.fecha || today() })
  }

  const v = (k: string) => h[k] || ''
  const inp = (k: string) => (
    <input className="w-full h-8 bg-transparent text-center text-xs outline-none" value={v(k)} onChange={(e) => set(k, e.target.value)} />
  )
  const tds = (k: string) => COLS.map((n) => <td key={n} className="border border-black h-8 p-0">{inp(`${k}_${n}`)}</td>)
  const print = () => printAguaOsmotizada(h)

  return (
    <div className="bg-[#EDE8E0] p-4 max-h-[80vh] overflow-auto text-[#1A120E]">
      <div className="bg-white p-5 max-w-[980px] mx-auto">
        <div className="flex justify-between items-start mb-4">
          <img src="/yazoo.png" className="h-11" alt="" />
          <p className="text-sm font-semibold">ANALISIS DE CALIDAD DEL AGUA</p>
          <p className="text-[10px] text-right leading-4">CODIGO: Y-FO-CC-012<br/>REV.: 02<br/>PAG.: 1 de 1</p>
        </div>
        <p className="text-sm mb-2">
          Planta de Agua:{' '}
          <input className="border-0 border-b border-black w-64 bg-transparent" value={v('planta')} onChange={(e) => set('planta', e.target.value)} />
        </p>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="border border-black w-[22%] py-1">PARAMETROS</th>
              <th className="border border-black w-[16%]">ESPECIFICACIONES</th>
              {COLS.map((n) => <th key={n} className="border border-black">{n}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black text-center" colSpan={2}>FECHA</td>
              {COLS.map((n) => <td key={n} className="border border-black text-center text-[10px]">{h.fecha}</td>)}
            </tr>
            <tr><td className="border border-black text-center" colSpan={2}>HORA DE ENTREGA DE MUESTRA</td>{tds('hora1')}</tr>
            <tr><td className="border border-black text-center" colSpan={2}>OPERADOR</td>{tds('op1')}</tr>
            <tr>
              <td className="border border-black text-center font-bold align-middle" rowSpan={5}>AGUA<br/>OSMOTIZADA</td>
              <td className="border border-black px-1">CONDUCTIVIDAD ELÉCTRICA (µs/cm)<br/>&lt; 10 µS/cm</td>{tds('ce')}
            </tr>
            <tr><td className="border border-black px-1">pH, adim<br/>4.5 - 7.5</td>{tds('ph')}</tr>
            <tr><td className="border border-black px-1">DUREZA (ppm)<br/>0 - 1 ppm</td>{tds('dureza')}</tr>
            <tr><td className="border border-black px-1">*TDS (ppm)<br/>&lt; 500 ppm</td>{tds('tds')}</tr>
            <tr><td className="border border-black px-1">TURBIDEZ (NTU)<br/>&lt; 5 NTU</td>{tds('ntu')}</tr>
            <tr><td className="border border-black text-center" colSpan={2}>ANALISTA</td>{tds('an1')}</tr>
            <tr><td className="border border-black text-center" colSpan={2}>HORA DE ENTREGA DE RESULTADOS</td>{tds('hr1')}</tr>
            <tr><td className="border border-black text-center h-10" colSpan={2}>OBSERVACIONES</td>{tds('obs1')}</tr>
          </tbody>
        </table>
        <table className="w-full border-collapse text-[11px] mt-4">
          <tbody>
            <tr><td className="border border-black text-center w-[22%]" colSpan={2}>HORA DE ENTREGA DE MUESTRA</td>{tds('hora2')}</tr>
            <tr><td className="border border-black text-center" colSpan={2}>OPERADOR</td>{tds('op2')}</tr>
            <tr>
              <td className="border border-black text-center font-semibold w-[22%]">CISTERNA</td>
              <td className="border border-black w-[16%] px-1">Cloro (ppm)<br/>1 - 4 ppm</td>{tds('cisterna')}
            </tr>
            <tr>
              <td className="border border-black text-center font-semibold">FILTRO DE CARBÓN</td>
              <td className="border border-black px-1">Cloro (ppm)<br/>0 ppm</td>{tds('carbon')}
            </tr>
            <tr><td className="border border-black text-center" colSpan={2}>ANALISTA</td>{tds('an2')}</tr>
            <tr><td className="border border-black text-center" colSpan={2}>HORA DE ENTREGA DE RESULTADOS</td>{tds('hr2')}</tr>
            <tr><td className="border border-black text-center h-10" colSpan={2}>OBSERVACIONES</td>{tds('obs2')}</tr>
          </tbody>
        </table>
        <p className="text-[10px] mt-2">*TDS = Sólidos Totales Disueltos</p>
        <p className="text-[10px] flex justify-between mt-4"><span>Y-FO-CS-001 REV.:01</span><span>Aprobado: 19/08/2026</span></p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[980px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}