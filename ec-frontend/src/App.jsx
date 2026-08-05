import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import TreasurerOverviewPage from './pages/TreasurerOverviewPage'
import AccountDetailPage from './pages/AccountDetailPage'
import FinancialReportsPage from './pages/FinancialReportsPage'
import FinancialReportYearPage from './pages/FinancialReportYearPage'
import FinancialReportDetailPage from './pages/FinancialReportDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import Spinner from './components/ui/Spinner'

function hasECAccess(user) {
  if (!user) return false
  return Boolean(user.ec_role) || user.role === 'scouter' || user.role === 'admin'
}

function AccessDeniedPage() {
  const { logout } = useAuth()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <span style={{ fontSize: '2.5rem' }}>⚜</span>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Access Restricted</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 320 }}>
        This portal is for EC members only. Contact your scouter if you believe this is a mistake.
      </p>
      <button
        onClick={logout}
        style={{ marginTop: 8, padding: '8px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}
      >
        Sign Out
      </button>
    </div>
  )
}

function ECProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <Spinner centered />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasECAccess(user)) return <AccessDeniedPage />

  return children
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Spinner centered />

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/treasurer" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ECProtectedRoute>
            <AppShell />
          </ECProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/treasurer" replace />} />
        <Route path="treasurer" element={<TreasurerOverviewPage />} />
        <Route path="treasurer/accounts/:id" element={<AccountDetailPage />} />
        <Route path="treasurer/reports" element={<FinancialReportsPage />} />
        <Route path="treasurer/reports/:startYear" element={<FinancialReportYearPage />} />
        <Route path="treasurer/reports/:startYear/:id" element={<FinancialReportDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
