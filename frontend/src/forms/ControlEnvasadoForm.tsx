import { useEffect, useState } from 'react'

const KEY = 'form-y-fo-cc-004'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}
const H = [1, 2, 3, 4, 5, 6, 7, 8]

const BLOCKS: { g: string; rows: [string, string][] }[] = [
  {
    g: 'BPF',
    rows: [
      ['b1', 'EL PERSONAL DEL AREA DE ALIMENTACION DE ENVASES ¿TIENE SU EPP?'],
      ['b2', 'EN EL AREA DE LLENADO EL PERSONAL ¿TIENE TAPA BOCA, GORRO Y GUANTES?'],
      ['b3', '¿EL AREA DE LLENADO ESTA EN BUEN ESTADO DE ORDEN Y LIMPIEZA?'],
    ],
  },
  {
    g: 'SEG',
    rows: [
      ['grado1', 'GRADO ALC. (°GL):'],
      ['dureza', 'DUREZA (ppm)'],
    ],
  },
  {
    g: 'LLENADO',
    rows: [
      ['grado2', 'GRADO ALC. (°GL):'],
      ['color', 'COLOR:                    nm'],
      ['turb', 'TURBIDEZ (nTU):'],
      ['visc', 'VISCOSIDAD (cP):'],
      ['fuga', 'FUGA'],
      ['catado', 'CATADO'],
      ['pto', 'PTO DE LLENADO'],
      ['sincod', 'SIN CODIGO PREVIO'],
      ['presion', 'PRESION DE LOS FILTROS'],
      ['qr', 'CODIGO QR'],
      ['etiq', 'ETIQUETAS'],
    ],
  },
  {
    g: 'CODIG',
    rows: [
      ['fenv', 'FECHA DE ENVASADO'],
      ['henv', 'HORA DE ENVASADO'],
      ['loteh', 'LOTE'],
    ],
  },
  {
    g: 'ENV',
    rows: [
      ['estc', 'ESTADO DE CAJAS'],
      ['codc', 'CODIGO DE CAJA'],
      ['sell', 'SELLADO DE CAJAS'],
      ['dest', 'DESTINO'],
    ],
  },
]

