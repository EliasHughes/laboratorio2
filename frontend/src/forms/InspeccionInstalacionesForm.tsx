import { useState } from 'react'

const KEY = 'form-y-fo-si-010'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const ITEMS = [
  '¿LOS EMPLEADOS, CLIENTES Y RELACIONADOS ESTÁN DEBIDAMENTE IDENTIFICADOS CON EL CARNET CORRESPONDIENTE?',
  'LOS CARNET DE LOS EMPLEADOS Y CARNET DE CONTROL DE ACCESO ESTÁN EN BUENAS CONDICIONES.',
  '¿SE ESTÁ COMPLETANDO EL LIBRO DE VISITAS PARA LAS PERSONAS QUE INGRESAN A LAS FACILIDADES?',
  '¿TODAS LAS PUERTAS EXTERNAS E INTERNAS ESTÁN EN BUENAS CONDICIONES?',
  '¿LAS PUERTAS PERMANECEN CERRADAS CUANDO NO ESTÁN EN USO?',
  '¿LA ILUMINACIÓN INTERNA ES ADECUADA?',
  '¿LA ILUMINACIÓN EXTERNA ES ADECUADA?',
  '¿LAS PUERTAS PRINCIPALES DE ACCESO ESTÁN DEBIDAMENTE ILUMINADAS?',
  '¿EL PERSONAL CUENTA CON ELEMENTOS DE PROTECCIÓN ADECUADA?',
  '¿LOS ALREDEDORES ESTÁN LIBRES DE BASURA Y AGUA ESTANCADA?',
  '¿LAS PAREDES SE ENCUENTRAN LIMPIAS Y LA PINTURA SE MANTIENE EN BUEN ESTADO?',
  '¿LOS PISOS SE ENCUENTRAN SIN GRIETAS, DESNIVEL O ROTURAS?',
  '¿LA INFRAESTRUCTURA DE LAS NAVES SE ENCUENTRA EN BUEN ESTADO?',
  '¿LAS PUERTAS SE ENCUENTRAN EN BUEN ESTADO, SIN ABERTURAS, ¿GRIETAS?',
  '¿LAS VENTANAS, SE ENCUENTRA EN BUEN ESTADO, SIN GRIETAS, ¿PERFORACIONES, DESNIVEL O ROTURAS?',
  '¿LA RUTA DE EVACUACIÓN ESTÁ DEBIDAMENTE SEÑALIZADAS?',
  '¿TODOS LOS EXTINTORES ESTÁN AL DÍA EN EL MANTENIMIENTO?',
  '¿LOS EXTINTORES NO TIENEN NINGUNA OBSTRUCCIÓN?',
  '¿TODOS LOS EQUIPOS ELÉCTRICOS CUENTAN CON CONEXIÓN A TIERRA?',
  '¿ESTÁ CONTROLADO EL ACCESO A LA DOCUMENTACIÓN DE LA CARGA?',
  '¿ESTÁ EL ÁREA DE TARIMAS LIBRE DE ESCOMBROS?',
  '¿SE ENCUENTRA LA VERJA PERIMETRAL LIBRE DE MALEZA E ÍNTEGRA SU ESTRUCTURA?',
  'EL ÁREA DE RECEPCIÓN Y DESPACHO ESTÁ LIBRE DE INTRUSOS (PERSONAS NO IDENTIFICADAS), MOTOCICLETAS Y/O VEHÍCULOS PARTICULARES?',
  '¿TODAS LAS CÁMARAS ESTÁN EN BUENAS CONDICIONES?',
  'LA CISTERNA DE AGUA SE ENCUENTRAN DEBIDAMENTE CERRADA',
  'LAS PUERTAS DE LOS ALMACENES SE ENCUENTRAN DEBIDAMENTE CERRADA.',
  'LAS PUERTAS DE LOS ALMACENES DE AÑEJAMIENTO SE ENCUENTRAN CERRADAS.',
  'LA PUERTA DE LAS ÁREAS DE PRODUCCIÓN SE ENCUENTRAN CERRADAS',
  '¿LOS ALMACENES DE QUÍMICOS ESTÁN CERRADOS?',
  '¿HAY PRODUCTOS QUÍMICOS FUERA DEL ALMACEN SIN CONTROL ASIGNADO?',
  '¿LOS QUÍMICOS SE ENCUENTRAN IDENTIFICADOS?',
]

