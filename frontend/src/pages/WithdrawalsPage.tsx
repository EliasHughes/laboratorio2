import { FormEvent, useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from './PageHeader'
import { ArrowDownToLine, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

type Product = { id: number; name: string; code?: string; unit?: string }
type LotOpt = {
  id: number
  lot_number: string
  current_qty: number
  expiry_date?: string
  location?: string
  status?: string
  suggested?: boolean
}

export default function WithdrawalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [lots, setLots] = useState<LotOpt[]>([])
  const [productId, setProductId] = useState('')
  const [lotId, setLotId] = useState('')
  const [qty, setQty] = useState('')
  const [destination, setDestination] = useState('Laboratorio')
  const [reason, setReason] = useState('Uso en análisis')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  useEffect(() => {
    api
      .get('/products')
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('No se pudieron cargar productos'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!productId) {
      setLots([])
      setLotId('')
      return
    }
    api
      .get(`/withdrawals/lots/${productId}`)
      .then((r) => {
        const list: LotOpt[] = Array.isArray(r.data) ? r.data : []
        setLots(list)
        const sug = list.find((l) => l.suggested) || list[0]
        setLotId(sug ? String(sug.id) : '')
      })
      .catch((err) => {
        setLots([])
        setError(err?.response?.data?.detail || 'Sin lotes FEFO para este producto')
      })
  }, [productId])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')
    setSaving(true)
    try {
      await api.post('/withdrawals', {
        product_id: Number(productId),
        lot_id: Number(lotId),
        quantity: Number(qty),
        destination,
        reason,
        notes,
      })
      setOk('Retiro registrado. Kardex actualizado.')
      setQty('')
      const r = await api.get(`/withdrawals/lots/${productId}`)
      setLots(Array.isArray(r.data) ? r.data : [])
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : 'No se pudo registrar el retiro')
    } finally {
      setSaving(false)
    }
  }

  const selected = lots.find((l) => String(l.id) === lotId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retiros y despachos"
        subtitle="Solo lotes ya transferidos a Laboratorio o Refrigerado. FEFO sugiere el que vence primero."
        icon={<ArrowDownToLine className="w-6 h-6 text-[#DCA54C]" />}
      />

      {error && (
        <p className="flex items-center gap-2 text-sm text-[#8B1E1E] bg-[#F9EAEA] border border-[#E8C4C4] px-3 py-2 rounded">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
      {ok && (
        <p className="flex items-center gap-2 text-sm text-[#4A5D23] bg-[#E9EFDF] px-3 py-2 rounded">
          <CheckCircle2 className="w-4 h-4" /> {ok}
        </p>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-[#DCA54C]" />
      ) : (
        <form onSubmit={onSubmit} className="bg-white border border-[#E6E2DC] rounded-xl p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-[#5C5046]">
            Producto
            <select
              required
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} · ` : ''}
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[#5C5046]">
            Lote (FEFO)
            <select
              required
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lot_number} · {l.current_qty} · vence {l.expiry_date || '—'} · {l.location || 's/u'}
                  {l.suggested ? ' · sugerido' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[#5C5046]">
            Cantidad {selected ? `(máx ${selected.current_qty})` : ''}
            <input
              required
              type="number"
              min="0.0001"
              step="any"
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
          <label className="text-xs text-[#5C5046]">
            Destino
            <input
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>
          <label className="text-xs text-[#5C5046] sm:col-span-2">
            Motivo
            <input
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className="text-xs text-[#5C5046] sm:col-span-2">
            Notas
            <textarea
              className="mt-1 w-full border border-[#C9C2B6] rounded px-2 py-2 text-sm text-[#1A120E] bg-white min-h-[64px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              disabled={saving}
              className="px-4 py-2 rounded bg-[#DCA54C] text-[#1A120E] text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Registrar retiro'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
