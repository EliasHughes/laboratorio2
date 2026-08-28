import { useEffect, useState } from 'react'
import api from '../services/api'
import { printRecord } from './FormsPage'

function cell(v: any) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function venc(r: any) {
  return r.expiry_date || r.expiration_date || r.vence || '—'
}

function printHtml(title: string, body: string) {
  const w = window.open('', '_blank')
  if (!w) return
  const logo = `${window.location.origin}/yazoo.png`
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#000;padding:16px}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #000;padding:4px 6px;text-align:left}
      th{background:#f0f0f0}
    </style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <img src="${logo}" height="44" alt="Yazoo"/>
      <h2 style="margin:0">${title}</h2>
      <span></span>
    </div>
    ${body}
    <p style="font-size:10px;margin-top:16px">Yazoo Investments, S.R.L. · San Pedro de Macorís</p>
    </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

const TABS = [
  { id: 'lotes', label: 'Inventario / lotes', hint: 'Stock, vencimiento, ubicación' },
  { id: 'recepciones', label: 'Recepciones', hint: 'Ingresos a almacén' },
  { id: 'compras', label: 'Órdenes de compra', hint: 'OC y estado' },
  { id: 'calidad', label: 'Calidad / formularios', hint: 'Registros de laboratorio' },
  { id: 'orden', label: 'Auditoría', hint: 'Quién / qué / cuándo' },
]

export default function ReportsPage() {
  const [kind, setKind] = useState('lotes')
  const [rows, setRows] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState('')

  const load = async () => {
    setErr('')
    try {
      const path =
        kind === 'lotes'
          ? '/lots'
          : kind === 'recepciones'
            ? '/receiving/recent'
            : kind === 'compras'
              ? '/purchases/orders'
              : kind === 'calidad'
                ? '/forms'
                : '/audit'
      const data = await api.get(path)
      setRows(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch {
      setErr('No se pudo cargar este reporte.')
      setRows([])
    }
  }

  useEffect(() => {
    load()
  }, [kind])

  const byDate = rows.filter((r) => {
    const raw = r.created_at || r.arrival_date || r.received_date || r.timestamp || ''
    const d = raw ? String(raw).slice(0, 10) : ''
    if (from && d && d < from) return false
    if (to && d && d > to) return false
    return true
  })

  const visible = byDate.filter((r) => {
    const s = q.trim().toLowerCase()
    if (!s) return true
    return JSON.stringify(r).toLowerCase().includes(s)
  })

  const line = (r: any) => {
    if (kind === 'lotes') {
      return `${cell(r.lot_number)} · ${cell(r.product_name)} · ${cell(r.current_qty || r.qty)} · vence ${venc(r)} · ${cell(r.location || r.warehouse)}`
    }
    if (kind === 'recepciones') {
      return `${cell(r.lot_number || r.lot_code)} · ${cell(r.product_name)} · ${cell(r.quantity)} · ${cell(r.location)}`
    }
    if (kind === 'compras') return `${cell(r.number)} · ${cell(r.status)} · ${cell(r.currency)}`
    if (kind === 'calidad') {
      return `${cell(r.form_code)} · ${cell(r.title)} · ${cell(r.status)} · ${cell(r.created_by_name || r.user_name)}`
    }
    return `${cell(r.action)} · ${cell(r.user_name || r.username)} · ${cell(r.module)} · ${cell(r.created_at || r.timestamp)}`
  }

  const printAll = () => {
    const title = TABS.find((t) => t.id === kind)?.label || 'Reporte'
    const body = `<table><thead><tr><th>#</th><th>Detalle</th></tr></thead><tbody>
      ${visible.map((r, i) => `<tr><td>${i + 1}</td><td>${line(r)}</td></tr>`).join('')}
      </tbody></table>`
    printHtml(title, body)
  }

  return (
    <div className="space-y-5 text-[#1A120E]">
      <div>
        <h2 className="text-xl font-semibold">Reportes</h2>
        <p className="text-sm text-stone-500">Listado o ficha · español · membrete Yazoo</p>
      </div>

      <div className="grid sm:grid-cols-5 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setKind(t.id)}
            className={`text-left rounded-xl border bg-white px-3 py-3 ${kind === t.id ? 'border-[#DCA54C]' : 'border-[#E6E2DC]'}`}
          >
            <p className="font-medium text-sm">{t.label}</p>
            <p className="text-xs text-stone-500">{t.hint}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Desde
          <input type="date" className="block border rounded-lg px-2 py-1" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm">
          Hasta
          <input type="date" className="block border rounded-lg px-2 py-1" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <input
          className="rounded-lg border border-[#E6E2DC] px-3 py-2 text-sm min-w-[260px]"
          placeholder="Buscar código, título, estado, usuario..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="bg-[#DCA54C] px-4 py-2 rounded-full font-semibold" onClick={printAll}>
          Imprimir listado
        </button>
      </div>

      {err ? <p className="text-red-700 text-sm">{err}</p> : null}

      <div className="rounded-xl border border-[#E6E2DC] bg-white divide-y">
        {visible.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">Sin registros para este filtro.</p>
        ) : (
          visible.map((r, i) => (
            <div key={r.id || i} className="px-4 py-3 flex justify-between gap-3 text-sm">
              <span>{line(r)}</span>
              {kind === 'calidad' && (
                <button type="button" className="text-[#8A5A12] shrink-0" onClick={() => printRecord(r)}>
                  Imprimir ficha
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}