export function printControlEnvasado(h: Record<string, any> = {}) {
  const v = (k: string) => h[k] || ''
  const logo = `${window.location.origin}/yazoo.png`
  const pv = (k: string) => H.map((n) => `<td>${v(k + '_' + n) || '&nbsp;'}</td>`).join('')
  const rows = BLOCKS.map((b) =>
    b.rows
      .map(
        ([k, l], i) =>
          `<tr>${
            i === 0
              ? `<td rowspan="${b.rows.length}" style="writing-mode:vertical-rl;transform:rotate(180deg);font-weight:700">${b.g}</td>`
              : ''
          }<td style="text-align:left">${l}</td>${pv(k)}<td>${v(k + '_obs') || ''}</td></tr>`,
      )
      .join(''),
  ).join('')

  const w = window.open('', '_blank', 'width=1200,height=800')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-004</title>
    <style>
      body{font-family:Arial;font-size:10px;color:#000;padding:12px}
      table{border-collapse:collapse;width:100%;table-layout:fixed}
      td,th{border:1px solid #000;padding:3px;vertical-align:middle}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
      @media print{body{padding:0} img{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body>
    <div class="hdr">
      <img src="${logo}" height="42" alt="Yazoo"/>
      <div style="text-align:center;font-weight:700;font-size:16px">CONTROL DE ENVASADO</div>
      <div style="text-align:right;font-size:10px">CODIGO: Y-FO-CC-004<br/>REV.: 06<br/>PAG.: 1 de 1</div>
    </div>
    <table>
      <tr><td>GRADO ALC. (°GL): ${v('esp_grado')}</td><td colspan="2">PRODUCTO: ${v('producto')}</td></tr>
      <tr><td>CAPACIDAD (ml): ${v('cap')}</td><td>LOTE DE ELABORACION: ${v('lote_elab')}</td><td>LINEA: ${v('linea')}</td></tr>
      <tr><td>COLOR: ${v('esp_color')} Abs / %T</td><td>LOTE: ${v('lote')}</td><td>FECHA: ${v('fecha')}</td></tr>
    </table>
    <table>
      <tr>
        <th></th><th>ARRANQUE DE LINEA / HORA DE INSPECCIÓN</th>
        ${H.map(() => '<th>HORA</th>').join('')}
        <th>OBSERVACIONES<br/>¿Existe NE de la producción anterior? ${h.ne === 'si' ? '☑ Sí' : '☐ Sí'} ${h.ne === 'no' ? '☑ No' : '☐ No'}</th>
      </tr>
      ${rows}
      <tr><td></td><td style="text-align:left"><b>ANALISTA/INSPECTOR</b></td>${pv('an')}<td></td></tr>
      <tr><td></td><td style="text-align:right">HORA FINAL</td>${pv('hf')}<td>Revisado por: ${v('revisado')}</td></tr>
    </table>
    </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
}

export default function ControlEnvasadoForm({ initialData, onCancel, onSave }: any) {
  const [h, setH] = useState<any>(() => ({ ...(initialData || {}) }))
  useEffect(() => {
    setH((p: any) => ({
      ...p,
      lote: initialData?.lote || initialData?.lot_number || p.lote || '',
      lot_number: initialData?.lot_number || initialData?.lote || p.lot_number || '',
      producto: initialData?.producto || p.producto || '',
    }))
  }, [initialData?.lote, initialData?.lot_number, initialData?.producto])
  const set = (k: string, v: string) => setH((p: any) => ({ ...p, [k]: v }))
  const v = (k: string) => h[k] || ''
  const save = () => {
    onSave?.(h)
  }
  const cell = (k: string) =>
    H.map((n) => (
      <td key={n} className="border border-black p-0 h-6">
        <input className="w-full h-6 text-center text-[10px] outline-none" value={v(`${k}_${n}`)} onChange={(e) => set(`${k}_${n}`, e.target.value)} />
      </td>
    ))

  const print = () => printControlEnvasado(h)

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-3 max-w-[1180px] mx-auto text-[10px]">
        <div className="flex justify-between items-start mb-2">
          <img src="/yazoo.png" className="h-9" alt="" />
          <p className="text-sm font-bold">CONTROL DE ENVASADO</p>
          <p className="text-right leading-3">CODIGO: Y-FO-CC-004<br />REV.: 06<br />PAG.: 1 de 1</p>
        </div>

        <table className="w-full border-collapse mb-0">
          <tbody>
            <tr>
              <td className="border border-black px-1 w-[28%]">GRADO ALC. (°GL): <input className="w-16 border-b border-black" value={v('esp_grado')} onChange={(e) => set('esp_grado', e.target.value)} /></td>
              <td className="border border-black px-1" colSpan={2}>PRODUCTO: <input className="w-40 border-b border-black" value={v('producto')} onChange={(e) => set('producto', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="border border-black px-1">CAPACIDAD (ml): <input className="w-16 border-b border-black" value={v('cap')} onChange={(e) => set('cap', e.target.value)} /></td>
              <td className="border border-black px-1">LOTE DE ELABORACION: <input className="w-24 border-b border-black" value={v('lote_elab')} onChange={(e) => set('lote_elab', e.target.value)} /></td>
              <td className="border border-black px-1">LINEA: <input className="w-16 border-b border-black" value={v('linea')} onChange={(e) => set('linea', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="border border-black px-1">COLOR: <input className="w-12 border-b border-black" value={v('esp_color')} onChange={(e) => set('esp_color', e.target.value)} /> Abs / %T</td>
              <td className="border border-black px-1">LOTE: <input className="w-24 border-b border-black" value={v('lote')} onChange={(e) => set('lote', e.target.value)} /></td>
              <td className="border border-black px-1">FECHA: <input className="w-24 border-b border-black" value={v('fecha')} onChange={(e) => set('fecha', e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black w-8" />
              <th className="border border-black text-left px-1">ARRANQUE DE LINEA / HORA DE INSPECCIÓN</th>
              {H.map((n) => (
                <th key={n} className="border border-black w-12">HORA</th>
              ))}
              <th className="border border-black w-36">
                OBSERVACIONES
                <div className="font-normal text-left">
                  ¿Existe NE de la producción anterior?
                  <label className="ml-1"><input type="radio" name="ne" checked={h.ne === 'si'} onChange={() => set('ne', 'si')} /> Si</label>
                  <label className="ml-1"><input type="radio" name="ne" checked={h.ne === 'no'} onChange={() => set('ne', 'no')} /> No</label>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {BLOCKS.map((b) =>
              b.rows.map(([k, l], i) => (
                <tr key={k}>
                  {i === 0 && (
                    <td className="border border-black font-bold text-center" rowSpan={b.rows.length} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      {b.g}
                    </td>
                  )}
                  <td className="border border-black px-1 text-left">{l}</td>
                  {cell(k)}
                  <td className="border border-black p-0">
                    <input className="w-full h-6 px-1" value={v(`${k}_obs`)} onChange={(e) => set(`${k}_obs`, e.target.value)} />
                  </td>
                </tr>
              ))
            )}
            <tr>
              <td className="border border-black" />
              <td className="border border-black px-1 text-left font-semibold">ANALISTA/INSPECTOR</td>
              {cell('an')}
              <td className="border border-black" />
            </tr>
            <tr>
              <td className="border border-black" />
              <td className="border border-black px-1 text-right">HORA FINAL</td>
              {cell('hf')}
              <td className="border border-black px-1">
                Revisado por: <input className="border-b border-black w-28" value={v('revisado')} onChange={(e) => set('revisado', e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[1180px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}