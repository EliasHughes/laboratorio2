import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  Beaker,
  FileBarChart,
  FileText,
  ClipboardList,
  Shield,
  Users,
  Warehouse,
  ScanLine,
  ShoppingCart,
  Factory,
  BadgeDollarSign,
  UsersRound,
  HardHat,
  Wrench,
} from 'lucide-react'

type Tile = {
  to?: string
  icon: any
  label: string
  hint: string
  staff?: boolean
}

const OPERACIONES: Tile[] = [
  { to: '/inventory', icon: Package, label: 'Inventario', hint: 'Productos y lotes', staff: true },
  { to: '/warehouse', icon: Warehouse, label: 'Almacén', hint: 'Ubicaciones y transferencias', staff: true },
  { to: '/receiving', icon: Truck, label: 'Entradas', hint: 'Recepción', staff: true },
  { to: '/wms', icon: ScanLine, label: 'WMS Piso', hint: 'Toda la planta', staff: true },
  { to: '/withdrawals', icon: ArrowDownToLine, label: 'Salidas', hint: 'Retiros FEFO', staff: true },
  { to: '/solutions', icon: Beaker, label: 'Soluciones', hint: 'Lab interno', staff: true },
  { to: '/purchases', icon: ShoppingCart, label: 'Compras', hint: 'OC y proveedores', staff: true },
]

const CALIDAD: Tile[] = [
  { to: '/forms', icon: FileText, label: 'Calidad / Forms', hint: 'Registros', staff: true },
]

const GOBIERNO: Tile[] = [
  { to: '/', icon: LayoutDashboard, label: 'Panel', hint: 'Indicadores', staff: true },
  { to: '/reports', icon: FileBarChart, label: 'Reportes', hint: 'Imprimir', staff: true },
  { to: '/kardex', icon: ClipboardList, label: 'Kardex', hint: 'Auditoría', staff: true },
  { to: '/roles', icon: Shield, label: 'Roles', hint: 'Permisos', staff: false },
  { to: '/users', icon: Users, label: 'Usuarios', hint: 'Cuentas', staff: false },
]

const SOON: Tile[] = [
  { label: 'Producción', hint: 'BOM, tanques, barricas', icon: Factory },
  { label: 'Ventas', hint: 'Pedidos y despacho', icon: BadgeDollarSign },
  { label: 'Finanzas', hint: 'CxP / CxC / ITBIS', icon: BadgeDollarSign },
  { label: 'Mantenimiento', hint: 'Equipos y OT', icon: Wrench },
  { label: 'RRHH', hint: 'Personal y vacaciones', icon: UsersRound },
  { label: 'EHS', hint: 'Incidentes y EPP', icon: HardHat },
]

function Grid({ items, go, dim }: { items: Tile[]; go: (to?: string) => void; dim?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((a) => {
        const Icon = a.icon
        return (
          <button
            key={a.label}
            type="button"
            disabled={!a.to}
            onClick={() => go(a.to)}
            className={`text-left rounded-xl border p-4 bg-white border-[#E6E2DC] ${
              a.to ? 'hover:border-[#DCA54C]' : 'opacity-50 cursor-not-allowed'
            } ${dim ? 'opacity-50' : ''}`}
          >
            <Icon className="w-5 h-5 text-[#C69038] mb-2" />
            <p className="font-semibold text-[#1A120E]">{a.label}</p>
            <p className="text-xs text-[#8A8076] mt-1">{a.hint}</p>
          </button>
        )
      })}
    </div>
  )
}

export default function WorkspacePage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const role = String((user as any)?.role?.name || (user as any)?.role || '').toLowerCase()
  const isAdmin = role.includes('admin') || role === 'administrador'
  const allow = (list: Tile[]) => list.filter((a) => a.staff || isAdmin)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1A120E]">Área de trabajo</h2>
        <p className="text-sm text-[#5C5046] mt-1">
          {isAdmin ? 'Vista administrador' : 'Módulos de planta'}
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-[#8A8076] uppercase mb-3">Operaciones de planta</h3>
        <Grid items={allow(OPERACIONES)} go={(to) => to && nav(to)} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#8A8076] uppercase mb-3">Laboratorio y calidad</h3>
        <Grid items={allow(CALIDAD)} go={(to) => to && nav(to)} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#8A8076] uppercase mb-3">Gobierno y control</h3>
        <Grid items={allow(GOBIERNO)} go={(to) => to && nav(to)} />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#8A8076] uppercase mb-3">Próximos (ERP)</h3>
        <Grid items={SOON} go={() => undefined} dim />
      </section>
    </div>
  )
}