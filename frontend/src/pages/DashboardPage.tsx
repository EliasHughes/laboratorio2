import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  Package,
  Layers,
  FlaskConical,
  Warehouse,
  ShieldAlert,
  Clock,
  Ban,
  ArrowDownToLine,
  FileText,
  Activity,
} from 'lucide-react'
import api from '../services/api'

const GOLD = '#DCA54C'
const BROWN = '#1A120E'
const GREEN = '#3D8B6E'
const ROSE = '#C45C4A'
const SKY = '#4A7C8C'
const CREAM = '#F7F4EF'

const PIE = [GREEN, GOLD, ROSE, SKY, '#8A8076', '#C69038']

function daysTo(raw?: string) {
  if (!raw) return 9999
  return (new Date(raw).getTime() - Date.now()) / 86400000
}

export default function DashboardPage() {
  const nav = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [moves, setMoves] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [forms, setForms] = useState<any[]>([])

  useEffect(() => {
    const pull = async () => {
      const safe = async (path: string) => {
        try {
          const { data } = await api.get(path)
          return Array.isArray(data) ? data : data?.items || data?.records || data?.alerts || []
        } catch {
          return []
        }
      }
      const [p, l, m, a, f] = await Promise.all([
        safe('/products'),
        safe('/lots'),
        safe('/movements'),
        safe('/audit'),
        safe('/forms'),
      ])
      setProducts(p)
      setLots(l)
      setMoves(m)
      setAudit(a)
      setForms(f)
    }
    pull()
  }, [])

  const k = useMemo(() => {
    const lab = lots.filter((x) => String(x.location || '').toLowerCase().includes('labor'))
    const alm = lots.filter((x) => String(x.location || '').toLowerCase().includes('almac'))
    const por = lots.filter((x) => {
      const d = daysTo(x.expiry_date || x.expiration_date)
      return String(x.status) === 'por_vencer' || (d >= 0 && d <= 30)
    })
    const ven = lots.filter((x) => String(x.status) === 'vencido' || daysTo(x.expiry_date || x.expiration_date) < 0)
    const bajo = products.filter((p) => Number(p.min_stock || 0) > 0 && Number(p.stock || 0) <= Number(p.min_stock))
    return {
      products: products.length,
      lots: lots.length,
      lab: lab.length,
      alm: alm.length,
      bajo: bajo.length || 1,
      por: por.length,
      ven: ven.length,
      moves: moves.length,
      forms: forms.length,
      alerts: por.length + ven.length,
    }
  }, [products, lots, moves, forms])

  const byLoc = useMemo(() => {
    const m: Record<string, number> = {}
    lots.forEach((l) => {
      const loc = l.location || 'Sin ubicación'
      m[loc] = (m[loc] || 0) + Number(l.current_qty || l.qty || 0)
    })
    return Object.entries(m).map(([name, qty]) => ({ name, qty }))
  }, [lots])

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {}
    lots.forEach((l) => {
      const s = String(l.status || 'disponible')
      m[s] = (m[s] || 0) + 1
    })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [lots])

  const byCat = useMemo(() => {
    const m: Record<string, number> = {}
    products.forEach((p) => {
      const c = p.category || 'Sin categoría'
      m[c] = (m[c] || 0) + 1
    })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [products])

  const trend = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().slice(0, 10)
      const n = audit.filter((a) => String(a.created_at || a.timestamp || '').slice(0, 10) === key).length
      return { dia: key.slice(5), n }
    })
    return days
  }, [audit])

  const cards = [
    { label: 'Productos', value: k.products, hint: 'Maestro', icon: Package, to: '/inventory' },
    { label: 'Lotes', value: k.lots, hint: 'FEFO', icon: Layers, to: '/inventory' },
    { label: 'En laboratorio', value: k.lab, hint: 'Listos para uso', icon: FlaskConical, to: '/warehouse' },
    { label: 'En almacén', value: k.alm, hint: 'Hasta transferir', icon: Warehouse, to: '/warehouse' },
    { label: 'Stock bajo', value: k.bajo, hint: 'Reponer', icon: ShieldAlert, to: '/purchases' },
    { label: 'Por vencer', value: k.por, hint: '≤ 30 días', icon: Clock, to: '/inventory' },
    { label: 'Vencidos', value: k.ven, hint: 'Retirar', icon: Ban, to: '/inventory' },
    { label: 'Movimientos', value: k.moves, hint: 'Kardex', icon: ArrowDownToLine, to: '/kardex' },
    { label: 'Formularios', value: k.forms, hint: 'Calidad', icon: FileText, to: '/forms' },
    { label: 'Alertas activas', value: k.alerts, hint: 'Campana', icon: Activity, to: '/inventory' },
  ]

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[#1A120E] text-[#F7F4EF] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[#DCA54C]">RONES Y BEBIDAS DEL CARIBE YAZOO</p>
          <h1 className="text-2xl font-semibold text-[#F7F4EF] mt-1">Panel de Control Ejecutivo</h1>
          <p className="text-sm text-[#D6D0C8] mt-1">Clic en una tarjeta para abrir el módulo. Indicadores en vivo.</p>
        </div>
        <img src="/yazoo.png" alt="Yazoo" className="h-14 bg-white rounded" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => nav(c.to)}
              className="text-left bg-white border border-[#E6E2DC] rounded-xl p-4 hover:border-[#DCA54C] transition"
            >
              <div className="flex justify-between items-start">
                <p className="text-[11px] uppercase tracking-wide text-[#8A8076]">{c.label}</p>
                <span className="w-8 h-8 rounded-lg bg-[#F7F0E2] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#C69038]" />
                </span>
              </div>
              <p className="text-3xl font-semibold text-[#1A120E] mt-2">{c.value}</p>
              <p className="text-xs text-[#8A8076] mt-1">{c.hint}</p>
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-2">Stock por ubicación</p>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={byLoc}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DC" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-2">Estado de lotes</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80}>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-2">Productos por categoría</p>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {byCat.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-2">Actividad 7 días</p>
          <div className="h-48">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2DC" />
                <XAxis dataKey="dia" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="n" stroke={BROWN} fill={GOLD} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-3">Actividad reciente</p>
          <div className="divide-y divide-[#E6E2DC] max-h-64 overflow-auto">
            {audit.slice(0, 8).map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => nav('/kardex')}
                className="w-full text-left py-2 flex justify-between gap-3 text-sm"
              >
                <span className="text-[#1A120E]">
                  {a.action || a.title || 'Evento'} · {a.module || a.entity || ''}
                </span>
                <span className="text-xs text-[#8A8076] shrink-0">
                  {a.user_name || a.username || ''} {String(a.created_at || '').slice(0, 16)}
                </span>
              </button>
            ))}
            {audit.length === 0 && <p className="text-sm text-[#8A8076]">Sin movimientos</p>}
          </div>
        </div>
        <div className="bg-white border border-[#E6E2DC] rounded-xl p-4">
          <p className="font-semibold text-[#1A120E] mb-3">Alertas</p>
          {lots
            .filter((l) => daysTo(l.expiry_date || l.expiration_date) <= 30)
            .slice(0, 6)
            .map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => nav('/inventory')}
                className="w-full text-left py-2 border-b border-[#E6E2DC] text-sm"
              >
                <span className="text-[#1A120E]">{l.product_name} · {l.lot_number}</span>
                <span className="block text-xs text-[#C69038]">vence {String(l.expiry_date || l.expiration_date || '').slice(0, 10)}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}