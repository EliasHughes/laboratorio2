import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  ScrollText, History, Search, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react'

interface Movement {
  id: number
  lot_id: number
  lot_number?: string
  product_name?: string
  qty: number
  type: string
  reason?: string
  destination?: string
  notes?: string
  user_name?: string
  created_at?: string
}

interface AuditLog {
  id: number
  action: string
  entity: string
  entity_id?: number
  details?: string
  ip_address?: string
  user_id?: number
  username?: string
  user_name?: string
  created_at?: string
}

export default function KardexPage() {
  const [tab, setTab] = useState<'kardex' | 'audit' | 'calidad'>('kardex')
  const [movements, setMovements] = useState<Movement[]>([])
  const [audits, setAudits] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [forms, setForms] = useState<any[]>([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
        const [movRes, auditRes, formRes] = await Promise.allSettled([
        api.get<Movement[]>('/movements'),
        api.get<AuditLog[]>('/audit'),
        api.get('/forms'),
      ])
      if (movRes.status === 'fulfilled') setMovements(movRes.value.data)
      if (auditRes.status === 'fulfilled') setAudits(auditRes.value.data)
      if (formRes.status === 'fulfilled') {
        const d = formRes.value.data
        setForms(Array.isArray(d) ? d : [])
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredMov = movements.filter((m) => {
    const q = search.toLowerCase()
    return (
      (m.product_name || '').toLowerCase().includes(q) ||
      (m.lot_number || '').toLowerCase().includes(q) ||
      (m.user_name || '').toLowerCase().includes(q) ||
      (m.reason || '').toLowerCase().includes(q)
    )
  })

  const filteredAudit = audits.filter((a) => {
    const q = search.toLowerCase()
    return (
      (a.action || '').toLowerCase().includes(q) ||
      (a.entity || '').toLowerCase().includes(q) ||
      (a.details || '').toLowerCase().includes(q)
    )
  })

    const filteredForms = forms.filter((f) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      String(f.lot_number || '').toLowerCase().includes(q) ||
      String(f.form_code || '').toLowerCase().includes(q) ||
      String(f.title || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-yazoo-gold" />
          Kardex y Auditoría
        </h2>
        <p className="text-sm text-stone-400 mt-1">
          Trazabilidad de movimientos e historial de acciones del sistema
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1 bg-caribe-card border border-caribe-border rounded-lg p-1">
          <button
            onClick={() => setTab('kardex')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'kardex' ? 'bg-yazoo-gold text-caribe-dark' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Kardex
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'audit' ? 'bg-yazoo-gold text-caribe-dark' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            Auditoría
          </button>
                    <button
            type="button"
            onClick={() => setTab('calidad')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${
              tab === 'calidad' ? 'bg-yazoo-gold text-caribe-dark' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Calidad
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100 w-56 focus:outline-none focus:border-yazoo-gold"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-stone-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
          </div>
        ) : tab === 'kardex' ? (
          filteredMov.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              No hay movimientos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-caribe-border text-left text-xs text-stone-400 uppercase">
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Producto / Lote</th>
                    <th className="px-5 py-3">Cantidad</th>
                    <th className="px-5 py-3">Motivo / Destino</th>
                    <th className="px-5 py-3">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMov.map((m) => {
                    const isOut = m.type === 'salida' || m.type === 'WITHDRAW'
                    return (
                      <tr key={m.id} className="border-b border-caribe-border/50 hover:bg-caribe-hover/40">
                        <td className="px-5 py-3 text-stone-400 text-xs whitespace-nowrap">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleString('es-DO')
                            : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                              isOut
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {isOut ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {m.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-stone-100">{m.product_name || '—'}</p>
                          <p className="text-xs text-stone-500 font-mono">{m.lot_number}</p>
                        </td>
                        <td className="px-5 py-3 font-medium text-stone-100">{m.qty}</td>
                        <td className="px-5 py-3 text-stone-400 text-xs">
                          {[m.reason, m.destination].filter(Boolean).join(' · ') || m.notes || '—'}
                        </td>
                        <td className="px-5 py-3 text-stone-300 text-xs">{m.user_name || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
                           </table>
            </div>
          )
        ) : tab === 'calidad' ? (
          filteredForms.length === 0 ? (
            <div className="p-12 text-center text-stone-500">No hay formularios para esa búsqueda</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-caribe-border text-left text-xs text-stone-400 uppercase">
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Título</th>
                  <th className="px-5 py-3">Lote</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((f) => (
                  <tr key={f.id} className="border-b border-caribe-border/40">
                    <td className="px-5 py-2 text-amber-400 font-mono text-xs">{f.form_code}</td>
                    <td className="px-5 py-2 text-stone-200">{f.title}</td>
                    <td className="px-5 py-2 font-mono text-xs">{f.lot_number || '—'}</td>
                    <td className="px-5 py-2 text-stone-400">{f.status}</td>
                    <td className="px-5 py-2 text-stone-400">{f.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : filteredAudit.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            No hay registros de auditoría
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-caribe-border text-left text-xs text-stone-400 uppercase">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Acción</th>
                  <th className="px-5 py-3">Entidad</th>
                  <th className="px-5 py-3">Detalle</th>
                  <th className="px-5 py-3">IP</th>
                  <th className="px-5 py-3">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((a) => (
                  <tr key={a.id} className="border-b border-caribe-border/50 hover:bg-caribe-hover/40">
                    <td className="px-5 py-3 text-stone-400 text-xs whitespace-nowrap">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString('es-DO')
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        {a.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-300">
                      {a.entity}
                      {a.entity_id != null ? ` #${a.entity_id}` : ''}
                    </td>
                    <td className="px-5 py-3 text-stone-400 text-xs max-w-xs truncate">
                      {a.details || '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-500 text-xs font-mono">
                      {a.ip_address || '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-300 text-xs">
                    {a.user_name || a.username || (a.user_id != null ? `#${a.user_id}` : '—')}
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}