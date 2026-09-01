import { useState } from 'react'

const KEY = 'form-y-fo-cc-008-pulpa'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const SENSOR = [
  ['color', 'Color', 'Característico de la fruta, uniforme', 'Evaluacion Sensorial'],
  ['olor', 'Olor', 'Característico, sin olores extraños', 'Evaluacion Sensorial'],
  ['sabor', 'Sabor', 'Característico, sin sabores anómalos', 'Evaluacion Sensorial'],
  ['apariencia', 'Apariencia', 'Libre de materias extrañas visibles', 'Inspeccion Visual'],
  ['textura', 'Textura', 'Homogénea, sin grumos anormales', 'Evaluacion Sensorial'],
]
const FISICO = [
  ['brix', 'Solidos Solubles °BRIX', 'Según Fruta', 'IFU N°08'],
  ['ph', 'pH', '2.5–4.5', 'IFU N°11'],
  ['acidez', 'Acidez (% acido citrico)', '0.3–3.8', 'IFU N°03'],
  ['densidad', 'Densidad relativa', '≥1.0520 - 1.0549', 'IFU N° 01a'],
  ['visc', 'Viscosidad', 'cP', 'IFU N° 84'],
  ['azucar', 'Azucar Total', '(g/L)', 'IFU N° 67'],
  ['temp', 'Temperatura', '20°C', 'Termometro'],
]

