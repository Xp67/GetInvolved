import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

import AdminDashboard from './pages/AdminDashboard.jsx'
import HomePage from './pages/HomePage.jsx'

const HOME_ROUTE = 'home'
const ADMIN_ROUTE = 'admin'

const normalizeHash = () => {
  const rawHash = window.location.hash.replace('#', '') || '/'
  if (rawHash.startsWith('/admin')) {
    return ADMIN_ROUTE
  }
  return HOME_ROUTE
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => normalizeHash())

  const navigate = useCallback((hash) => {
    if (window.location.hash !== hash) {
      window.location.hash = hash
    }
    setCurrentRoute(normalizeHash())
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(normalizeHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const routeElement = useMemo(() => {
    if (currentRoute === ADMIN_ROUTE) {
      return <AdminDashboard onNavigateHome={() => navigate('#/')} />
    }

    return <HomePage onNavigateToAdmin={() => navigate('#/admin')} />
  }, [currentRoute, navigate])

  return (
    <div className="app-container">
      {routeElement}
    </div>
  )
}

export default App
