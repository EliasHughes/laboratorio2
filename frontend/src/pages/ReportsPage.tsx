import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { printInApp } from '../forms/printInApp'
import { printRecord } from './FormsPage'

type Row = {
  id: string
  module: string
  kind: string
  code: string
  title: string
  date: string
  status: string
  who: string
  source: 'live' | 'catalog'
  raw?: any
}

const MODULES = [
  { id: 'lims', label: 'LIMS / Laboratorio', live: true },
  { id: 'calidad', label: 'Registros de laboratorio', live: true },
  { id: 'ehs', label: 'EHS / Seguridad industrial', live: true },
  { id: 'inventario', label: 'Inventario y almacenes', live: true },
  { id: 'wms', label: 'WMS / Almacén piso', live: true },
  { id: 'compras', label: 'Compras y proveedores', live: true },
  { id: 'produccion', label: 'Producción', live: false },
  { id: 'ventas', label: 'Ventas y clientes', live: false },
  { id: 'logistica', label: 'Logística y distribución', live: false },
  { id: 'comercio', label: 'Comercio exterior', live: false },
  { id: 'mercadeo', label: 'Mercadeo', live: false },
  { id: 'id', label: 'I+D / Innovación', live: false },
  { id: 'rrhh', label: 'RRHH y nómina', live: false },
  { id: 'finanzas', label: 'Finanzas y contabilidad', live: false },
  { id: 'auditoria', label: 'Sistema y auditoría', live: true },
]

const CATALOG: Omit<Row, 'id'>[] = [
  { module: 'lims', kind: 'stock_lab', code: 'INF-LAB-001', title: 'Existencias almacén de laboratorio', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'lims', kind: 'fefo', code: 'INF-LAB-002', title: 'Reactivos próximos a vencer (FEFO)', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'calidad', kind: 'yfo', code: 'INF-CC-000', title: 'Libro de formularios Y-FO', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'ehs', kind: 'if', code: 'INF-EHS-001', title: 'Indicadores IF / IG / IA', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'ehs', kind: 'incidentes', code: 'INF-EHS-002', title: 'Registro de incidentes y casi-accidentes', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'ehs', kind: 'epp', code: 'INF-EHS-003', title: 'Entrega de EPP', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'inventario', kind: 'stock', code: 'INF-INV-001', title: 'Inventario valorizado / existencias', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'inventario', kind: 'kardex', code: 'INF-INV-002', title: 'Kardex de movimientos', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'wms', kind: 'tareas', code: 'INF-WMS-001', title: 'Tareas WMS (pending / done)', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'compras', kind: 'oc', code: 'INF-COM-001', title: 'Órdenes de compra', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
  { module: 'produccion', kind: 'ot', code: 'INF-PRD-001', title: 'Órdenes de producción', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'ventas', kind: 'fac', code: 'INF-VTA-001', title: 'Facturación y pedidos', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'logistica', kind: 'despacho', code: 'INF-LOG-001', title: 'Despachos y rutas', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'comercio', kind: 'aduana', code: 'INF-EXT-001', title: 'Despacho aduanal / BL', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'mercadeo', kind: 'campana', code: 'INF-MKT-001', title: 'Campañas y listados', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'id', kind: 'formula', code: 'INF-ID-001', title: 'Fórmulas y prototipos', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'rrhh', kind: 'asistencia', code: 'INF-RH-001', title: 'Asistencia y capacitaciones', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'finanzas', kind: 'diario', code: 'INF-FIN-001', title: 'Libro diario / CXC-CXP', date: '', status: 'futuro', who: '—', source: 'catalog' },
  { module: 'auditoria', kind: 'audit', code: 'INF-AUD-001', title: 'Bitácora de auditoría', date: '', status: 'plantilla', who: 'Sistema', source: 'catalog' },
]

const CHIP = [
  'bg-[#F3EFE8] text-[#1A120E]',
  'bg-amber-100 text-amber-900',
  'bg-lime-100 text-lime-900',
  'bg-sky-100 text-sky-900',
  'bg-rose-100 text-rose-900',
  'bg-violet-100 text-violet-900',
]

function unwrap(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.tasks)) return payload.tasks
  return []
}