export default function RecepcionPulpaForm({ onCancel, onSave, initialData }: any) {
  const saved = { ...(initialData || {}) }
  const [h, setH] = useState<any>(saved)
  const role = (localStorage.getItem('role') || '').toLowerCase()
  const locked = !!saved._saved && role !== 'admin'
  const set = (k: string, v: any) => {
    if (locked && (k === 'fecha_rec' || k === 'fecha_muestra')) return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const v = (k: string) => h[k] || ''
  const save = () => {
    const d = { ...h, _saved: true }
    onSave?.(d)
  }

  const print = () => {
    const w = window.open('', '_blank', 'width=1000,height=900')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-008</title>
      <style>body{font-family:Arial;font-size:11px;padding:14px}table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #000;padding:4px}</style></head><body>
      <h3 style="text-align:center">CERTIFICADO DE ANALISIS<br/>MATERIA PRIMA<br/>RECEPCION DE PULPAS</h3>
      <p>MATERIA PRIMA: ${v('materia')} &nbsp; TIPO DE FRUTA: ${v('fruta')}</p>
      <p>PROVEEDOR: ${v('proveedor')} &nbsp; PAIS DE ORIGEN: ${v('pais')}</p>
      <p>No. LOTE: ${v('lote')} &nbsp; FECHA DE RECEPCION: ${v('fecha_rec')} &nbsp; FECHA DE MUESTREO: ${v('fecha_muestra')}</p>
      <table><tr><th>PARAMETRO</th><th>CRITERIO</th><th>METODO</th><th>RESULTADO</th><th>OBS</th><th>ANALISTA</th></tr>
      ${SENSOR.map(([k, n, c, m]) => `<tr><td>${n}</td><td>${c}</td><td>${m}</td><td>${v(k) || ''}</td><td>${v(k + '_obs')}</td><td>${v(k + '_an')}</td></tr>`).join('')}
      </table>
      <p><b>ANALISIS FISICOQUIMICO</b></p>
      <table><tr><th>PARAMETRO</th><th>LIMITE</th><th>METODO</th><th>RESULTADO</th><th>OBS</th><th>ANALISTA</th></tr>
      ${FISICO.map(([k, n, l, m]) => `<tr><td>${n}</td><td>${l}</td><td>${m}</td><td>${v(k)}</td><td>${v(k + '_obs')}</td><td>${v(k + '_an')}</td></tr>`).join('')}
      </table>
      <p>APROBADO POR: ${v('aprobado')}</p>
      <p style="font-size:10px">Y-FO-CS-001 REV. 01 &nbsp; Aprobado: 30/04/2026</p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  const box = 'border border-black'

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-4 max-w-[980px] mx-auto text-[12px]">
        <div className="flex justify-between">
          <img src="/yazoo.png" className="h-10" alt="" />
          <div className="text-center font-bold">
            CERTIFICADO DE ANALISIS
            <br />
            MATERIA PRIMA
            <br />
            RECEPCION DE PULPAS
          </div>
          <div className="text-[10px] text-right">
            CODIGO: Y-FO-CC-008
            <br />
            REV.: 01
            <br />
            PAGINA 1 de 1
          </div>
        </div>

        <table className="w-full border-collapse mt-3">
          <tbody>
            <tr>
              <td className={`${box} px-2 w-40 font-semibold`}>MATERIA PRIMA:</td>
              <td className={`${box} px-2`} colSpan={3}>
                {['PULPA CONGELADA', 'PURE DE PULPA'].map((x) => (
                  <label key={x} className="mr-4">
                    <input type="radio" name="materia" checked={h.materia === x} onChange={() => set('materia', x)} /> {x}
                  </label>
                ))}
              </td>
            </tr>
            <tr>
              <td className={`${box} px-2 font-semibold`}>TIPO DE FRUTA:</td>
              <td className={`${box} px-2`} colSpan={3}>
                {['CHINOLA', 'PIÑA', 'MANGO', 'GUAYABA'].map((x) => (
                  <label key={x} className="mr-4">
                    <input type="radio" name="fruta" checked={h.fruta === x} onChange={() => set('fruta', x)} /> {x}
                  </label>
                ))}
              </td>
            </tr>
            {[
              ['proveedor', 'PROVEEDOR:'],
              ['pais', 'PAIS DE ORIGEN:'],
              ['lote', 'No. LOTE:'],
            ].map(([k, l]) => (
              <tr key={k}>
                <td className={`${box} px-2 font-semibold`}>{l}</td>
                <td className={`${box} p-0`} colSpan={3}>
                  <input className="w-full px-2 h-7 outline-none" value={v(k)} onChange={(e) => set(k, e.target.value)} />
                </td>
              </tr>
            ))}
            <tr>
              <td className={`${box} px-2 font-semibold`}>FECHA DE RECEPCION:</td>
              <td className={`${box} p-0`}>
                <input
                  className={`w-full px-2 h-7 ${locked ? 'bg-[#F3EFE8]' : ''}`}
                  value={v('fecha_rec')}
                  readOnly={locked}
                  placeholder="dd/mm/aaaa"
                  onChange={(e) => set('fecha_rec', e.target.value)}
                />
              </td>
              <td className={`${box} px-2 font-semibold`}>FECHA DE MUESTREO:</td>
              <td className={`${box} p-0`}>
                <input
                  className={`w-full px-2 h-7 ${locked ? 'bg-[#F3EFE8]' : ''}`}
                  value={v('fecha_muestra')}
                  readOnly={locked}
                  placeholder="dd/mm/aaaa"
                  onChange={(e) => set('fecha_muestra', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="bg-[#1A120E] text-[#DCA54C] text-center font-bold py-1 mt-3">EVALUACION SENSORIAL</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['PARAMETRO', 'CRITERIO DE ACEPTACION', 'METODO REFERENCIAL', 'RESULTADO', 'OBSERVACIONES', 'ANALISTA'].map((t) => (
                <th key={t} className={`${box} px-1`}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SENSOR.map(([k, n, c, m]) => (
              <tr key={k}>
                <td className={`${box} px-1`}>{n}</td>
                <td className={`${box} px-1`}>{c}</td>
                <td className={`${box} px-1`}>{m}</td>
                <td className={`${box} px-1`}>
                  {['CONFORME', 'NO CONFORME'].map((r) => (
                    <label key={r} className={`block ${r === 'CONFORME' ? 'text-green-700' : 'text-red-700'}`}>
                      <input type="radio" name={k} checked={h[k] === r} onChange={() => set(k, r)} /> {r}
                    </label>
                  ))}
                </td>
                <td className={`${box} p-0`}>
                  <input className="w-full h-8 px-1" value={v(k + '_obs')} onChange={(e) => set(k + '_obs', e.target.value)} />
                </td>
                <td className={`${box} p-0`}>
                  <input className="w-full h-8 px-1" value={v(k + '_an')} onChange={(e) => set(k + '_an', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px]">*Codex CXS 247-2005 – características organolépticas</p>

        <div className="bg-[#1A120E] text-[#DCA54C] text-center font-bold py-1 mt-3">ANALISIS FISICOQUIMICO</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['PARAMETRO', 'LIMITE/REFERENCIA', 'METODO DE ANALISIS', 'RESULTADO', 'OBSERVACIONES', 'ANALISTA'].map((t) => (
                <th key={t} className={`${box} px-1`}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FISICO.map(([k, n, l, m]) => (
              <tr key={k}>
                <td className={`${box} px-1`}>{n}</td>
                <td className={`${box} px-1 text-center`}>{l}</td>
                <td className={`${box} px-1 text-center`}>{m}</td>
                <td className={`${box} p-0`}>
                  <input className="w-full h-7 text-center" value={v(k)} onChange={(e) => set(k, e.target.value)} />
                </td>
                <td className={`${box} p-0`}>
                  <input className="w-full h-7" value={v(k + '_obs')} onChange={(e) => set(k + '_obs', e.target.value)} />
                </td>
                <td className={`${box} p-0`}>
                  <input className="w-full h-7" value={v(k + '_an')} onChange={(e) => set(k + '_an', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={`${box} mt-2 p-3 min-h-[70px]`}>
          APROBADO POR:{' '}
          <input className="border-b border-black w-64" value={v('aprobado')} onChange={(e) => set('aprobado', e.target.value)} />
        </div>
        <p className="text-[10px] flex justify-between mt-3">
          <span>Y-FO-CS-001 REV. 01</span>
          <span>Aprobado: 30/04/2026</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[980px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}