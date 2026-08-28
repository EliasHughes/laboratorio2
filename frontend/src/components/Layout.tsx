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

} from 'lucide-react'

const navItems = [
  { to: '/workspace', icon: Grid3x3, label: 'Área de trabajo' },
  { to: '/', icon: LayoutDashboard, label: 'Panel de Control', end: true },
  { to: '/inventory', icon: Package, label: 'Inventario y Lotes' },
  { to: '/withdrawals', icon: ArrowDownToLine, label: 'Retiros y Despachos' },
  { to: '/receiving', icon: Truck, label: 'Recepción / Ingresos' },
  { to: '/solutions', icon: Beaker, label: 'Soluciones Internas' },
  { to: '/reports', icon: FileBarChart, label: 'Reportes' },
  { to: '/forms', icon: FileText, label: 'Formularios / Registros' },
  { to: '/kardex', icon: ClipboardList, label: 'Kardex y Auditoría' },
  { to: '/roles', icon: Shield, label: 'Roles y Permisos' },
  { to: '/users', icon: Users, label: 'Usuarios y Roles' },
  { to: '/warehouse', icon: Warehouse, label: 'Almacén' },
  { to: '/wms', icon: ScanLine, label: 'WMS Piso' },
  { to: '/purchases', icon: ShoppingCart, label: 'Compras', hint: 'OC y proveedores', staff: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = String((user as any)?.role?.name || (user as any)?.role || '').toLowerCase()
  const isAdmin = role.includes('admin') || role === 'administrador'
  const visibleNav = navItems.filter((item) => {
    if (isAdmin) return true
    return !['/users', '/roles'].includes(item.to)
  })

  const currentPage =
    visibleNav.find((item) =>
      item.end ? location.pathname === '/' : location.pathname.startsWith(item.to)
    ) || visibleNav[0]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#FCFCF9] overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col bg-[#1A120E] border-r border-[#3D2E24]
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
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
            className="hidden lg:flex p-1.5 rounded-lg text-[#A89F95] hover:text-[#DCA54C]"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-[#DCA54C]/15 text-[#DCA54C]'
                    : 'text-[#A89F95] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#3D2E24] p-3">
          {!collapsed && (
            <p className="text-xs text-[#E6E2DC] truncate mb-2">
              {(user as any)?.full_name || (user as any)?.username || 'Usuario'}
              {isAdmin && <span className="ml-2 text-[10px] text-[#DCA54C]">ADMIN</span>}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-[#A89F95] hover:text-rose-400"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[#E6E2DC] bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden text-[#1A120E]"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-[#1A120E]">{currentPage?.label || 'Yazoo'}</p>
              <p className="text-[10px] text-[#8A8076]">Sistema de Control de Calidad & Lotes</p>
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