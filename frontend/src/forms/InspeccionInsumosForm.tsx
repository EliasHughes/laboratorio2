import { useMemo, useState } from 'react'

type Props = { onCancel?: () => void; onSave?: (d: Record<string, any>) => void; initialData?: Record<string, any> }
const KEY = 'form-y-fo-cc-030'

const TIPOS = [
  'Botella Vidrio',
  'Botella Plastico',
  'Etiquetas frontal',
  'Separadores de botellas',
  'Estuches',
  'Etiqueta Dorsal',
  'Caja Corrugada',
  'Termoencogible',
  'Otros',
]
const MERCADOS = ['RD', 'USA', 'EUROPA', 'Otro']
const TIPOS_INSP = ['Visual', 'Fisico', 'Documental']

const CRIT_BOT = [
  { k: 'int_fisica', l: 'Integridad Fisica', na: false },
  { k: 'limpieza', l: 'Limpieza', na: false },
  { k: 'dim_acab', l: 'Dimension/Acabado', na: false },
  { k: 'compat', l: 'Compatibilidad', na: false },
  { k: 'contenido', l: 'Contenido neto', na: true },
  { k: 'apar_sup', l: 'Apariencia superficie', na: false },
  { k: 'diseno_color', l: 'Diseño y color', na: false },
  { k: 'fuga', l: 'Fuga', na: true },
  { k: 'porosidad', l: 'Porosidad', na: true },
  { k: 'ajuste', l: 'Ajuste', na: false },
  { k: 'olor', l: 'Olor', na: false },
]
const CRIT_ETQ = [
  { k: 'diseno_ok', l: 'Diseño Correcto', na: false },
  { k: 'idioma', l: 'Idioma/Mercado', na: false },
  { k: 'grado', l: 'Grado Alcoholico', na: true },
  { k: 'info_legal', l: 'Informacion Legal', na: true },
  { k: 'troquelado', l: 'Troquelado', na: true },
  { k: 'dimensiones', l: 'Dimensiones', na: true },
  { k: 'cod_prod', l: 'Codigo del producto', na: true },
  { k: 'cod_yazoo', l: 'Codigo de Yazoo', na: true },
  { k: 'armado', l: 'Armado', na: true },
  { k: 'resistencia', l: 'Resistencia', na: true },
  { k: 'func', l: 'Funcionalidad', na: false },
  { k: 'alergeno', l: 'Declaracion de alergeno del producto', na: true },
]
const DECISIONES = ['APROBADO/LIBERADO', 'RECHAZADO/RETENIDO', 'APROBADO CON OBSERVACION']
const ACCIONES = ['Retencion Lote', 'Devolucion a Proveedor', 'Uso Condicionado', 'Registro de NC']

