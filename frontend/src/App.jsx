import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

import AdminDashboard from './pages/AdminDashboard.jsx'
import HomePage from './pages/HomePage.jsx'

const HOME_ROUTE = 'home'
const ADMIN_ROUTE = 'admin'

const resolveRoute = () => {
  if (typeof window === 'undefined') return HOME_ROUTE

  // Prefer pathname (supports direct navigation like / or /admin)
  const path = window.location.pathname || '/'
  if (path.startsWith('/admin')) return ADMIN_ROUTE

  // Fallback to hash routing (#/ or #/admin)
  const hash = (window.location.hash || '').replace(/^#/, '')
  if (hash.startsWith('/admin')) return ADMIN_ROUTE

  return HOME_ROUTE
}

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => resolveRoute())

  const navigate = useCallback((to) => {
    // Accept "/admin", "admin", or "#/admin"; normalize to path navigation
    const target = typeof to === 'string' ? to : '/'
    const raw = target.startsWith('#') ? target.replace(/^#/, '') : target
    const path = raw.startsWith('/') ? raw : `/${raw}`

    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path)
      }
      setCurrentRoute(resolveRoute())
      return
    }

    // Non-browser environment fallback
    setCurrentRoute(path.startsWith('/admin') ? ADMIN_ROUTE : HOME_ROUTE)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const update = () => setCurrentRoute(resolveRoute())
    window.addEventListener('popstate', update)
    window.addEventListener('hashchange', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('hashchange', update)
    }
  }, [])

  const routeElement = useMemo(() => {
    if (currentRoute === ADMIN_ROUTE) {
      return <AdminDashboard onNavigateHome={() => navigate('/')} />
    }
    return <HomePage onNavigateToAdmin={() => navigate('/admin')} />
  }, [currentRoute, navigate])

  return <div className="app-container">{routeElement}</div>
}

export default App
