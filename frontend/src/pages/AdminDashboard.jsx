/** Admin dashboard with event management. */
import { useMemo, useState } from 'react'

import EventManager from '../sections/EventManager.jsx'

const MENU_ITEMS = [
  {
    id: 'events',
    label: 'Eventi',
    description: 'Crea e gestisci le schede evento',
  },
]

const AdminDashboard = ({ onNavigateHome = () => {} }) => {
  const [activeSection, setActiveSection] = useState('events')

  const activePanel = useMemo(() => {
    switch (activeSection) {
      case 'events':
      default:
        return <EventManager />
    }
  }, [activeSection])

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Sezioni dashboard">
        <div className="sidebar-header">
          <span className="brand small">GetInvolved</span>
          <p className="muted-text">Area Amministratore</p>
        </div>
        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${item.id === activeSection ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="sidebar-link-title">{item.label}</span>
              <span className="sidebar-link-description">{item.description}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1>Dashboard Admin</h1>
            <p className="muted-text">
              Gestisci gli eventi e mantieni informata la tua comunità.
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={onNavigateHome}>
            Torna alla Home
          </button>
        </header>

        <main className="admin-main" aria-live="polite">
          {activePanel}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
