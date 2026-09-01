import { useState } from 'react'

const KEY = 'form-y-fo-cc-007'
const today = () => new Date().toISOString().slice(0, 10)
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

const mark = (on: boolean) => (on ? '☑' : '☐')

export default function PruebaTriangularForm({ onCancel, onSave }: any) {
  const [h, setH] = useState<any>(() => ({ fecha: load().fecha || today(), ...load() }))
  const set = (k: string, v: any) => {
    if (k === 'fecha') return
    setH((p: any) => ({ ...p, [k]: v }))
  }
  const tog = (k: string, v: string) => {
    const cur: string[] = Array.isArray(h[k]) ? h[k] : []
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }
  const has = (k: string, v: string) => (h[k] || []).includes(v)
  const save = () => {
    const d = { ...h, fecha: h.fecha || today() }
    localStorage.setItem(KEY, JSON.stringify(d))
    onSave?.(d)
  }

  const line = 'border-0 border-b border-black bg-transparent outline-none px-1'
  const chk = (k: string, v: string) => (
    <label className="flex items-center gap-1 text-[12px] leading-5">
      <input type="checkbox" checked={has(k, v)} onChange={() => tog(k, v)} />
      {v}
    </label>
  )

  const print = () => {
    const d = { ...h, fecha: h.fecha || today() }
    const c = (k: string, v: string) => mark((d[k] || []).includes(v))
    const w = window.open('', '_blank', 'width=900,height=1100')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-007</title>
      <style>
        body{font-family:Arial;font-size:12px;color:#000;padding:18px}
        .hdr{display:grid;grid-template-columns:95px 1fr 170px;border:1px solid #000}
        .ln{border-bottom:1px solid #000;min-width:140px;display:inline-block;height:16px}
        .col{display:inline-block;vertical-align:top;margin-right:28px}
        h4{text-align:center;margin:14px 0 8px;font-size:13px}
      </style></head><body>
      <div class="hdr">
        <div style="padding:8px;text-align:center"><img src="${location.origin}/yazoo.png" height="46"/></div>
        <div style="display:flex;align-items:center;justify-content:center;font-weight:700;border-left:1px solid #000;border-right:1px solid #000">PRUEBA TRIANGULAR</div>
        <div style="padding:6px;font-size:11px">CODIGO: Y-FO-CC-007<br/>REV.: 02<br/>Página 1 de 1</div>
      </div>
      <h4>PRUEBA TRIANGULAR</h4>
      <p>Nombre: <span class="ln">${d.nombre || ''}</span>
         &nbsp;&nbsp;&nbsp; Fecha: <span class="ln">${d.fecha}</span></p>
      <p>Producto evaluado: <span class="ln" style="min-width:280px">${d.producto || ''}</span></p>
      <p>Se presentan tres muestras codificadas, dos son idénticas y una es diferente.<br/>
      Evalúa color, aroma y sabor de cada muestra e identifica cuál crees que es la diferente.</p>
      <h4>Identificación de la muestra diferente</h4>
      <p>¿Cuál consideras que es la muestra diferente?</p>
      <p>Trío: <span class="ln">${d.t1a || ''}</span> <span class="ln">${d.t1b || ''}</span> <span class="ln">${d.t1c || ''}</span>
         &nbsp; ${c('conf1', 'Muy seguro')} Muy seguro ${c('conf1', 'Seguro')} Seguro ${c('conf1', 'Poco seguro')} Poco seguro</p>
      <p>Trío: <span class="ln">${d.t2a || ''}</span> <span class="ln">${d.t2b || ''}</span> <span class="ln">${d.t2c || ''}</span>
         &nbsp; ${c('conf2', 'Muy seguro')} Muy seguro ${c('conf2', 'Seguro')} Seguro ${c('conf2', 'Poco seguro')} Poco seguro</p>
      <h4>Evaluación del color &nbsp;&nbsp; Evaluación del aroma</h4>
      <div class="col">Como percibe el color<br/>
        ${c('color', 'Igual a la referencia')} Igual a la referencia<br/>
        ${c('color', 'Mas clara que la referencia')} Mas clara que la referencia<br/>
        ${c('color', 'Mas oscura que la referencia')} Mas oscura que la referencia</div>
      <div class="col">Complejidad Aromática<br/>
        ${c('aroma', 'Muy simple')} Muy simple<br/>
        ${c('aroma', 'Medianamente complejo')} Medianamente complejo<br/>
        ${c('aroma', 'Complejo y equilibrado')} Complejo y equilibrado<br/>
        ${c('aroma', 'Muy complejo')} Muy complejo</div>
      <div class="col">Notas Predominantes<br/>
        ${c('notas', 'Vainilla')} Vainilla<br/>
        ${c('notas', 'Caramelo/toffee')} Caramelo/toffee<br/>
        ${c('notas', 'Madera/roble')} Madera/roble<br/>
        ${c('notas', 'Frutas secas')} Frutas secas<br/>
        ${c('notas', 'Especias')} Especias<br/>
        ${c('notas', 'Frutas tropicales')} Frutas tropicales<br/>
        Otros: <span class="ln">${d.otros || ''}</span></div>
      <h4>Evaluación del sabor</h4>
      <div class="col">Nivel del dulzor<br/>
        ${c('dulzor', 'Muy seco')} Muy seco<br/>${c('dulzor', 'Seco')} Seco<br/>
        ${c('dulzor', 'Semi-dulce')} Semi-dulce<br/>${c('dulzor', 'dulce')} dulce<br/>
        ${c('dulzor', 'Muy dulce')} Muy dulce</div>
      <div class="col">Persistencia en boca<br/>
        ${c('pers', 'Muy corta')} Muy corta<br/>${c('pers', 'Media')} Media<br/>
        ${c('pers', 'Larga')} Larga<br/>${c('pers', 'Muy larga')} Muy larga</div>
      <div class="col">Sensaciones Destacadas<br/>
        ${c('sens', 'Suave')} Suave<br/>${c('sens', 'Equilibrado')} Equilibrado<br/>
        ${c('sens', 'Calidez alcohólica')} Calidez alcohólica<br/>
        ${c('sens', 'Final amargo')} Final amargo<br/>${c('sens', 'Final dulce')} Final dulce<br/>
        ${c('sens', 'Final especiado')} Final especiado</div>
      <p style="clear:both;padding-top:12px">¿Notas alguna característica destacable o defectuosa?</p>
      <p style="border-bottom:1px solid #000">${d.defecto || '&nbsp;'}</p>
      <p>Comentarios Generales:</p>
      <p style="border-bottom:1px solid #000">${d.com1 || '&nbsp;'}</p>
      <p style="border-bottom:1px solid #000">${d.com2 || '&nbsp;'}</p>
      <p>Firma Panelista: <span class="ln">${d.firma || ''}</span></p>
      <p>Cata preparada por: <span class="ln">${d.prepara || ''}</span></p>
      <p style="font-size:10px;display:flex;justify-content:space-between">
        <span>Y-FO-CS-001 Rev.: 01</span><span>Aprobado: 13/08/2025</span>
      </p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="bg-[#EDE8E0] p-4 max-h-[80vh] overflow-auto">
      <div className="bg-white text-black max-w-[720px] mx-auto p-5">
        <div className="grid grid-cols-[95px_1fr_170px] border border-black">
          <div className="flex items-center justify-center p-2 border-r border-black">
            <img src="/yazoo.png" className="h-12" alt="" />
          </div>
          <div className="flex items-center justify-center font-bold border-r border-black">PRUEBA TRIANGULAR</div>
          <div className="text-[11px] leading-5 p-2">
            CODIGO: Y-FO-CC-007
            <br />
            REV.: 02
            <br />
            Página 1 de 1
          </div>
        </div>

        <h3 className="text-center font-semibold mt-5 text-sm">PRUEBA TRIANGULAR</h3>
        <div className="flex justify-between text-sm mt-4">
          <label>
            Nombre: <input className={line + ' w-52'} value={h.nombre || ''} onChange={(e) => set('nombre', e.target.value)} />
          </label>
          <label>
            Fecha: <input className={line + ' w-28 bg-[#F3EFE8]'} value={h.fecha} readOnly />
          </label>
        </div>
        <label className="block text-sm mt-2">
          Producto evaluado: <input className={line + ' w-72'} value={h.producto || ''} onChange={(e) => set('producto', e.target.value)} />
        </label>
        <p className="text-[12px] mt-3 leading-5">
          Se presentan tres muestras codificadas, dos son idénticas y una es diferente.
          <br />
          Evalúa color, aroma y sabor de cada muestra e identifica cuál crees que es la diferente.
        </p>

        <p className="text-center font-semibold text-sm mt-5">Identificación de la muestra diferente</p>
        <p className="text-sm mt-2">¿Cuál consideras que es la muestra diferente?</p>
        <div className="flex justify-between mt-3 text-sm">
          <div className="space-y-3">
            <p>
              Trío:{' '}
              <input className={line + ' w-14'} value={h.t1a || ''} onChange={(e) => set('t1a', e.target.value)} />
              <input className={line + ' w-14 ml-2'} value={h.t1b || ''} onChange={(e) => set('t1b', e.target.value)} />
              <input className={line + ' w-14 ml-2'} value={h.t1c || ''} onChange={(e) => set('t1c', e.target.value)} />
            </p>
            <p>
              Trío:{' '}
              <input className={line + ' w-14'} value={h.t2a || ''} onChange={(e) => set('t2a', e.target.value)} />
              <input className={line + ' w-14 ml-2'} value={h.t2b || ''} onChange={(e) => set('t2b', e.target.value)} />
              <input className={line + ' w-14 ml-2'} value={h.t2c || ''} onChange={(e) => set('t2c', e.target.value)} />
            </p>
          </div>
          <div>
            <p className="text-xs mb-1">Grado de confianza de su elección</p>
            <div className="flex gap-3">{['Muy seguro', 'Seguro', 'Poco seguro'].map((x) => chk('conf1', x))}</div>
            <div className="flex gap-3 mt-2">{['Muy seguro', 'Seguro', 'Poco seguro'].map((x) => chk('conf2', x))}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-center text-sm font-semibold">Evaluación del color</p>
            <p className="text-[11px] mb-1">Como percibe el color de la muestra</p>
            {chk('color', 'Igual a la referencia')}
            {chk('color', 'Mas clara que la referencia')}
            {chk('color', 'Mas oscura que la referencia')}
          </div>
          <div>
            <p className="text-center text-sm font-semibold">Evaluación del aroma</p>
            <p className="text-[11px]">Complejidad Aromática</p>
            {chk('aroma', 'Muy simple')}
            {chk('aroma', 'Medianamente complejo')}
            {chk('aroma', 'Complejo y equilibrado')}
            {chk('aroma', 'Muy complejo')}
          </div>
          <div>
            <p className="text-[11px] mt-5">Notas Predominantes</p>
            {chk('notas', 'Vainilla')}
            {chk('notas', 'Caramelo/toffee')}
            {chk('notas', 'Madera/roble')}
            {chk('notas', 'Frutas secas')}
            {chk('notas', 'Especias')}
            {chk('notas', 'Frutas tropicales')}
            <label className="flex items-center gap-1 text-[12px] mt-1">
              Otros <input className={line + ' w-24'} value={h.otros || ''} onChange={(e) => set('otros', e.target.value)} />
            </label>
          </div>
        </div>

        <p className="text-center font-semibold text-sm mt-6">Evaluación del sabor</p>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-[11px] mb-1">Nivel del dulzor</p>
            {['Muy seco', 'Seco', 'Semi-dulce', 'dulce', 'Muy dulce'].map((x) => chk('dulzor', x))}
          </div>
          <div>
            <p className="text-[11px] mb-1">Persistencia en boca</p>
            {['Muy corta', 'Media', 'Larga', 'Muy larga'].map((x) => chk('pers', x))}
          </div>
          <div>
            <p className="text-[11px] mb-1">Sensaciones Destacadas</p>
            {['Suave', 'Equilibrado', 'Calidez alcohólica', 'Final amargo', 'Final dulce', 'Final especiado'].map((x) =>
              chk('sens', x)
            )}
          </div>
        </div>

        <p className="text-sm mt-6">¿Notas alguna característica destacable o defectuosa?</p>
        <input className={'w-full mt-1 ' + line} value={h.defecto || ''} onChange={(e) => set('defecto', e.target.value)} />
        <p className="text-sm mt-4">Comentarios Generales:</p>
        <input className={'w-full mt-1 ' + line} value={h.com1 || ''} onChange={(e) => set('com1', e.target.value)} />
        <input className={'w-full mt-3 ' + line} value={h.com2 || ''} onChange={(e) => set('com2', e.target.value)} />
        <label className="flex gap-2 text-sm mt-6 max-w-md">
          Firma Panelista: <input className={line + ' flex-1'} value={h.firma || ''} onChange={(e) => set('firma', e.target.value)} />
        </label>
        <label className="flex gap-2 text-sm mt-3 max-w-md">
          Cata preparada por: <input className={line + ' flex-1'} value={h.prepara || ''} onChange={(e) => set('prepara', e.target.value)} />
        </label>
        <p className="text-[10px] flex justify-between mt-8">
          <span>Y-FO-CS-001 Rev.: 01</span>
          <span>Aprobado: 13/08/2025</span>
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-3 max-w-[720px] mx-auto">
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="border border-black px-3 py-1" onClick={print}>
          Imprimir
        </button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>
          Guardar
        </button>
      </div>
    </div>
  )
}