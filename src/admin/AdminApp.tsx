import { useEffect, useState } from 'react'
import { cmsApi } from '../cms/api'
import { cmsAuth } from '../cms/auth'

import AdminDashboard from './AdminDashboard'
import AdminLayout from './AdminLayout'
import AdminLogin from './AdminLogin'
import { AdminToast } from './components/UIComponents'
import ContentEditor from './content/ContentEditor'
import EventList from './events/EventList'
import ProductList from './products/ProductList'
import ProjectList from './projects/ProjectList'
import SettingsEditor from './settings/SettingsEditor'

import './styles/admin.scss'

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState<string>('dashboard')
  const [toast, setToast] = useState<{ message: string | null; type: 'info' | 'success' | 'error' }>({
    message: null,
    type: 'info',
  })

  useEffect(() => {
    setAuthenticated(cmsAuth.isAuthenticated())
  }, [])

  const triggerToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: null, type: 'info' })
    }, 3500)
  }

  const handleLoginSuccess = () => {
    setAuthenticated(true)
    triggerToast('¡Bienvenida al panel de administración!', 'success')
  }

  const handleLogout = async () => {
    try {
      await cmsApi.logout()
    } catch {
      cmsAuth.logout()
    } finally {
      setAuthenticated(false)
      triggerToast('Sesión cerrada correctamente', 'info')
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-app">
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
        <AdminToast message={toast.message} type={toast.type} />
      </div>
    )
  }

  return (
    <div className="admin-app">
      <AdminLayout currentTab={currentTab} onTabChange={setCurrentTab} onLogout={handleLogout}>
        {currentTab === 'dashboard' && <AdminDashboard onNavigate={setCurrentTab} />}
        {currentTab === 'products' && <ProductList onToast={(msg, t) => triggerToast(msg, t || 'info')} />}
        {currentTab === 'projects' && <ProjectList onToast={(msg, t) => triggerToast(msg, t || 'info')} />}
        {currentTab === 'events' && <EventList onToast={(msg, t) => triggerToast(msg, t || 'info')} />}
        {currentTab === 'content' && <ContentEditor onToast={(msg, t) => triggerToast(msg, t || 'info')} />}
        {currentTab === 'settings' && <SettingsEditor onToast={(msg, t) => triggerToast(msg, t || 'info')} />}
      </AdminLayout>
      <AdminToast message={toast.message} type={toast.type} />
    </div>
  )
}
