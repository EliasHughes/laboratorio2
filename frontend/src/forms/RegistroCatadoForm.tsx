import { useState } from 'react'
import { printInApp } from './printInApp'

const KEY = 'form-y-fo-cc-008'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function printRegistroCatado(h: Record<string, any> = {}) {
  const d: any = { ...h, fecha: h.fecha || today() }
  printInApp(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-008</title>
    <style>body{font-family:Arial;padding:24px} .ln{border-bottom:1px solid #000;min-width:180px;display:inline-block}</style></head><body>
    <div style="display:grid;grid-template-columns:90px 1fr 160px;border:1px solid #000">
      <div style="padding:8px;text-align:center"><img src="${location.origin}/yazoo.png" height="44"/></div>
      <div style="display:flex;align-items:center;justify-content:center;font-weight:700;border-left:1px solid #000;border-right:1px solid #000">REGISTRO SECCIONES DE CATADO</div>
      <div style="padding:8px;font-size:11px">CODIGO: Y-FO-CC-008<br/>REV: 01<br/>Página 1 de 1</div>
    </div>
    <h3 style="text-align:center">REGISTRO SECCIONES DE CATADO</h3>
    <p>Fecha: <span class="ln">${d.fecha}</span></p>
    <p>Muestra Catada: <span class="ln">${d.muestra || ''}</span> &nbsp; Lote: <span class="ln">${d.lote || ''}</span></p>
    <p>N° de Catadores: <span class="ln">${d.n_cat || ''}</span></p>
    <p>N° de Pruebas: <span class="ln">${d.n_pru || ''}</span></p>
    <p>N° de Aciertos: <span class="ln">${d.n_ac || ''}</span></p>
    <p>% de confiabilidad: <span class="ln">${d.conf || ''}</span></p>
    <p>Índice Aceptación / Rechazo: <span class="ln">${d.indice || ''}</span></p>
    <p>Observaciones:<br/>${d.obs1 || ''}<br/>${d.obs2 || ''}<br/>${d.obs3 || ''}</p>
    <p>Firma: <span class="ln">${d.firma || ''}</span></p>
    <p>Conclusión:</p>
    <p>Aprobado: <span class="ln">${d.aprobado || ''}</span> &nbsp; Rechazado: <span class="ln">${d.rechazado || ''}</span></p>
    <p>Verificado: <span class="ln">${d.verif || ''}</span></p>
    <p style="font-size:10px;display:flex;justify-content:space-between"><span>Y-FO-CS-001 Rev.: 01</span><span>Aprobado: 24/03/2026</span></p>
    </body></html>`)
}

export default function RegistroCatadoForm({ onCancel, onSave, initialData }: any) {
  const [h, setH] = useState<any>(() => ({ fecha: today(), ...(initialData || {}) }))
  const set = (k: string, v: string) => {
    if (k === 'fecha') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const save = () => {
    const d: any = { ...h, fecha: h.fecha || today() }
    onSave?.(d)
  }
  const line = (label: string, k: string, wide = false) => (
    <label className={`flex items-baseline gap-2 text-sm ${wide ? 'w-full' : ''}`}>
      <span className="whitespace-nowrap">{label}</span>
      <input
        className="flex-1 border-0 border-b border-[#1A120E] bg-transparent outline-none py-0.5"
        value={h[k] || ''}
        readOnly={k === 'fecha'}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  )

  const print = () => printRegistroCatado(h)

  return (
    <div className="bg-[#EFEAE3] p-4 max-h-[80vh] overflow-auto">
      <div className="bg-white border border-[#1A120E] p-5 text-[#1A120E] max-w-3xl mx-auto">
        <div className="grid grid-cols-[90px_1fr_170px] border border-[#1A120E]">
          <div className="flex items-center justify-center p-2 border-r border-[#1A120E]">
            <img src="/yazoo.png" className="h-12" alt="" />
          </div>
          <div className="flex items-center justify-center font-bold text-center border-r border-[#1A120E] text-[15px] leading-tight">
            REGISTRO SECCIONES
            <br />
            DE CATADO
          </div>
          <div className="text-[11px] leading-5 p-2">
            <div className="flex justify-between border-b border-[#1A120E] pb-1">
              <span>CODIGO:</span>
              <b>Y-FO-CC-008</b>
            </div>
            <div className="flex justify-between border-b border-[#1A120E] py-1">
              <span>REV:</span>
              <b>01</b>
            </div>
            <div className="pt-1 text-center">Página 1 de 1</div>
          </div>
        </div>

        <h3 className="text-center font-semibold mt-6 mb-5 tracking-wide">REGISTRO SECCIONES DE CATADO</h3>
        <div className="space-y-4 max-w-lg">
          {line('Fecha:', 'fecha')}
          <div className="flex gap-6">
            {line('Muestra Catada:', 'muestra')}
            {line('Lote:', 'lote')}
          </div>
          {line('N° de Catadores:', 'n_cat')}
          {line('N° de Pruebas:', 'n_pru')}
          {line('N° de Aciertos:', 'n_ac')}
          {line('% de confiabilidad:', 'conf')}
          {line('Índice Aceptación / Rechazo:', 'indice', true)}
        </div>
        <div className="mt-8 space-y-3">
          <p>Observaciones:</p>
          <input className="w-full border-0 border-b border-[#1A120E]" value={h.obs1 || ''} onChange={(e) => set('obs1', e.target.value)} />
          <input className="w-full border-0 border-b border-[#1A120E]" value={h.obs2 || ''} onChange={(e) => set('obs2', e.target.value)} />
          <input className="w-full border-0 border-b border-[#1A120E]" value={h.obs3 || ''} onChange={(e) => set('obs3', e.target.value)} />
        </div>
        <div className="mt-8 max-w-xs">{line('Firma:', 'firma')}</div>
        <p className="mt-8 font-semibold">Conclusión:</p>
        <div className="flex gap-8 mt-2 max-w-xl">
          {line('Aprobado:', 'aprobado')}
          {line('Rechazado:', 'rechazado')}
        </div>
        <div className="mt-4 max-w-xs">{line('Verificado:', 'verif')}</div>
        <p className="text-[10px] flex justify-between mt-10">
          <span>Y-FO-CS-001 Rev.: 01</span>
          <span>Aprobado: 24/03/2026</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="border border-[#1A120E] px-3 py-1" data-yazoo-print="1" onClick={print}>
          Imprimir
        </button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>
          Guardar
        </button>
      </div>
    </div>
  )
}