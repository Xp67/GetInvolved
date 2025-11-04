import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

import AdminDashboard from './pages/AdminDashboard.jsx'
import HomePage from './pages/HomePage.jsx'

const HOME_ROUTE = 'home'
const ADMIN_ROUTE = 'admin'

const resolveRouteFromHash = (hashValue) => {
  const normalizedHash = typeof hashValue === 'string' ? hashValue.replace(/^#/, '') : ''

  if (normalizedHash.startsWith('/admin')) {
    return ADMIN_ROUTE
  }

  return HOME_ROUTE
}

const getCurrentRoute = () => {
  if (typeof window === 'undefined') {
    return HOME_ROUTE
  }

  return resolveRouteFromHash(window.location.hash || '')
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => getCurrentRoute())

  const navigate = useCallback((hash) => {
    const nextRoute = resolveRouteFromHash(hash)

    if (typeof window !== 'undefined') {
      if (window.location.hash !== hash) {
        window.location.hash = hash
      }

      setCurrentRoute(getCurrentRoute())
      return
    }

    setCurrentRoute(nextRoute)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleHashChange = () => {
      setCurrentRoute(getCurrentRoute())
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

  return <div className="app-container">{routeElement}</div>
}

export default App
