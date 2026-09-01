import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import PageHeader from './PageHeader'
import { Warehouse, AlertCircle, FlaskConical, Snowflake, Package } from 'lucide-react'

type Stock = { location: string; qty: number }
type Lot = {
  id: number
  product_name?: string
  product_code?: string
  lot_number?: string
  current_qty?: number
  location?: string
  status?: string
  expiry_date?: string
  expiration_date?: string
  stocks?: Stock[]
}

type Row = Lot & { location: string; current_qty: number }

function areaOf(name: string) {
  const n = (name || '').trim().toLowerCase()
  if (n.startsWith('laboratorio')) return 'Laboratorio'
  if (n.startsWith('refrigerado')) return 'Refrigerado'
  if (n === 'varias') return 'Almacén central'
  return name.trim() || 'Almacén central'
}

export default function WarehousePage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api
      .get('/lots')
      .then((r) => setLots(Array.isArray(r.data) ? r.data : []))
      .catch((err) => setError(err?.response?.data?.detail || 'No se pudo cargar el almacén'))
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>()
    lots.forEach((l) => {
      const parts =
        l.stocks && l.stocks.length
          ? l.stocks.filter((s) => Number(s.qty) > 0)
          : [
              {
                location: areaOf(l.location || 'Almacén central'),
                qty: Number(l.current_qty || 0),
              },
            ]
      parts.forEach((s) => {
        if (Number(s.qty) <= 0) return
        const key = areaOf(s.location)
        if (key.toLowerCase() === 'varias') return
        if (filter && !key.toLowerCase().includes(filter.toLowerCase())) return
        const arr = map.get(key) || []
        arr.push({ ...l, location: key, current_qty: Number(s.qty) })
        map.set(key, arr)
      })
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [lots, filter])

  const totals = useMemo(() => {
    const t: Record<string, { qty: number; lots: number }> = {}
    grouped.forEach(([loc, rows]) => {
      t[loc] = {
        qty: rows.reduce((s, r) => s + Number(r.current_qty || 0), 0),
        lots: rows.length,
      }
    })
    return t
  }, [grouped])

  const cards = [
    { key: 'Almacén central', icon: Package, hint: 'Recepción' },
    { key: 'Laboratorio', icon: FlaskConical, hint: 'Listo para retiro' },
    { key: 'Refrigerado', icon: Snowflake, hint: 'Cadena de frío' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Almacén"
        subtitle="Stock real por área. Un mismo lote puede aparecer en Almacén y en Laboratorio."
        icon={<Warehouse className="w-6 h-6 text-[#DCA54C]" />}
      />
      {error && (
        <p className="flex items-center gap-2 text-sm text-[#8B1E1E]">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          const data = totals[c.key] || { qty: 0, lots: 0 }
          return (
            <div key={c.key} className="rounded-2xl border border-[#E6E2DC] bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-[#8A7B6B] text-xs uppercase tracking-wider">
                <Icon className="w-4 h-4 text-[#DCA54C]" />
                {c.key}
              </div>
              <p className="mt-1 text-2xl font-semibold text-[#1A120E]">{data.qty}</p>
              <p className="text-xs text-[#8A7B6B]">
                {data.lots} lote(s) · {c.hint}
              </p>
            </div>
          )
        })}
      </div>

      <input
        className="max-w-md w-full border border-[#C9C2B6] rounded-xl px-3 py-2 text-sm text-[#1A120E] bg-white"
        placeholder="Filtrar ubicación…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="space-y-4">
        {grouped.map(([loc, rows]) => (
          <section key={loc} className="bg-white border border-[#E6E2DC] rounded-xl overflow-hidden">
            <header className="px-4 py-2 bg-[#1A120E] text-[#DCA54C] text-sm font-medium flex justify-between">
              <span>{loc}</span>
              <span className="text-[#A89F95]">{rows.length} lote(s)</span>
            </header>
            <table className="w-full text-sm text-[#1A120E]">
              <thead className="bg-[#F5F2ED] text-xs text-[#5C5046]">
                <tr>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">Lote</th>
                  <th className="text-right px-3 py-2">Cantidad</th>
                  <th className="text-left px-3 py-2">Vence</th>
                  <th className="text-left px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={`${l.id}-${l.location}`} className="border-t border-[#E6E2DC]">
                    <td className="px-3 py-2">
                      {l.product_code ? `${l.product_code} · ` : ''}
                      {l.product_name || '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{l.lot_number}</td>
                    <td className="px-3 py-2 text-right">{l.current_qty}</td>
                    <td className="px-3 py-2">{l.expiration_date || l.expiry_date || '—'}</td>
                    <td className="px-3 py-2">{l.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
        {!grouped.length && <p className="text-sm text-[#8A8076]">No hay lotes para mostrar.</p>}
      </div>
    </div>
  )
}