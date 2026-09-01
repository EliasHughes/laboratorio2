import { FormEvent, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { ArrowRight, CheckCircle2, MapPin, Package, ScanLine, AlertCircle } from 'lucide-react'

const SITES = ['Almacén central', 'Laboratorio', 'Refrigerado', 'Cuarentena', 'Producción']

type Lot = {
  id: number
  lot_number?: string
  product_name?: string
  current_qty?: number
  location?: string
}
type Task = {
  id: number
  task_type: string
  status: string
  product_name?: string
  lot_number?: string
  from_location?: string
  to_location?: string
  qty_planned?: number
  qty_done?: number
}

export default function WmsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [lotId, setLotId] = useState('')
  const [qty, setQty] = useState('')
  const [toLocation, setToLocation] = useState('Laboratorio')
  const [taskType, setTaskType] = useState('transfer')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = lots.find((l) => String(l.id) === lotId)
  const maxQty = Number(selected?.current_qty || 0)
  const pending = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled')
  const done = tasks.filter((t) => t.status === 'done').slice(0, 8)

  const load = async () => {
    try {
      const [l, t] = await Promise.all([api.get('/lots'), api.get('/wms/tasks')])
      setLots(Array.isArray(l.data) ? l.data : [])
      setTasks(Array.isArray(t.data) ? t.data : [])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo cargar WMS')
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (selected && (!qty || Number(qty) > maxQty)) {
      if (!qty) return
      setQty(String(maxQty))
    }
  }, [lotId])

  const sites = useMemo(() => {
    const extra = lots.map((l) => l.location).filter(Boolean) as string[]
    return Array.from(new Set([...SITES, ...extra]))
  }, [lots])

  const transfer = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setOk('')
    if (!lotId) {
      setError('Selecciona un lote')
      return
    }
    const n = Number(qty)
    if (!n || n <= 0) {
      setError('Indica la cantidad a transferir')
      return
    }
    if (n > maxQty) {
      setError(`Solo hay ${maxQty} disponible en este lote`)
      return
    }
    setBusy(true)
    try {
      const { data } = await api.post('/wms/tasks', {
        task_type: taskType,
        lot_id: Number(lotId),
        qty: n,
        to_location: toLocation,
      })
      if (data?.status === 'done') {
        setOk(`${selected?.lot_number} listo en ${toLocation}. Ya puedes retirarlo.`)
      } else if (data?.id) {
        await api.post(`/wms/tasks/${data.id}/scan`, { barcode: selected?.lot_number, qty: n })
        setOk(`${selected?.lot_number} listo en ${toLocation}. Ya puedes retirarlo.`)
      }
      setQty('')
      await load()
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : 'No se pudo completar la transferencia')
    } finally {
      setBusy(false)
    }
  }

  const completeTask = async (task: Task) => {
    setError('')
    setOk('')
    setBusy(true)
    try {
      const { data } = await api.post(`/wms/tasks/${task.id}/scan`, {
        barcode: task.lot_number,
        qty: Number(task.qty_planned) || undefined,
      })
      setOk(`${data.lot_number} quedó en ${data.to_location}. Ya está disponible para retiro.`)
      await load()
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : Array.isArray(d) ? JSON.stringify(d) : 'No se pudo completar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#1A120E] px-6 py-6 text-white">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,rgba(220,165,76,.25),transparent_70%)]" />
        <p className="text-[10px] tracking-[0.22em] uppercase text-[#DCA54C]">Yazoo Caribe · Piso</p>
        <h2 className="mt-1 text-2xl font-semibold flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-[#DCA54C]" />
          Transferencias
        </h2>
        <p className="mt-1 text-sm text-[#C4B8AA] max-w-xl">
          Mueve cantidad de un lote a otra área. Al completar, ese stock queda listo para retiro en el destino.
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-[#8B1E1E] bg-[#F9EAEA] border border-[#E8C4C4] px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
      {ok && (
        <p className="flex items-center gap-2 text-sm text-[#4A5D23] bg-[#E9EFDF] px-3 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {ok}
        </p>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] gap-5 items-start">
        <form onSubmit={transfer} className="bg-white border border-[#E6E2DC] rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8A7B6B]">Nueva transferencia</p>
            <h3 className="text-lg font-semibold text-[#1A120E]">Mover stock</h3>
          </div>

          <label className="block text-xs text-[#5C5046]">
            Lote de origen
            <select
              required
              className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2.5 text-sm text-[#1A120E] bg-[#FBF8F3]"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
            >
              <option value="">Seleccionar lote…</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lot_number} · {l.product_name || 's/n'} · {l.current_qty} · {l.location || 's/u'}
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <div className="flex items-center gap-3 rounded-xl bg-[#F6F1E8] px-3 py-2 text-sm text-[#1A120E]">
              <Package className="w-4 h-4 text-[#8A5A12]" />
              <span>
                Disponible: <b>{maxQty}</b> en <b>{selected.location || 's/u'}</b>
              </span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs text-[#5C5046]">
              Tipo
              <select
                className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2.5 text-sm text-[#1A120E] bg-white"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="transfer">Transferencia</option>
                <option value="putaway">Acomodo</option>
                <option value="receive">Recepción piso</option>
              </select>
            </label>
            <label className="text-xs text-[#5C5046]">
              Destino
              <select
                className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2.5 text-sm text-[#1A120E] bg-white"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-xs text-[#5C5046] block">
            Cantidad a transferir {maxQty ? `(máx. ${maxQty})` : ''}
            <input
              required
              type="number"
              min="0.0001"
              max={maxQty || undefined}
              step="any"
              className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2.5 text-sm text-[#1A120E] bg-white"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>

          <button
            disabled={busy}
            className="w-full py-3 rounded-full bg-[#DCA54C] text-[#1A120E] text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'Moviendo…' : 'Transferir y completar'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="bg-white border border-[#E6E2DC] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8A7B6B]">Cola</p>
                <h3 className="text-lg font-semibold text-[#1A120E]">Pendientes</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-[#F3EFE8] text-[#5C5046]">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-[#8A7B6B] py-6 text-center">No hay transferencias pendientes.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((t) => (
                  <li key={t.id} className="rounded-xl border border-[#E6E2DC] px-3 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A120E] truncate">
                        {t.lot_number || 'Sin lote'} · {t.product_name || t.task_type}
                      </p>
                      <p className="text-xs text-[#8A7B6B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {t.from_location || '—'}
                        <ArrowRight className="w-3 h-3" />
                        {t.to_location || '—'}
                        <span className="ml-1">· {t.qty_planned}/{t.qty_done}</span>
                      </p>
                    </div>
                    {t.lot_number ? (
                      <button
                        type="button"
                        disabled={busy}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#1A120E] text-[#F4E6C3]"
                        onClick={() => completeTask(t)}
                      >
                        Completar
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#8A7B6B]">Sin lote</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-[#F6F1E8] border border-[#E6E2DC] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-[#8A7B6B] mb-2">Completadas</p>
            {done.length === 0 ? (
              <p className="text-sm text-[#8A7B6B]">Aún no hay movimientos cerrados.</p>
            ) : (
              <ul className="space-y-1.5 text-sm text-[#1A120E]">
                {done.map((t) => (
                  <li key={t.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {t.lot_number} → {t.to_location}
                    </span>
                    <span className="text-[#4A5D23] text-xs shrink-0">
                      {t.qty_done}/{t.qty_planned}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
