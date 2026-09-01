import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowDownToLine,
  Beaker,
  FileText,
  ClipboardList,
  Warehouse,
  ScanLine,
  ShoppingCart,
  FileBarChart,
  Shield,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const groups = [
  {
    title: 'Inventario y almacén',
    items: [
      { to: '/inventory', icon: Package, label: 'Productos y lotes', hint: 'Stock, vencimientos, CoA', perm: 'inventory:view' },
      { to: '/receiving', icon: Truck, label: 'Recepción / ingresos', hint: 'Alta de lote en almacén central', perm: 'receiving:view' },
      { to: '/warehouse', icon: Warehouse, label: 'Almacén', hint: 'Ubicaciones y transferencias', perm: 'warehouse:view' },
      { to: '/wms', icon: ScanLine, label: 'WMS piso', hint: 'Tareas receive / transfer / pick', perm: 'wms:view' },
      { to: '/withdrawals', icon: ArrowDownToLine, label: 'Retiros laboratorio', hint: 'FEFO, solo stock transferido', perm: 'withdrawals:view' },
      { to: '/kardex', icon: ClipboardList, label: 'Kardex', hint: 'Movimientos y auditoría', perm: 'kardex:view' },
    ],
  },
  {
    title: 'Seguridad industrial',
    items: [
      { to: '/safety', icon: Shield, label: 'Tablero EHS', hint: 'Siniestralidad, incidentes, inspecciones', perm: 'ehs:view' },
    ],
  },
  {
    title: 'Laboratorio y calidad',
    items: [
      { to: '/forms', icon: FileText, label: 'Formularios Y-FO', hint: 'Registros oficiales de calidad', perm: 'forms:view' },
      { to: '/solutions', icon: Beaker, label: 'Soluciones internas', hint: 'Preparación y consumo', perm: 'solutions:view' },
      { to: '/reports', icon: FileBarChart, label: 'Reportes', hint: 'Listados e impresión', perm: 'reports:view' },
    ],
  },
  {
    title: 'Operación',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Panel de control', hint: 'KPIs y alertas', perm: 'dashboard:view' },
      { to: '/purchases', icon: ShoppingCart, label: 'Compras', hint: 'Proveedores y OC · Fase 2', perm: 'purchases:view' },
    ],
  },
]

export default function WorkspacePage() {
  const { can } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">YLMS · Fase 4b</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Área de trabajo</h2>
        <p className="text-sm text-[#5C5046] mt-1">
          Solo ves lo que tu rol permite.
        </p>
      </div>
      {groups.map((g) => {
        const items = g.items.filter((item) => can(item.perm))
        if (!items.length) return null
        return (
          <section key={g.title}>
            <h3 className="text-xs uppercase tracking-wider text-[#8A8076] mb-3">{g.title}</h3>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-start gap-3 rounded-xl border border-[#E6E2DC] bg-white px-4 py-3 hover:border-[#DCA54C]"
                >
                  <item.icon className="w-5 h-5 text-[#DCA54C] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#1A120E]">{item.label}</p>
                    <p className="text-xs text-[#8A8076]">{item.hint}</p>
                  </div>
                </NavLink>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}