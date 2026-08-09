import { useState, type ReactNode } from 'react'
import { cmsAuth } from '../cms/auth'

interface AdminLayoutProps {
  currentTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  children: ReactNode
}

export default function AdminLayout({ currentTab, onTabChange, onLogout, children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'products', label: 'Productos y obras' },
    { id: 'projects', label: 'Murales' },
    { id: 'events', label: 'Exhibiciones' },
    { id: 'content', label: 'Textos' },
    { id: 'settings', label: 'Configuración' },
  ]

  const handleSelect = (tabId: string) => {
    onTabChange(tabId)
    setMobileOpen(false)
  }

  const activeTabLabel = tabs.find((t) => t.id === currentTab)?.label || 'Administración'

  return (
    <div className="admin-layout">
      <aside className={`admin-layout__sidebar ${mobileOpen ? 'admin-layout__sidebar--open' : ''}`}>
        <div className="admin-layout__brand">
          <h2>Mora Petraglia</h2>
          <span>Panel de Gestión</span>
        </div>

        <nav className="admin-layout__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={currentTab === tab.id ? 'active' : ''}
              onClick={() => handleSelect(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-layout__footer">
          <button className="btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰
          </button>
          <span className="topbar-title">{activeTabLabel}</span>
          <a href="/" className="view-site" target="_blank" rel="noreferrer">
            Ver landing pública ↗
          </a>
        </header>

        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  )
}
