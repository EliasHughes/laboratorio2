import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  ArrowDownToLine, Save, Loader2, CheckCircle2, Package
} from 'lucide-react'

interface Product {
  id: number
  code: string
  name: string
  unit: string
  current_stock: number
}

interface FefoLot {
  id: number
  lot_number: string
  current_qty: number
  expiry_date: string
  status: string
  location?: string
}

export default function WithdrawalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [fefoLots, setFefoLots] = useState<FefoLot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFefo, setLoadingFefo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product_id: 0,
    lot_id: 0,
    qty: '',
    reason: 'Uso en análisis',
    destination: 'Laboratorio',
    notes: '',
  })

  useEffect(() => {
    api
      .get<Product[]>('/products')
      .then(({ data }) => {
        setProducts(data)
        if (data.length) setForm((f) => ({ ...f, product_id: data[0].id }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!form.product_id) {
      setFefoLots([])
      return
    }
    setLoadingFefo(true)
    api
      .get<FefoLot[]>(`/movements/fefo/${form.product_id}`)
      .then(({ data }) => {
        setFefoLots(data)
        if (data.length) {
          setForm((f) => ({ ...f, lot_id: data[0].id }))
        } else {
          setForm((f) => ({ ...f, lot_id: 0 }))
        }
      })
      .catch(() => setFefoLots([]))
      .finally(() => setLoadingFefo(false))
  }, [form.product_id])

  const selectedLot = fefoLots.find((l) => l.id === form.lot_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      await api.post('/movements', {
        lot_id: form.lot_id,
        qty: Number(form.qty),
        type: 'salida',
        reason: form.reason || null,
        destination: form.destination || null,
        notes: form.notes || null,
      })
      setSuccess(true)
      setForm((f) => ({ ...f, qty: '', notes: '' }))
      // refrescar FEFO
      const { data } = await api.get<FefoLot[]>(`/movements/fefo/${form.product_id}`)
      setFefoLots(data)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al registrar el retiro')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-stone-500">Cargando...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
          <ArrowDownToLine className="w-5 h-5 text-yazoo-gold" />
          Retiros y Despachos
        </h2>
        <p className="text-sm text-stone-400 mt-1">
          Salidas de inventario con selección automática FEFO
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-caribe-border bg-caribe-dark/40">
          <p className="text-sm font-medium text-stone-200">Registrar retiro</p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Retiro registrado correctamente
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
              Producto
            </label>
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} (stock: {p.current_stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
              Lote sugerido (FEFO)
            </label>
            {loadingFefo ? (
              <p className="text-sm text-stone-500">Buscando lotes...</p>
            ) : fefoLots.length === 0 ? (
              <div className="p-3 rounded-lg border border-amber-800/50 bg-amber-950/20 text-amber-300 text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                No hay lotes disponibles para este producto
              </div>
            ) : (
              <select
                value={form.lot_id}
                onChange={(e) => setForm({ ...form, lot_id: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              >
                {fefoLots.map((l, idx) => (
                  <option key={l.id} value={l.id}>
                    {idx === 0 ? '★ ' : ''}
                    {l.lot_number} — {l.current_qty} und — vence {l.expiry_date}
                    {l.location ? ` — ${l.location}` : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedLot && (
              <p className="text-xs text-stone-500 mt-1.5">
                Disponible: <span className="text-yazoo-gold font-medium">{selectedLot.current_qty}</span>
                {' · '}Estado: {selectedLot.status}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
                Cantidad a retirar *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                max={selectedLot?.current_qty || undefined}
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
                Motivo
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              >
                <option>Uso en análisis</option>
                <option>Preparación de solución</option>
                <option>Despacho a producción</option>
                <option>Muestra de control</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
                Destino
              </label>
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
                Notas
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-caribe-border bg-caribe-dark/30">
          <button
            type="submit"
            disabled={saving || !form.lot_id || !form.qty}
            className="flex items-center gap-2 px-6 py-2.5 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Registrar retiro
          </button>
        </div>
      </form>
    </div>
  )
}