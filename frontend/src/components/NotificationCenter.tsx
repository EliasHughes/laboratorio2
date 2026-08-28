import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import api from '../services/api'
import { Bell, X, AlertTriangle, Clock, TrendingDown, Shield } from 'lucide-react'

interface AlertItem {
  id: string
  type: string
  severity: string
  title: string
  message: string
  link: string
}

const typeIcon: Record<string, any> = {
  vencido: AlertTriangle,
  por_vencer: Clock,
  stock_bajo: TrendingDown,
  cuarentena: Shield,
}

const TOAST_MS = 12000
const POLL_MS = 60 * 1000
const TOAST_EVERY_MS = 15 * 60 * 1000

function fromLots(lots: any[]): AlertItem[] {
  const out: AlertItem[] = []
  for (const l of lots) {
    const raw = l.expiry_date || l.expiration_date
    const days = raw ? (new Date(raw).getTime() - Date.now()) / 86400000 : 9999
    const st = String(l.status || '')
    const name = `${l.product_name || ''} · ${l.lot_number || ''}`.trim()
    if (st === 'vencido' || days < 0) {
      out.push({
        id: `lot-${l.id}`,
        type: 'vencido',
        severity: 'high',
        title: 'Lote vencido',
        message: name,
        link: '/inventory',
      })
    } else if (st === 'por_vencer' || days <= 30) {
      out.push({
        id: `lot-${l.id}`,
        type: 'por_vencer',
        severity: 'high',
        title: 'Lote por vencer',
        message: `${name} · ${Math.ceil(days)} día(s)`,
        link: '/inventory',
      })
    }
  }
  return out
}

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const [popup, setPopup] = useState<AlertItem | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const visible = alerts.filter((a) => !dismissed.has(a.id))

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/alerts')
      let list: AlertItem[] = data?.alerts || data?.items || (Array.isArray(data) ? data : [])
      list = list
        .filter((a) => a && a.id)
        .map((a) => ({
          id: String(a.id),
          type: a.type || 'por_vencer',
          severity: a.severity || 'high',
          title: a.title || 'Alerta',
          message: a.message || '',
          link: a.link || '/inventory',
        }))

      const lotsRes = await api.get('/lots')
      const lots = Array.isArray(lotsRes.data) ? lotsRes.data : lotsRes.data?.items || []
      const extra = fromLots(lots)
      const seen = new Set(list.map((a) => a.id))
      extra.forEach((a) => {
        if (!seen.has(a.id)) list.push(a)
      })

      setAlerts(list)
    } catch (err) {
      console.error('Error cargando alertas', err)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    if (!visible.length) return
    setPopup(visible[0])
    const id = setInterval(() => {
      setPopup(visible[0])
    }, TOAST_EVERY_MS)
    return () => clearInterval(id)
  }, [visible.length])

  useEffect(() => {
    if (!popup) return
    const t = window.setTimeout(() => setPopup(null), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [popup])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    if (popup?.id === id) setPopup(null)
  }

  const dismissAll = () => {
    setDismissed(new Set(alerts.map((a) => a.id)))
    setPopup(null)
  }

  const go = (a: AlertItem) => {
    setOpen(false)
    setPopup(null)
    if (a.link) navigate(a.link)
  }

  const toast = popup && !dismissed.has(popup.id) ? popup : null

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-stone-400 hover:text-amber-400"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {visible.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
            {visible.length > 99 ? '99+' : visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-hidden rounded-xl border border-amber-900/40 bg-[#FCFCF9] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/20">
            <div>
              <p className="text-sm font-semibold text-[#1A120E]">Alertas</p>
              <p className="text-[11px] text-[#5C5046]">{visible.length} activa(s)</p>
            </div>
            <div className="flex items-center gap-2">
              {visible.length > 0 && (
                <button type="button" onClick={dismissAll} className="text-[11px] text-[#5C5046]">
                  Descartar todas
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-[#5C5046]" />
              </button>
            </div>
          </div>
          <div className="overflow-auto">
            {visible.length === 0 && (
              <p className="p-8 text-center text-sm text-[#8A8076]">No hay alertas pendientes</p>
            )}
            {visible.map((a) => {
              const Icon = typeIcon[a.type] || AlertTriangle
              return (
                <div key={a.id} className="px-4 py-3 border-b border-[#E6E2DC]">
                  <div className="flex gap-2">
                    <Icon className="w-4 h-4 text-[#C69038] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1A120E]">{a.title}</p>
                      <p className="text-xs text-[#5C5046]">{a.message}</p>
                      <div className="mt-2 flex gap-3 text-xs">
                        <button type="button" className="text-[#C69038]" onClick={() => go(a)}>
                          Ver
                        </button>
                        <button type="button" className="text-[#8A8076]" onClick={() => dismiss(a.id)}>
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-center text-[#8A8076] py-2">Actualización cada 60s · aviso en pantalla cada 15 min</p>
        </div>
      )}

      {toast &&
        createPortal(
          <div className="fixed top-4 right-4 z-[9999] w-80 rounded-xl bg-[#1A120E] text-[#F7F4EF] p-4 shadow-2xl border border-[#DCA54C]/40">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-sm">{toast.title}</p>
              <button type="button" onClick={() => setPopup(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs mt-1 opacity-90">{toast.message}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-[#DCA54C] text-[#1A120E] text-xs font-semibold"
                onClick={() => go(toast)}
              >
                Ir al inventario
              </button>
              <button type="button" className="text-xs" onClick={() => setPopup(null)}>
                Cerrar
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}