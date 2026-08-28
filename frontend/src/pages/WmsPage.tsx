import { useEffect, useState, FormEvent } from 'react'
import api from '../services/api'
import { ScanLine, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

type Lot = {
  id: number
  lot_number?: string
  lot_code?: string
  current_qty?: number
  quantity?: number
  location?: string
  product_id?: number
}
type Product = { id: number; name: string; code?: string }

export default function WmsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [lotId, setLotId] = useState('')
  const [qty, setQty] = useState('')
  const [dest, setDest] = useState('Laboratorio')
  const [taskId, setTaskId] = useState('')
  const [barcode, setBarcode] = useState('')
  const [scanQty, setScanQty] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const [l, p, t] = await Promise.all([
      api.get('/lots').catch(() => ({ data: [] })),
      api.get('/products').catch(() => ({ data: [] })),
      api.get('/wms/tasks').catch(() => ({ data: [] })),
    ])
    setLots(Array.isArray(l.data) ? l.data : l.data?.items || [])
    setProducts(Array.isArray(p.data) ? p.data : p.data?.items || [])
    setTasks(Array.isArray(t.data) ? t.data : [])
  }

  useEffect(() => {
    load()
  }, [])

  const pname = (id?: number) => {
    const p = products.find((x) => x.id === id)
    return p ? `${p.code || ''} ${p.name}`.trim() : ''
  }

  const createTask = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      await api.post('/wms/tasks', {
        task_type: 'transfer',
        lot_id: Number(lotId),
        qty: Number(qty),
        to_location: dest,
      })
      setMsg('Tarea creada. Escanea el lote para confirmar.')
      setQty('')
      await load()
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se pudo crear la tarea')
    }
  }

  const scan = async (e: FormEvent) => {
    e.preventDefault()
    if (!taskId) return
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      const { data } = await api.post(`/wms/tasks/${taskId}/scan`, {
        barcode,
        qty: Number(scanQty),
      })
      setMsg(`Listo · ${data.lot_number} → ${data.to_location} (${data.status})`)
      setBarcode('')
      await load()
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Scan rechazado')
    } finally {
      setBusy(false)
    }
  }

  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const done = tasks.filter((t) => t.status === 'done').slice(0, 8)

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-amber-400" />
          WMS · Piso
        </h2>
        <p className="text-sm text-stone-400 mt-1">Elige lote → crea tarea → escanea el mismo código.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm flex gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
        </div>
      )}
      {err && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {err}
        </div>
      )}

      <form onSubmit={createTask} className="rounded-xl border border-caribe-border bg-caribe-card p-4 space-y-3">
        <p className="text-xs uppercase text-stone-500">Nueva tarea</p>
        <select
          required
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
          className="w-full px-3 py-3 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100"
        >
          <option value="">Lote *</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.lot_number || l.lot_code} · {pname(l.product_id)} · {l.current_qty ?? l.quantity} · {l.location || 's/u'}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            type="number"
            step="any"
            min="0.0001"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Cantidad *"
            className="px-3 py-3 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100"
          />
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="px-3 py-3 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100"
          >
            <option>Almacén central</option>
            <option>Cuarentena</option>
            <option>Laboratorio</option>
            <option>Refrigerado</option>
            <option>Granel / tanques</option>
            <option>Barricas</option>
            <option>Envasado</option>
            <option>Despacho</option>
            <option>Devoluciones</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 rounded-lg bg-amber-500 text-[#1a120c] font-semibold">
          Crear tarea
        </button>
      </form>

      <form onSubmit={scan} className="rounded-xl border border-caribe-border bg-caribe-card p-4 space-y-3">
        <p className="text-xs uppercase text-stone-500">Confirmar scan</p>
        <select
          required
          value={taskId}
          onChange={(e) => {
            setTaskId(e.target.value)
            const t = pending.find((x) => String(x.id) === e.target.value)
            if (t) {
              setBarcode(t.lot_number || t.barcode || '')
              setScanQty(String(t.qty_planned || ''))
            }
          }}
          className="w-full px-3 py-3 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100"
        >
          <option value="">Tarea pendiente *</option>
          {pending.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.id} {t.lot_number} · {t.qty_planned} → {t.to_location}
            </option>
          ))}
        </select>
        <input
          required
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Escanea el lote (debe coincidir)"
          className="w-full px-3 py-4 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100 text-lg"
        />
        <input
          required
          type="number"
          step="any"
          value={scanQty}
          onChange={(e) => setScanQty(e.target.value)}
          placeholder="Cantidad a mover"
          className="w-full px-3 py-3 bg-caribe-dark border border-caribe-border rounded-lg text-stone-100"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full py-4 rounded-lg bg-amber-500 text-[#1a120c] text-lg font-bold disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Confirmar scan'}
        </button>
      </form>

      {done.length > 0 && (
        <div className="text-xs text-stone-500 space-y-1">
          <p className="uppercase">Últimas hechas</p>
          {done.map((t) => (
            <p key={t.id}>
              #{t.id} {t.lot_number} → {t.to_location}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}