function today() {
  return new Date().toISOString().slice(0, 10)
}
function load(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export default function InspeccionInsumosForm({ onCancel, onSave, initialData }: Props) {
  const initial = useMemo(() => {
    return { fecha: today(), ...(initialData || {}) }
  }, [initialData])
  const [h, setH] = useState<Record<string, any>>(initial)

  const set = (k: string, v: any) => {
    if (k === 'fecha') return
    setH((p) => ({ ...p, [k]: v }))
  }
  const toggleArr = (k: string, v: string) => {
    const cur: string[] = Array.isArray(h[k]) ? h[k] : []
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  const save = () => {
    const data = { ...h, fecha: h.fecha || today() }
    onSave?.(data)
  }

  const radio = (k: string, opts: string[]) => (
    <div className="flex flex-wrap gap-3">
      {opts.map((o) => (
        <label key={o} className="text-xs flex items-center gap-1">
          <input type="radio" name={k} checked={h[k] === o} onChange={() => set(k, o)} />
          {o}
        </label>
      ))}
    </div>
  )

  const critRow = (row: { k: string; l: string; na: boolean }) => {
    const v = h[row.k]
    const color = v === 'Conforme' ? 'text-green-700' : v === 'No Conforme' ? 'text-red-700' : 'text-[#1A120E]'
    return (
      <tr key={row.k} className="border-b border-black">
        <td className="px-2 py-1 text-sm">{row.l}</td>
        <td className="px-2 py-1">
          <div className={`flex flex-wrap gap-3 text-xs font-semibold ${color}`}>
            {['Conforme', 'No Conforme'].map((o) => (
              <label key={o} className="flex items-center gap-1">
                <input type="radio" name={row.k} checked={v === o} onChange={() => set(row.k, o)} />
                {o}
              </label>
            ))}
            {row.na && (
              <label className="flex items-center gap-1 text-[#5C5046]">
                <input type="radio" name={row.k} checked={v === 'No Aplica'} onChange={() => set(row.k, 'No Aplica')} />
                No Aplica
              </label>
            )}
          </div>
        </td>
      </tr>
    )
  }

  const print = () => {
    const d = { ...h, fecha: h.fecha || today() }
    const tipos = (d.tipos || []).join(', ')
    const merc = (d.mercados || []).join(', ')
    const tinsp = (d.tipos_insp || []).join(', ')
    const acc = (d.acciones || []).join(', ')
    const rows = (arr: typeof CRIT_BOT) =>
      arr
        .map((r) => {
          const v = d[r.k] || '—'
          const c = v === 'Conforme' ? '#166534' : v === 'No Conforme' ? '#991b1b' : '#000'
          return `<tr><td>${r.l}</td><td style="color:${c};font-weight:700">${v}</td></tr>`
        })
        .join('')
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Y-FO-CC-030</title>
      <style>body{font-family:Arial;font-size:11px;padding:12px}table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #000;padding:4px}h4{background:#000;color:#fff;margin:10px 0 0;padding:4px 8px;font-size:12px}
      .hdr{display:grid;grid-template-columns:80px 1fr 160px;border:1px solid #000}</style></head><body>
      <div class="hdr">
        <div style="padding:6px;text-align:center"><img src="${location.origin}/yazoo.png" height="40"/></div>
        <div style="padding:6px;text-align:center;border-left:1px solid #000;border-right:1px solid #000">
          <b>REGISTRO DE INSPECCION RECEPCION DE INSUMOS</b>
        </div>
        <div style="padding:6px">CODIGO: Y-FO-CC-030<br/>REV.:00<br/>PAG. 1-2<br/>Fecha: ${d.fecha}</div>
      </div>
      <h4>DESCRIPCION</h4>
      <table>
        <tr><th>Hora</th><td>${d.hora || '—'}</td><th>Placa No.</th><td>${d.placa || '—'}</td></tr>
        <tr><th>Proveedor</th><td>${d.proveedor || '—'}</td><th>Inspector de Calidad</th><td>${d.inspector || '—'}</td></tr>
        <tr><th>Cliente</th><td>${d.cliente || '—'}</td><th>No. Orden/Conduce</th><td>${d.orden || '—'}</td></tr>
        <tr><th colspan="2">Responsable Recepcion</th><td colspan="2">${d.resp_rec || '—'}</td></tr>
      </table>
      <h4>I. IDENTIFICACION DEL INSUMO</h4>
      <p>Tipo: ${tipos || '—'} · Mercado: ${merc || '—'} · Nombre: ${d.nombre || '—'} · Lote: ${d.lote || '—'}</p>
      <p>Cantidad: ${d.cantidad || '—'} ${d.unidad || ''} · Transporte: ${d.cond_trans || '—'}</p>
      <p>Obs. I: ${d.obs1 || '—'}</p>
      <h4>II. MUESTREO APLICADO</h4>
      <p>Tamaño lote: ${d.tam_lote || '—'} · Nivel: ${d.nivel || '—'} · AQL: ${d.aql || '—'} · Muestra: ${d.tam_muestra || '—'} · Tipo: ${tinsp || '—'}</p>
      <p>Obs. II: ${d.obs2 || '—'}</p>
      <h4>III. CRITERIOS DE INSPECCION — BOTELLAS/TAPA, CORCHOS ${d.na_bot ? '(N/A)' : ''}</h4>
      <table>${rows(CRIT_BOT)}</table>
      <h4>ETIQUETAS/CAJAS/SEPARADORES/TERMOENCOGIBLES ${d.na_etq ? '(N/A)' : ''}</h4>
      <table>${rows(CRIT_ETQ)}</table>
      <p>Obs. III: ${d.obs3 || '—'}</p>
      <h4>IV. RESULTADO</h4>
      <p>${d.decision || '—'}</p>
      <p>Comentarios: ${d.comentarios || '—'}</p>
      <h4>V. ACCION NO CONFORMIDAD</h4>
      <p>${acc || '—'}</p>
      <h4>VII. FIRMAS</h4>
      <p>Inspector de Calidad: ${d.inspector || '—'} &nbsp;&nbsp; Responsable de Almacen: ${d.resp_alm || '—'}</p>
      <p style="font-size:10px">Y-FO-CS-001 REV.:01 &nbsp; Aprobado:26-05-2026</p>
      </body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 250)
  }

  const box = 'w-full border border-black px-1 py-0.5 text-sm bg-white'
  const locked = box + ' bg-[#F3EFE8]'
  const sec = 'bg-black text-white text-center text-sm font-bold py-1 mt-3'

  return (
    <div className="bg-white text-black p-3 max-h-[80vh] overflow-auto text-sm border border-black">
      <div className="grid grid-cols-[80px_1fr_150px] border border-black">
        <div className="p-2 flex items-center justify-center border-r border-black">
          <img src="/yazoo.png" className="h-10" alt="Yazoo" />
        </div>
        <div className="p-2 text-center font-bold border-r border-black leading-tight">
          REGISTRO DE INSPECCION
          <br />
          RECEPCION DE INSUMOS
        </div>
        <div className="p-2 text-[11px] leading-tight">
          CODIGO: Y-FO-CC-030
          <br />
          REV.:00
          <br />
          PAG. 1 de 2
        </div>
      </div>

      <div className={sec}>DESCRIPCION</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 border border-t-0 border-black p-2">
        <label>
          Fecha
          <input className={locked} value={h.fecha} readOnly />
        </label>
        <label>
          Placa No.
          <input className={box} value={h.placa || ''} onChange={(e) => set('placa', e.target.value)} />
        </label>
        <label>
          Hora
          <input className={box} value={h.hora || ''} onChange={(e) => set('hora', e.target.value)} />
        </label>
        <label>
          Inspector de Calidad
          <input className={box} value={h.inspector || ''} onChange={(e) => set('inspector', e.target.value)} />
        </label>
        <label>
          Proveedor
          <input className={box} value={h.proveedor || ''} onChange={(e) => set('proveedor', e.target.value)} />
        </label>
        <label>
          No. Orden/Conduce
          <input className={box} value={h.orden || ''} onChange={(e) => set('orden', e.target.value)} />
        </label>
        <label>
          Cliente
          <input className={box} value={h.cliente || ''} onChange={(e) => set('cliente', e.target.value)} />
        </label>
        <label>
          Responsable Recepcion
          <input className={box} value={h.resp_rec || ''} onChange={(e) => set('resp_rec', e.target.value)} />
        </label>
      </div>

      <div className={sec}>I. IDENTIFICACION DEL INSUMO</div>
      <div className="border border-t-0 border-black p-2 space-y-2">
        <p className="font-semibold">Tipo de insumo:</p>
        <div className="grid grid-cols-3 gap-1">
          {TIPOS.map((t) => (
            <label key={t} className="text-xs flex gap-1">
              <input type="checkbox" checked={(h.tipos || []).includes(t)} onChange={() => toggleArr('tipos', t)} />
              {t}
            </label>
          ))}
        </div>
        <label>
          Nombre del Insumo
          <input className={box} value={h.nombre || ''} onChange={(e) => set('nombre', e.target.value)} />
        </label>
        <div>
          <p className="text-xs">Mercado Destino:</p>
          <div className="flex flex-wrap gap-3">
            {MERCADOS.map((t) => (
              <label key={t} className="text-xs flex gap-1">
                <input type="checkbox" checked={(h.mercados || []).includes(t)} onChange={() => toggleArr('mercados', t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label>
            Lote Proveedor
            <input className={box} value={h.lote || ''} onChange={(e) => set('lote', e.target.value)} />
          </label>
          <label>
            Cantidad recibida
            <input className={box} value={h.cantidad || ''} onChange={(e) => set('cantidad', e.target.value)} />
          </label>
          <label>
            Unidad
            <input className={box} value={h.unidad || ''} onChange={(e) => set('unidad', e.target.value)} />
          </label>
        </div>
        <div>
          <p className="text-xs">Condicion del Transporte:</p>
          {radio('cond_trans', ['Conforme', 'No Conforme'])}
        </div>
        <label>
          Observaciones
          <textarea className={box} value={h.obs1 || ''} onChange={(e) => set('obs1', e.target.value)} />
        </label>
      </div>

      <div className={sec}>II. MUESTREO APLICADO</div>
      <div className="border border-t-0 border-black p-2 grid grid-cols-2 gap-2">
        <label>
          Tamaño del Lote
          <input className={box} value={h.tam_lote || ''} onChange={(e) => set('tam_lote', e.target.value)} />
        </label>
        <label>
          Nivel de Inspeccion
          <input className={box} value={h.nivel || ''} onChange={(e) => set('nivel', e.target.value)} />
        </label>
        <label>
          AQL
          <input className={box} value={h.aql || ''} onChange={(e) => set('aql', e.target.value)} />
        </label>
        <label>
          Tamaño de Muestra
          <input className={box} value={h.tam_muestra || ''} onChange={(e) => set('tam_muestra', e.target.value)} />
        </label>
        <div className="col-span-2">
          <p className="text-xs">Tipo de Inspeccion:</p>
          <div className="flex gap-3">
            {TIPOS_INSP.map((t) => (
              <label key={t} className="text-xs flex gap-1">
                <input type="checkbox" checked={(h.tipos_insp || []).includes(t)} onChange={() => toggleArr('tipos_insp', t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
        <label className="col-span-2">
          Observaciones
          <textarea className={box} value={h.obs2 || ''} onChange={(e) => set('obs2', e.target.value)} />
        </label>
      </div>

      <div className={sec}>III. CRITERIOS DE INSPECCION</div>
      <div className="border border-t-0 border-black">
        <div className="flex justify-between px-2 py-1 font-bold text-xs border-b border-black">
          <span>BOTELLAS/TAPA, CORCHOS</span>
          <label>
            <input type="checkbox" checked={!!h.na_bot} onChange={(e) => set('na_bot', e.target.checked)} /> N/A
          </label>
        </div>
        <table className="w-full">{CRIT_BOT.map(critRow)}</table>
        <div className="flex justify-between px-2 py-1 font-bold text-xs border-y border-black">
          <span>ETIQUETAS/CAJAS/ SEPARADORES/TERMOENCOGIBLES</span>
          <label>
            <input type="checkbox" checked={!!h.na_etq} onChange={(e) => set('na_etq', e.target.checked)} /> N/A
          </label>
        </div>
        <table className="w-full">{CRIT_ETQ.map(critRow)}</table>
        <div className="p-2">
          <label>
            Observaciones
            <textarea className={box} value={h.obs3 || ''} onChange={(e) => set('obs3', e.target.value)} />
          </label>
        </div>
      </div>

      <div className={sec}>IV. RESULTADO DE LA INSPECCION</div>
      <div className="border border-t-0 border-black p-2 space-y-2">
        {DECISIONES.map((d) => (
          <label key={d} className="flex items-center gap-2 text-sm">
            <input type="radio" name="decision" checked={h.decision === d} onChange={() => set('decision', d)} />
            {d}
          </label>
        ))}
        <label>
          Comentarios
          <textarea className={box} value={h.comentarios || ''} onChange={(e) => set('comentarios', e.target.value)} />
        </label>
      </div>

      <div className={sec}>V. ACCION EN CASO DE NO CONFORMIDAD</div>
      <div className="border border-t-0 border-black p-2 grid grid-cols-2 gap-1">
        {ACCIONES.map((a) => (
          <label key={a} className="text-sm flex gap-2">
            <input type="checkbox" checked={(h.acciones || []).includes(a)} onChange={() => toggleArr('acciones', a)} />
            {a}
          </label>
        ))}
      </div>

      <div className={sec}>VII. FIRMAS</div>
      <div className="border border-t-0 border-black p-2 grid grid-cols-2 gap-3">
        <label>
          Inspector de Calidad
          <input className={box} value={h.inspector || ''} onChange={(e) => set('inspector', e.target.value)} />
        </label>
        <label>
          Responsable de Almacen
          <input className={box} value={h.resp_alm || ''} onChange={(e) => set('resp_alm', e.target.value)} />
        </label>
      </div>
      <p className="text-[10px] flex justify-between mt-2">
        <span>Y-FO-CS-001 REV.:01</span>
        <span>Aprobado:26-05-2026</span>
      </p>

      <div className="flex justify-end gap-2 mt-3 print:hidden">
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="border px-3" data-yazoo-print="1" onClick={print}>
          Imprimir
        </button>
        <button type="button" className="bg-[#DCA54C] px-4 py-1 rounded-full font-semibold" onClick={save}>
          Guardar
        </button>
      </div>
    </div>
  )
}