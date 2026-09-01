import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import InventoryPage from './pages/InventoryPage'
import ReceivingPage from './pages/ReceivingPage'
import WithdrawalsPage from './pages/WithdrawalsPage'
import KardexPage from './pages/KardexPage'
import SolutionsPage from './pages/SolutionsPage'
import ReportsPage from './pages/ReportsPage'
import FormsPage from './pages/FormsPage'
import WarehousePage from './pages/WarehousePage'
import WmsPage from './pages/WmsPage'
import PurchasesPage from './pages/PurchasesPage'
import WorkspacePage from './pages/WorkspacePage'
import SafetyPage from './pages/SafetyPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen bg-caribe-dark flex items-center justify-center">
        <div className="text-yazoo-gold animate-pulse font-brand text-lg">Cargando Yazoo Lab...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PermRoute({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { can, isLoading } = useAuth()
  if (isLoading) return null
  if (!can(perm)) return <Navigate to="/workspace" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PermRoute perm="dashboard:view"><DashboardPage /></PermRoute>} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="withdrawals" element={<PermRoute perm="withdrawals:view"><WithdrawalsPage /></PermRoute>} />
        <Route path="receiving" element={<PermRoute perm="receiving:view"><ReceivingPage /></PermRoute>} />
        <Route path="solutions" element={<PermRoute perm="solutions:view"><SolutionsPage /></PermRoute>} />
        <Route path="kardex" element={<PermRoute perm="kardex:view"><KardexPage /></PermRoute>} />
        <Route path="forms" element={<PermRoute perm="forms:view"><FormsPage /></PermRoute>} />
        <Route path="roles" element={<PermRoute perm="roles:view"><RolesPage /></PermRoute>} />
        <Route path="users" element={<PermRoute perm="users:view"><UsersPage /></PermRoute>} />
        <Route path="warehouse" element={<PermRoute perm="warehouse:view"><WarehousePage /></PermRoute>} />
        <Route path="inventory" element={<PermRoute perm="inventory:view"><InventoryPage /></PermRoute>} />
        <Route path="reports" element={<PermRoute perm="reports:view"><ReportsPage /></PermRoute>} />
        <Route path="wms" element={<PermRoute perm="wms:view"><WmsPage /></PermRoute>} />
        <Route path="purchases" element={<PermRoute perm="purchases:view"><PurchasesPage /></PermRoute>} />
        <Route path="safety" element={<PermRoute perm="ehs:view"><SafetyPage /></PermRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}