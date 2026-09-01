import { useState } from 'react'

const KEY = 'form-y-fo-cc-056-02'
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const ROWS: [string, string, string][] = [
  ['apariencia', 'Apariencia y/o estado fisico', 'Translucida, liquido libre de partículas'],
  ['color', 'Color', 'Amarillo claro – amarillo pálido'],
  ['aroma', 'Aroma', 'Característico, limpio de olores extraños'],
  ['sabor', 'Sabor', 'Característico, dulce'],
  ['solubilidad', 'Solubilidad', 'Hidrosoluble'],
  ['consistencia', 'Consistencia', 'Liquido viscoso, uniforme'],
  ['brix', 'Concentración (°Brix)', '74 – 76'],
  ['azucares', 'Azúcares reductores %', 'En proceso, en ensayo'],
  ['densidad', 'Densidad (g/ml)', '1.33 – 1.42'],
]

export default function EspecificacionesMateriaPrimaForm({ onCancel, onSave }: any) {
  const [h, setH] = useState<any>({ producto: 'Azúcar líquida', codigo: 'N/A', proveedor: 'N/A', ...load() })
  const set = (k: string, v: string) => setH((p: any) => ({ ...p, [k]: v }))
  const v = (k: string) => h[k] || ''
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(h))
    onSave?.(h)
  }

  const print = () => {
    const logo = `${window.location.origin}/yazoo.png`
    const w = window.open('', '_blank', 'width=800,height=900')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-056-02</title>
      <style>body{font-family:Arial;font-size:12px;padding:16px}table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #000;padding:6px}</style></head><body>
      <div style="display:grid;grid-template-columns:90px 1fr 150px;border:1px solid #000">
        <div style="padding:6px;text-align:center"><img src="${logo}" height="42"/></div>
        <div style="text-align:center;font-weight:700;padding:10px;border-left:1px solid #000;border-right:1px solid #000">ESPECIFICACIONES DE<br/>MATERIA PRIMA E INSUMO</div>
        <div style="padding:6px;font-size:10px">CÓDIGO: Y-FO-CC-056-02<br/>REV.: 00<br/>Página 1 de 1</div>
      </div>
      <p>1. Nombre del producto: ${v('producto')}<br/>2. Código Yazoo: ${v('codigo')}<br/>3. Proveedor: ${v('proveedor')}</p>
      <h4 style="text-align:center">ANÁLISIS FISICOQUÍMICO</h4>
      <table><tr><th>Análisis</th><th>Parámetros</th><th>Resultado</th></tr>
      ${ROWS.map(([k, a, p]) => `<tr><td>${a}</td><td>${p}</td><td>${v('r_' + k)}</td></tr>`).join('')}
      </table>
      <p>Elaborado por: ${v('elaborado')} Fecha: ${v('f_elab')} &nbsp; Aprobado por: ${v('aprobado')} Fecha: ${v('f_apr')}</p>
      <p style="font-size:10px">Y-FO-CS-001 Rev. 01 &nbsp; Aprobado: 20/06/2024</p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="bg-[#EDE8E0] p-4 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-5 max-w-[720px] mx-auto text-[13px]">
        <div className="grid grid-cols-[90px_1fr_150px] border border-black">
          <div className="flex items-center justify-center p-2 border-r border-black">
            <img src="/yazoo.png" className="h-10" alt="" />
          </div>
          <div className="flex items-center justify-center text-center font-bold border-r border-black">
            ESPECIFICACIONES DE
            <br />
            MATERIA PRIMA E INSUMO
          </div>
          <div className="text-[10px] p-2 leading-4">
            CÓDIGO: Y-FO-CC-056-02
            <br />
            REV.: 00
            <br />
            Página 1 de 1
          </div>
        </div>
        <ol className="mt-4 space-y-1">
          <li>
            Nombre del producto:{' '}
            <input className="border-b border-black w-56" value={v('producto')} onChange={(e) => set('producto', e.target.value)} />
          </li>
          <li>
            Código Yazoo:{' '}
            <input className="border-b border-black w-40" value={v('codigo')} onChange={(e) => set('codigo', e.target.value)} />
          </li>
          <li>
            Proveedor:{' '}
            <input className="border-b border-black w-56" value={v('proveedor')} onChange={(e) => set('proveedor', e.target.value)} />
          </li>
        </ol>
        <h4 className="text-center font-semibold mt-5">ANÁLISIS FISICOQUÍMICO</h4>
        <table className="w-full border-collapse mt-2">
          <thead>
            <tr>
              <th className="border border-black">Análisis</th>
              <th className="border border-black">Parámetros</th>
              <th className="border border-black w-40">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, a, p]) => (
              <tr key={k}>
                <td className="border border-black px-2">{a}</td>
                <td className="border border-black px-2">{p}</td>
                <td className="border border-black p-0">
                  <input className="w-full h-8 px-1 outline-none" value={v('r_' + k)} onChange={(e) => set('r_' + k, e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid grid-cols-2 border border-black mt-6">
          <div className="border-r border-black p-2">
            Elaborado por: <input className="border-b border-black w-40" value={v('elaborado')} onChange={(e) => set('elaborado', e.target.value)} />
            <br />
            Fecha: <input className="border-b border-black w-32" value={v('f_elab')} onChange={(e) => set('f_elab', e.target.value)} />
          </div>
          <div className="p-2">
            Aprobado por: <input className="border-b border-black w-40" value={v('aprobado')} onChange={(e) => set('aprobado', e.target.value)} />
            <br />
            Fecha: <input className="border-b border-black w-32" value={v('f_apr')} onChange={(e) => set('f_apr', e.target.value)} />
          </div>
        </div>
        <p className="text-[10px] flex justify-between mt-4">
          <span>Y-FO-CS-001 Rev. 01</span>
          <span>Aprobado: 20/06/2024</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[720px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}