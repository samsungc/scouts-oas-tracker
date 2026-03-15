import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'
import LoginPage from './pages/LoginPage'
import BadgesPage from './pages/BadgesPage'
import SubmitPage from './pages/SubmitPage'
import ReviewPage from './pages/ReviewPage'
import ScoutsPage from './pages/ScoutsPage'
import MySubmissionsPage from './pages/MySubmissionsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import NotFoundPage from './pages/NotFoundPage'
import ImportPage from './pages/ImportPage'

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <Spinner centered />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/badges" replace />
  }

  return children
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/badges" replace /> : <LoginPage />
        }
      />

      <Route
        path="/badges"
        element={
          <ProtectedRoute>
            <Layout>
              <BadgesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submit"
        element={
          <ProtectedRoute roles={['scout']}>
            <Layout>
              <SubmitPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute roles={['scout']}>
            <Layout>
              <MySubmissionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/review"
        element={
          <ProtectedRoute roles={['scouter', 'admin']}>
            <Layout>
              <ReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scouts"
        element={
          <ProtectedRoute roles={['scouter', 'admin']}>
            <Layout>
              <ScoutsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/import"
        element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <ImportPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
