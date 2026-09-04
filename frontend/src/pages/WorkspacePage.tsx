import { NavLink } from 'react-router-dom'
import {
  Beaker, FileText, Factory, ShoppingCart, Warehouse, Users,
  Truck, Globe, Megaphone, FlaskConical, Contact, Shield,
  Landmark, MonitorSmartphone, LayoutDashboard, FileBarChart,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const MODULES = [
  { to: '/forms', perm: 'forms:view', color: 'bg-[#C45C26]', icon: Beaker, title: 'LIMS Laboratorio', desc: 'Ensayos, CoA, reactivos', n: '6 submódulos' },
  { to: '/forms', perm: 'forms:view', color: 'bg-[#DCA54C]', icon: FileText, title: 'Registros de laboratorio', desc: '14 formularios Y-FO', n: '14 formatos' },
  { to: '/reports?module=produccion', perm: 'dashboard:view', color: 'bg-[#3F7D4E]', icon: Factory, title: 'Producción', desc: 'OT, granel, envasado', n: 'Próximo' },
  { to: '/purchases', perm: 'purchases:view', color: 'bg-[#8B5E34]', icon: ShoppingCart, title: 'Compras y proveedores', desc: 'OC y recepción compra', n: 'Fase 2' },
  { to: '/inventory', perm: 'inventory:view', color: 'bg-[#B45309]', icon: Warehouse, title: 'Inventario y almacenes', desc: 'Central + lab, WMS, FEFO', n: 'Activo' },
  { to: '/reports?module=ventas', perm: 'dashboard:view', color: 'bg-[#9A3412]', icon: Users, title: 'Ventas y clientes', desc: 'Pedidos y facturas', n: 'Próximo' },
  { to: '/reports?module=logistica', perm: 'dashboard:view', color: 'bg-[#1D4E89]', icon: Truck, title: 'Logística y distribución', desc: 'Rutas y despacho', n: 'Próximo' },
  { to: '/reports?module=comercio', perm: 'dashboard:view', color: 'bg-[#0F766E]', icon: Globe, title: 'Comercio exterior', desc: 'Import / export', n: 'Próximo' },
  { to: '/reports?module=mercadeo', perm: 'dashboard:view', color: 'bg-[#BE185D]', icon: Megaphone, title: 'Mercadeo', desc: 'Campañas y listados', n: 'Próximo' },
  { to: '/reports?module=id', perm: 'dashboard:view', color: 'bg-[#6D28D9]', icon: FlaskConical, title: 'I+D Innovación', desc: 'Fórmulas y prototipos', n: 'Próximo' },
  { to: '/reports?module=rrhh', perm: 'dashboard:view', color: 'bg-[#1E3A5F]', icon: Contact, title: 'RRHH y nómina', desc: 'Personal y capacitación', n: 'Próximo' },
  { to: '/safety', perm: 'ehs:view', color: 'bg-[#9A3412]', icon: Shield, title: 'EHS Seguridad industrial', desc: 'IF/IG, incidentes, EPP', n: 'Activo' },
  { to: '/reports?module=finanzas', perm: 'dashboard:view', color: 'bg-[#6B21A8]', icon: Landmark, title: 'Finanzas y contabilidad', desc: 'CXC, CXP, diario', n: 'Próximo' },
  { to: '/kardex', perm: 'kardex:view', color: 'bg-[#44403C]', icon: MonitorSmartphone, title: 'Sistema y auditoría', desc: 'Kardex, usuarios, roles', n: 'Activo' },
]

export default function WorkspacePage() {
  const { can } = useAuth()
  const items = MODULES.filter((m) => can(m.perm))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">Yazoo Caribe</p>
          <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Espacios de trabajo</h2>
          <p className="text-sm text-[#5C5046]">Módulos del ERP. Lo próximo abre el informe de ese módulo.</p>
        </div>
        <div className="flex gap-2">
          <NavLink to="/" className="rounded-full border border-[#E6E2DC] bg-white px-3 py-1.5 text-xs flex items-center gap-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Panel
          </NavLink>
          <NavLink to="/reports" className="rounded-full bg-[#DCA54C] px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
            <FileBarChart className="w-3.5 h-3.5" /> Reportes
          </NavLink>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((m) => (
          <NavLink
            key={m.title}
            to={m.to}
            className="rounded-2xl border border-[#E6E2DC] bg-white p-4 hover:border-[#DCA54C] flex gap-3"
          >
            <span className={`h-10 w-10 rounded-xl ${m.color} text-white flex items-center justify-center shrink-0`}>
              <m.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1A120E]">{m.title}</p>
              <p className="text-xs text-[#8A8076]">{m.desc}</p>
              <p className="text-[10px] uppercase tracking-wide text-[#C45C26] mt-1">{m.n}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  )
}