export default function InspeccionInstalacionesForm({ onCancel, onSave, initialData }: any) {
  const [h, setH] = useState<any>(() => ({ fecha: today(), ...(initialData || {}) }))
  const set = (k: string, v: string) => setH((p: any) => ({ ...p, [k]: v }))
  const save = () => {
    const d = { ...h, fecha: h.fecha || today() }
    onSave?.(d)
  }

  const print = () => {
    const logo = `${window.location.origin}/yazoo.png`
    const w = window.open('', '_blank', 'width=900,height=1100')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-SI-010</title>
      <style>
        body{font-family:Arial;font-size:11px;padding:12px}
        table{border-collapse:collapse;width:100%}
        td,th{border:1px solid #000;padding:4px}
        .g{background:#16a34a;color:#fff;text-align:center;font-weight:700}
        .r{background:#dc2626;color:#fff;text-align:center;font-weight:700}
      </style></head><body>
      <div style="display:grid;grid-template-columns:90px 1fr 160px;border:1px solid #000">
        <div style="padding:6px;text-align:center"><img src="${logo}" height="42"/></div>
        <div style="display:flex;align-items:center;justify-content:center;font-weight:700;border-left:1px solid #000;border-right:1px solid #000">INSPECCIÓN DE LAS INSTALACIONES</div>
        <div style="padding:6px;font-size:10px">CÓDIGO: Y-FO-SI-010<br/>REV.: 02<br/>Página 1 de 2</div>
      </div>
      <p>LOCALIDAD: ${h.localidad || ''} &nbsp; Fecha: ${h.fecha}</p>
      <table>
        <tr><th>PUNTO PARA VERIFICAR</th><th>CUMPLE</th><th>NO CUMPLE</th></tr>
        ${ITEMS.map((it, i) => {
          const k = 'i' + i
          const ok = h[k] === 'CUMPLE'
          const no = h[k] === 'NO CUMPLE'
          return `<tr><td>${i + 1}. ${it}</td>
            <td class="${ok ? 'g' : ''}">${ok ? 'X' : ''}</td>
            <td class="${no ? 'r' : ''}">${no ? 'X' : ''}</td></tr>`
        }).join('')}
      </table>
      <p style="font-size:10px;display:flex;justify-content:space-between"><span>Y-FO-CS-001 REV. 01</span><span>Aprobado: 20/06/2024</span></p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="bg-[#EDE8E0] p-3 max-h-[80vh] overflow-auto text-black">
      <div className="bg-white p-4 max-w-[900px] mx-auto text-[12px]">
        <div className="grid grid-cols-[90px_1fr_150px] border border-black">
          <div className="flex items-center justify-center p-2 border-r border-black">
            <img src="/yazoo.png" className="h-10" alt="" />
          </div>
          <div className="flex items-center justify-center font-bold text-center border-r border-black">
            INSPECCIÓN DE LAS INSTALACIONES
          </div>
          <div className="text-[10px] p-2 leading-4">
            CÓDIGO: Y-FO-SI-010
            <br />
            REV.: 02
            <br />
            Página 1 de 2
          </div>
        </div>
        <p className="mt-3">
          LOCALIDAD:{' '}
          <input className="border-b border-black w-64" value={h.localidad || ''} onChange={(e) => set('localidad', e.target.value)} />
        </p>
        <table className="w-full border-collapse mt-2">
          <thead>
            <tr>
              <th className="border border-black text-left px-2">PUNTO PARA VERIFICAR</th>
              <th className="border border-black w-24">CUMPLE</th>
              <th className="border border-black w-24">NO CUMPLE</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it, i) => {
              const k = 'i' + i
              const val = h[k]
              return (
                <tr key={k}>
                  <td className="border border-black px-2">
                    {i + 1}. {it}
                  </td>
                  {(['CUMPLE', 'NO CUMPLE'] as const).map((o) => {
                    const on = val === o
                    const bg = !on ? '' : o === 'CUMPLE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    return (
                      <td key={o} className={`border border-black text-center ${bg}`}>
                        <button type="button" className="w-full h-8 font-bold" onClick={() => set(k, o)}>
                          {on ? 'X' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-[10px] flex justify-between mt-3">
          <span>Y-FO-CS-001 REV. 01</span>
          <span>Aprobado: 20/06/2024</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[900px] mx-auto">
        <button type="button" onClick={onCancel}>Cancelar</button>
        <button type="button" className="border px-3 py-1" data-yazoo-print="1" onClick={print}>Imprimir</button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}