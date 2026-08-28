import { useEffect, useMemo, useState, FormEvent } from 'react'
import api from '../services/api'
import { Warehouse, Loader2, AlertCircle, CheckCircle2, ArrowRightLeft } from 'lucide-react'

const LOCATIONS = [
  'Almacén central',
  'Cuarentena',
  'Laboratorio',
  'Refrigerado',
  'Ácidos',
  'Inflamables',
]

type Lot = {
  id: number
  product_id: number
  lot_number?: string
  lot_code?: string
  current_qty?: number
  quantity?: number
  expiry_date?: string
  location?: string
  status?: string
}

type Product = { id: number; name: string; code?: string; unit?: string }

export default function WarehousePage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [lotId, setLotId] = useState('')
  const [toLoc, setToLoc] = useState('Laboratorio')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('Despacho a laboratorio')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, l] = await Promise.all([api.get('/products'), api.get('/lots')])
      setProducts(Array.isArray(p.data) ? p.data : p.data?.items || [])
      setLots(Array.isArray(l.data) ? l.data : l.data?.items || [])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error cargando almacén')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pmap = useMemo(() => {
    const m = new Map<number, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  const visible = useMemo(() => {
    return lots.filter((l) => !locFilter || (l.location || '') === locFilter)
  }, [lots, locFilter])

  const transfer = async (e: FormEvent) => {
    e.preventDefault()
    if (!lotId) return
    setSaving(true)
    setError('')
    setOk('')
    try {
            const { data } = await api.post('/movements/transfer', {
        lot_id: Number(lotId),
        to_location: toLoc,
        quantity: Number(qty),
        reason,
        notes: notes || null,
      })
      setOk(`Transferido ${data.lot_number}: ${data.from_location} → ${data.to_location}`)
      setNotes('')
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo transferir')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-amber-400" />
          Almacén
        </h2>
        <p className="text-sm text-stone-400 mt-1">Stock por ubicación · transferencias</p>
      </div>

      {ok && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {ok}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form
        onSubmit={transfer}
        className="rounded-xl border border-caribe-border bg-caribe-card p-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
      >
        <div className="sm:col-span-4 text-xs text-stone-400 uppercase flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5" /> Transferir lote
        </div>
        <select
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
          required
          className="px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
        >
          <option value="">Seleccionar lote</option>
          {lots.map((l) => {
            const p = pmap.get(l.product_id)
            return (
              <option key={l.id} value={l.id}>
                {l.lot_number || l.lot_code} · {p?.name || l.product_id} · {l.location || '—'}
              </option>
            )
          })}
        </select>
        <select
          value={toLoc}
          onChange={(e) => setToLoc(e.target.value)}
          className="px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
        >
          {LOCATIONS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>

                <input
          type="number"
          min="0.0001"
          step="any"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
          placeholder="Cantidad *"
          className="px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
        />
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
        >
          <option>Despacho a laboratorio</option>
          <option>Muestreo QC</option>
          <option>Reposición de stock de lab</option>
          <option>Devolución a almacén</option>
          <option>Cuarentena</option>
        </select>
        
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          className="px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="py-2 rounded-lg bg-amber-500 text-[#1a120c] text-sm font-semibold disabled:opacity-60"
        >
          {saving ? '...' : 'Transferir'}
        </button>
      </form>

      <div className="flex gap-3">
        <select
          value={locFilter}
          onChange={(e) => setLocFilter(e.target.value)}
          className="px-3 py-2 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100"
        >
          <option value="">Todas las ubicaciones</option>
          {LOCATIONS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Cargando...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 uppercase border-b border-caribe-border">
                <th className="px-4 py-2">Lote</th>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Cant.</th>
                <th className="px-4 py-2">Ubicación</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    Sin lotes
                  </td>
                </tr>
              ) : (
                visible.map((l) => {
                  const p = pmap.get(l.product_id)
                  return (
                    <tr key={l.id} className="border-b border-caribe-border/40">
                      <td className="px-4 py-2 font-mono text-xs text-amber-400">
                        {l.lot_number || l.lot_code}
                      </td>
                      <td className="px-4 py-2 text-stone-200">{p ? `${p.code} — ${p.name}` : l.product_id}</td>
                      <td className="px-4 py-2">{l.current_qty ?? l.quantity ?? 0}</td>
                      <td className="px-4 py-2 text-stone-400">{l.location || '—'}</td>
                      <td className="px-4 py-2 text-xs">{l.status || '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}