function dayOf(r: any) {
  return String(r.created_at || r.updated_at || r.date || r.arrival_date || '').slice(0, 10)
}

function who(r: any) {
  return r.updated_by_name || r.created_by_name || r.user_name || r.username || r.registered_by || '—'
}

async function pull(url: string) {
  try {
    const { data } = await api.get(url)
    return unwrap(data)
  } catch {
    return []
  }
}

function printInforme(title: string, code: string, moduleLabel: string, lines: string[]) {
  const today = new Date().toISOString().slice(0, 10)
  const body = lines.length
    ? lines.map((l) => `<tr><td style="border:1px solid #C9C1B6;padding:6px 8px;font-size:12px">${l}</td></tr>`).join('')
    : `<tr><td style="padding:16px;text-align:center;color:#666">Sin datos capturados. El módulo se habilitará sin perder este formato.</td></tr>`
  printInApp(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${code}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;color:#1A120E;padding:18px}
      .paper{max-width:820px;margin:0 auto;border:1px solid #1A120E;padding:16px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      @media print{body{padding:0}.paper{border:none}}
    </style></head><body>
    <div class="paper">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1A120E;padding-bottom:8px">
        <img src="${location.origin}/yazoo.png" height="48"/>
        <div style="text-align:right;font-size:11px">
          RONES Y BEBIDAS DEL CARIBE YAZOO<br/>${moduleLabel}<br/>${code}
        </div>
      </div>
      <h2 style="text-align:center;font-size:16px;margin:14px 0">${title}</h2>
      <p style="font-size:12px">Fecha de emisión: ${today}</p>
      <table>${body}</table>
      <p style="font-size:10px;margin-top:24px;display:flex;justify-content:space-between">
        <span>Yazoo Lab · Informe interno</span><span>Página 1</span>
      </p>
    </div></body></html>`)
}

export default function ReportsPage() {
  const [params, setParams] = useSearchParams()
  const [live, setLive] = useState<Row[]>([])
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [moduleId, setModuleId] = useState(params.get('module') || '')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setErr('')
    try {
      const [forms, lots, products, moves, incidents, tasks] = await Promise.all([
        pull('/forms'),
        pull('/lots'),
        pull('/products'),
        pull('/movements'),
        pull('/ehs/incidents'),
        pull('/wms/tasks'),
      ])
      const out: Row[] = []
      forms.forEach((r: any) => {
        out.push({
          id: `form-${r.id}`,
          module: 'calidad',
          kind: 'yfo',
          code: r.form_code || 'Y-FO',
          title: r.title || r.form_type || 'Formulario',
          date: dayOf(r),
          status: r.status || 'guardado',
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      lots.forEach((r: any) => {
        out.push({
          id: `lot-${r.id}`,
          module: 'inventario',
          kind: 'stock',
          code: r.lot_number || `L-${r.id}`,
          title: r.product_name || r.name || 'Lote',
          date: dayOf(r),
          status: r.status || String(r.qty ?? ''),
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      products.forEach((r: any) => {
        out.push({
          id: `prd-${r.id}`,
          module: 'lims',
          kind: 'stock_lab',
          code: r.sku || r.code || `P-${r.id}`,
          title: r.name || 'Producto',
          date: dayOf(r),
          status: r.category || 'catálogo',
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      moves.forEach((r: any) => {
        out.push({
          id: `mov-${r.id}`,
          module: 'inventario',
          kind: 'kardex',
          code: `MOV-${r.id}`,
          title: r.notes || r.kind || 'Movimiento',
          date: dayOf(r),
          status: String(r.qty ?? ''),
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      incidents.forEach((r: any) => {
        out.push({
          id: `inc-${r.id}`,
          module: 'ehs',
          kind: 'incidentes',
          code: `EHS-${r.id}`,
          title: r.title || r.description || 'Incidente',
          date: dayOf(r),
          status: r.status || r.severity || 'abierto',
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      tasks.forEach((r: any) => {
        out.push({
          id: `wms-${r.id}`,
          module: 'wms',
          kind: 'tareas',
          code: `WMS-${r.id}`,
          title: `${r.task_type || 'tarea'} ${r.lot_number || ''}`,
          date: dayOf(r),
          status: r.status || '',
          who: who(r),
          source: 'live',
          raw: r,
        })
      })
      setLive(out)
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Algunas fuentes no respondieron')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const m = params.get('module') || ''
    if (m) setModuleId(m)
  }, [params])

  const merged = useMemo(() => {
    const rows = [...live]
    CATALOG.forEach((c, i) => {
      const exists = live.some((r) => r.module === c.module && r.kind === c.kind)
      if (!exists) rows.push({ ...c, id: `cat-${i}` })
    })
    return rows
  }, [live])

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase()
    return merged.filter((r) => {
      if (moduleId && r.module !== moduleId) return false
      if (from && r.date && r.date < from) return false
      if (to && r.date && r.date > to) return false
      if (!s) return true
      return `${r.code} ${r.title} ${r.kind} ${r.who}`.toLowerCase().includes(s)
    })
  }, [merged, q, moduleId, from, to])

  const chips = useMemo(() => {
    return MODULES.map((m) => ({
      ...m,
      n: merged.filter((r) => r.module === m.id && r.source === 'live').length,
    }))
  }, [merged])

  const printRow = (r: Row) => {
    if (r.raw && r.module === 'calidad' && r.kind === 'yfo') {
      printRecord(r.raw)
      return
    }
    const label = MODULES.find((m) => m.id === r.module)?.label || r.module
    const lines = r.raw
      ? Object.entries(r.raw)
          .filter(([, v]) => v != null && typeof v !== 'object')
          .slice(0, 24)
          .map(([k, v]) => `<b>${k}</b>: ${String(v)}`)
      : []
    printInforme(r.title, r.code, label, lines)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">ERP Yazoo</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Reportes generales</h2>
        <p className="text-sm text-[#5C5046]">
          Informes de todos los módulos. Lo que aún no tiene datos se imprime como plantilla oficial.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6E2DC] bg-white p-4 grid md:grid-cols-4 gap-3 text-sm">
        <label className="md:col-span-2 block">
          <span className="text-[10px] uppercase tracking-wide text-[#8A8076]">Búsqueda</span>
          <input
            className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2"
            placeholder="Código, título, lote, incidente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-[#8A8076]">Módulo</span>
          <select
            className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2 bg-white"
            value={moduleId}
            onChange={(e) => {
              setModuleId(e.target.value)
              setParams(e.target.value ? { module: e.target.value } : {})
            }}
          >
            <option value="">Todos</option>
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="mt-5 border border-[#C9C2B6] rounded-xl px-2 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="mt-5 border border-[#C9C2B6] rounded-xl px-2 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button type="button" className="rounded-full border px-4 py-1.5" onClick={() => { setQ(''); setModuleId(''); setFrom(''); setTo(''); setParams({}) }}>
            Limpiar
          </button>
          <button type="button" className="rounded-full bg-[#DCA54C] px-4 py-1.5 font-semibold" onClick={load}>
            {loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {err ? <p className="text-sm text-rose-700">{err}</p> : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {chips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              const next = moduleId === c.id ? '' : c.id
              setModuleId(next)
              setParams(next ? { module: next } : {})
            }}
            className={`rounded-xl px-3 py-2 text-left ${CHIP[i % CHIP.length]} ${moduleId === c.id ? 'ring-2 ring-[#DCA54C]' : ''}`}
          >
            <p className="text-xl font-semibold leading-none">{c.n}</p>
            <p className="text-[10px] mt-1 leading-tight">{c.label}</p>
            {!c.live ? <p className="text-[9px] opacity-70">próximo</p> : null}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E6E2DC] bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3EFE8] text-left text-[10px] uppercase tracking-wide text-[#5C5046]">
              <th className="px-3 py-2">Módulo</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Informe</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Origen</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-[#EFEAE3]">
                <td className="px-3 py-2 text-[11px]">{MODULES.find((m) => m.id === r.module)?.label}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{r.code}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.date || '—'}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 text-[11px]">{r.source === 'live' ? 'dato real' : r.status === 'futuro' ? 'módulo futuro' : 'plantilla'}</td>
                <td className="px-3 py-2">
                  <button type="button" className="text-xs font-semibold text-[#8A5A12] underline" onClick={() => printRow(r)}>
                    Imprimir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}