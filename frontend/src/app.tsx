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
        <div className="text-yazoo-gold animate-pulse font-brand text-lg">
          Cargando Yazoo Lab...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

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
        <Route index element={<DashboardPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="receiving" element={<ReceivingPage />} />
        <Route path="solutions" element={<SolutionsPage />} />
        <Route path="kardex" element={<KardexPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="warehouse" element={<WarehousePage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="/wms" element={<WmsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="safety" element={<SafetyPage />} />
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