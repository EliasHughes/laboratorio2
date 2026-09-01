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

const groups = [
  {
    title: 'Inventario y almacén',
    items: [
      { to: '/inventory', icon: Package, label: 'Productos y lotes', hint: 'Stock, vencimientos, CoA' },
      { to: '/receiving', icon: Truck, label: 'Recepción / ingresos', hint: 'Alta de lote en almacén central' },
      { to: '/warehouse', icon: Warehouse, label: 'Almacén', hint: 'Ubicaciones y transferencias' },
      { to: '/wms', icon: ScanLine, label: 'WMS piso', hint: 'Tareas receive / transfer / pick' },
      { to: '/withdrawals', icon: ArrowDownToLine, label: 'Retiros laboratorio', hint: 'FEFO, solo stock transferido' },
      { to: '/kardex', icon: ClipboardList, label: 'Kardex', hint: 'Movimientos y auditoría' },
      
    ],
  },
    {
    title: 'Seguridad industrial',
    items: [
      { to: '/safety', icon: Shield, label: 'Tablero EHS', hint: 'Siniestralidad, incidentes, inspecciones' },
    ],
  },
  {
    title: 'Laboratorio y calidad',
    items: [
      { to: '/forms', icon: FileText, label: 'Formularios Y-FO', hint: 'Registros oficiales de calidad' },
      { to: '/solutions', icon: Beaker, label: 'Soluciones internas', hint: 'Preparación y consumo' },
      { to: '/reports', icon: FileBarChart, label: 'Reportes', hint: 'Listados e impresión' },
    ],
  },
  {
    title: 'Operación',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Panel de control', hint: 'KPIs y alertas' },
      { to: '/purchases', icon: ShoppingCart, label: 'Compras', hint: 'Proveedores y OC · Fase 2' },
    ],
  },
]

export default function WorkspacePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">YLMS · Fase 0–1</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Área de trabajo</h2>
        <p className="text-sm text-[#5C5046] mt-1">
          Inventario, laboratorio y calidad. El resto del ERP se suma por fases.
        </p>
      </div>
      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="text-xs uppercase tracking-wider text-[#8A8076] mb-3">{g.title}</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {g.items.map((item) => (
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
      ))}
    </div>
  )
}
