import { useEffect, useState, FormEvent } from 'react'
import api from '../services/api'
import {
  PackagePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

type Product = {
  id: number
  name: string
  code?: string
  unit?: string
  category?: string
}

type LotRow = {
  id: number
  product_id: number
  product_name?: string
  lot_code: string
  quantity: number
  unit?: string
  expiry_date?: string
  arrival_date?: string
  supplier?: string
  status?: string
  location?: string
}

export default function ReceivingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [recent, setRecent] = useState<LotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const [productId, setProductId] = useState('')
  const [lotCode, setLotCode] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('und')
  const [expiry, setExpiry] = useState('')
  const [arrival, setArrival] = useState(() => new Date().toISOString().slice(0, 10))
  const [supplier, setSupplier] = useState('')
  const [invoice, setInvoice] = useState('')
  const [location, setLocation] = useState('Almacén central')
  const [notes, setNotes] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, r] = await Promise.all([
        api.get('/products'),
        api.get('/receiving/recent'),
      ])
      const plist = Array.isArray(p.data) ? p.data : p.data?.items || []
      setProducts(plist)
      setRecent(Array.isArray(r.data) ? r.data : [])
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Error cargando datos de recepción')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const prod = products.find((x) => String(x.id) === productId)
    if (prod?.unit) setUnit(prod.unit)
  }, [productId, products])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')

    if (!productId) {
      setError('Seleccione un producto')
      return
    }
    if (!lotCode.trim()) {
      setError('Ingrese código de lote')
      return
    }
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      setError('Cantidad inválida')
      return
    }

    setSaving(true)
    try {
      const { data } = await api.post('/receiving', {
        product_id: Number(productId),
        lot_code: lotCode.trim(),
        quantity: qty,
        unit: unit || 'und',
        expiry_date: expiry || null,
        arrival_date: arrival || null,
        supplier: supplier || null,
        invoice_ref: invoice || null,
        location: location || 'Almacén central',
        notes: notes || null,
      })
      setOk(
        data?.kardex && data.kardex !== 'ok'
          ? `Lote creado. Kardex: ${data.kardex}`
          : 'Recepción registrada. Revisa Kardex (ingreso).',
      )
      setLotCode('')
      setQuantity('')
      setExpiry('')
      setSupplier('')
      setInvoice('')
      setNotes('')
      await load()
      setTimeout(() => setOk(''), 3500)
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : 'No se pudo registrar la recepción')
    } finally {
      setSaving(false)
    }
  }

  const statusColor = (s?: string) => {
    const v = (s || '').toLowerCase()
    if (v === 'vencido') return 'text-rose-400'
    if (v === 'por_vencer') return 'text-amber-400'
    if (v === 'cuarentena') return 'text-sky-400'
    return 'text-emerald-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-amber-400" />
            Recepción / Ingresos
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            Registro de entradas a almacén · genera lote y stock
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-stone-400 hover:text-amber-400 border border-caribe-border rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {ok && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {ok}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulario */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 rounded-xl border border-caribe-border bg-caribe-card p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wide">
            Nueva recepción
          </h3>

          <div>
            <label className="block text-xs text-stone-400 mb-1 uppercase">Producto *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              required
            >
              <option value="">Seleccionar producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} — ` : ''}
                  {p.name}
                </option>
              ))}
            </select>
            {products.length === 0 && !loading && (
              <p className="text-[11px] text-amber-500 mt-1">
                No hay productos. Crea productos en Inventario primero.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-stone-400 mb-1 uppercase">Lote *</label>
              <input
                value={lotCode}
                onChange={(e) => setLotCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                placeholder="Ej. L-2026-001"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Cantidad *</label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Unidad</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                placeholder="ml, g, und..."
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Ubicación</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Fecha llegada</label>
              <input
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Vencimiento</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Proveedor</label>
              <input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Factura / Ref.</label>
              <input
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone-400 mb-1 uppercase">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving || products.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-[#1a120c] font-semibold text-sm hover:bg-amber-400 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
            Registrar recepción
          </button>
        </form>

        {/* Recientes */}
        <div className="lg:col-span-3 rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
          <div className="px-5 py-3 border-b border-caribe-border">
            <h3 className="text-sm font-semibold text-stone-200">Últimos ingresos</h3>
          </div>
          {loading ? (
            <div className="p-10 text-center text-stone-500 text-sm">Cargando...</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center text-stone-500 text-sm">
              Aún no hay recepciones registradas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500 uppercase border-b border-caribe-border">
                    <th className="px-4 py-2">Lote</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cant.</th>
                    <th className="px-4 py-2">Vence</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-caribe-border/40 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-xs text-amber-400">{r.lot_code}</td>
                      <td className="px-4 py-2.5 text-stone-200">{r.product_name || r.product_id}</td>
                      <td className="px-4 py-2.5 text-stone-300">
                        {r.quantity} {r.unit || ''}
                      </td>
                      <td className="px-4 py-2.5 text-stone-400 text-xs">
                        {r.expiry_date || '—'}
                      </td>
                      <td className={`px-4 py-2.5 text-xs font-medium ${statusColor(r.status)}`}>
                        {r.status || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-stone-500">{r.location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}