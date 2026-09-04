import { useState } from 'react'
import NotificationCenter from './NotificationCenter'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  Beaker,
  ClipboardList,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Menu,
  FileBarChart,
  Warehouse,
  ScanLine,
  Grid3x3,
  ShoppingCart,
  MapPinned,
} from 'lucide-react'

type NavItem = {
  to: string
  icon: any
  label: string
  perm: string
  end?: boolean
}

type NavSection = { title: string; items: NavItem[] }

const SECTIONS: NavSection[] = [
  {
    title: '',
    items: [
      { to: '/workspace', icon: Grid3x3, label: 'Área de trabajo', perm: 'dashboard:view' },
      { to: '/', icon: LayoutDashboard, label: 'Panel de control', perm: 'dashboard:view', end: true },
    ],
  },
  {
    title: 'LIMS Laboratorio',
    items: [
      { to: '/forms', icon: FileText, label: 'Formularios Y-FO', perm: 'forms:view' },
      { to: '/solutions', icon: Beaker, label: 'Soluciones internas', perm: 'solutions:view' },
      { to: '/boards', icon: MapPinned, label: 'Ubicaciones calidad', perm: 'inventory:view' },
      { to: '/withdrawals', icon: ArrowDownToLine, label: 'Retiros de laboratorio', perm: 'withdrawals:view' },
      { to: '/approvals', icon: FileText, label: 'Aprobaciones', perm: 'forms:view' },    ],
  },
  {
    title: 'Inventario y almacenes',
    items: [
      { to: '/inventory', icon: Package, label: 'Productos y lotes', perm: 'inventory:view' },
      { to: '/receiving', icon: Truck, label: 'Recepción / ingresos', perm: 'receiving:view' },
      { to: '/warehouse', icon: Warehouse, label: 'Almacén central', perm: 'warehouse:view' },
      { to: '/wms', icon: ScanLine, label: 'WMS piso', perm: 'wms:view' },
      { to: '/kardex', icon: ClipboardList, label: 'Kardex', perm: 'kardex:view' },
    ],
  },
  {
    title: 'EHS Seguridad industrial',
    items: [{ to: '/safety', icon: Shield, label: 'Tablero EHS', perm: 'ehs:view' }],
  },
  {
    title: 'Compras',
    items: [{ to: '/purchases', icon: ShoppingCart, label: 'OC y proveedores', perm: 'purchases:view' }],
  },
  {
    title: 'Informes',
    items: [{ to: '/reports', icon: FileBarChart, label: 'Reportes generales', perm: 'reports:view' }],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/users', icon: Users, label: 'Usuarios', perm: 'users:view' },
      { to: '/roles', icon: Shield, label: 'Roles y permisos', perm: 'roles:view' },
    ],
  },
]

export default function Layout() {
  const { user, logout, can } = useAuth() as any
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = String(user?.role?.name || user?.role || '').toLowerCase()
  const isAdmin = role.includes('admin') || role === 'administrador'
  const allow = (perm: string) => (typeof can === 'function' ? can(perm) : isAdmin)

  const sections = SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((it) => allow(it.perm)),
  })).filter((s) => s.items.length)

  const flat = sections.flatMap((s) => s.items)
  const currentPage =
    flat.find((item) => (item.end ? location.pathname === '/' : location.pathname.startsWith(item.to))) || flat[0]

  return (
    <div className="flex h-screen bg-[#FCFCF9] overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col bg-[#1A120E] border-r border-[#3D2E24]
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#3D2E24]">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/yazoo.png" alt="Yazoo" className="h-9 w-auto flex-shrink-0" />
              <div className="leading-tight">
                <p className="text-[10px] font-brand text-[#DCA54C] tracking-wider">YAZOO CARIBE</p>
                <p className="text-[9px] text-[#A89F95]">Envejecemos y Envasamos</p>
              </div>
            </div>
          )}
          {collapsed && <img src="/yazoo.png" alt="Yazoo" className="h-8 w-auto mx-auto" />}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#A89F95] hover:text-[#DCA54C]"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {sections.map((sec) => (
            <div key={sec.title || 'root'}>
              {!collapsed && sec.title ? (
                <p className="px-3 mb-1 text-[9px] tracking-[0.16em] uppercase text-[#6B625A]">{sec.title}</p>
              ) : null}
              <div className="space-y-1">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        isActive ? 'bg-[#DCA54C]/15 text-[#DCA54C]' : 'text-[#A89F95] hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#3D2E24] p-3">
          {!collapsed && (
            <p className="text-xs text-[#E6E2DC] truncate mb-2">
              {user?.full_name || user?.username || 'Usuario'}
              {isAdmin && <span className="ml-2 text-[10px] text-[#DCA54C]">ADMIN</span>}
            </p>
          )}
          <button type="button" onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-2 text-xs text-[#A89F95] hover:text-rose-400">
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[#E6E2DC] bg-white">
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden text-[#1A120E]" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#1A120E]">{currentPage?.label || 'Yazoo'}</p>
              <p className="text-[10px] text-[#8A8076]">Laboratorio · Almacén · Calidad</p>
            </div>
          </div>
          <NotificationCenter />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#FCFCF9] text-[#1A120E]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}