import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

function unwrap(p: any): any[] {
  if (Array.isArray(p)) return p
  if (Array.isArray(p?.data)) return p.data
  if (Array.isArray(p?.items)) return p.items
  return []
}

function isLab(loc: string) {
  const s = (loc || '').toLowerCase()
  return s.includes('lab') || s.includes('laboratorio') || s.includes('calidad')
}

function tone(qty: number, initial: number, expiry?: string) {
  if (expiry && expiry.slice(0, 10) < new Date().toISOString().slice(0, 10)) return 'bg-rose-200 text-rose-900'
  const p = initial > 0 ? qty / initial : 1
  if (p <= 0.1) return 'bg-rose-200 text-rose-900'
  if (p <= 0.3) return 'bg-amber-200 text-amber-900'
  return 'bg-lime-200 text-lime-900'
}

export default function LabStockPage() {
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    api.get('/lots').then(({ data }) => setRows(unwrap(data))).catch(() => setRows([]))
  }, [])

  const lab = useMemo(() => {
    const s = q.toLowerCase()
    return rows.filter((r) => isLab(r.location || r.warehouse || '')).filter((r) =>
      `${r.lot_number} ${r.product_name || ''} ${r.location || ''}`.toLowerCase().includes(s),
    )
  }, [rows, q])

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">LIMS</p>
        <h2 className="text-2xl font-semibold">Almacén de laboratorio</h2>
        <p className="text-sm text-[#5C5046]">Independiente del almacén central. Semáforo de existencias y caducidad.</p>
      </div>
      <input className="border rounded-xl px-3 py-2 text-sm max-w-md" placeholder="Buscar lote / reactivo" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="rounded-2xl border bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3EFE8] text-left text-[10px] uppercase text-[#5C5046]">
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Vence</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lab.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.lot_number}</td>
                <td className="px-3 py-2">{r.product_name || r.name || '—'}</td>
                <td className="px-3 py-2">{r.location || '—'}</td>
                <td className="px-3 py-2">{String(r.expiry_date || '').slice(0, 10)}</td>
                <td className="px-3 py-2">{r.current_qty ?? r.qty}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${tone(Number(r.current_qty ?? r.qty ?? 0), Number(r.initial_qty ?? r.current_qty ?? 1), r.expiry_date)}`}>
                    stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lab.length === 0 ? <p className="text-sm text-[#8A8076]">No hay lotes con ubicación “laboratorio”. En Recepción / WMS usa destino cuyo nombre contenga laboratorio.</p> : null}
    </div>
  )
}