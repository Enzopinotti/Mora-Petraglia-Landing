import { useEffect, useState } from 'react'
import { cmsApi } from '../cms/api'
import { useCms } from '../context/CmsContext'

interface AdminDashboardProps {
  onNavigate: (tab: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { products, projects, events } = useCms()
  const [healthStatus, setHealthStatus] = useState<{ connected: boolean; version?: string } | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await cmsApi.health()
        if (response.success && response.data) {
          setHealthStatus({ connected: true, version: response.data.version || '1.0.0' })
        } else {
          setHealthStatus({ connected: false })
        }
      } catch {
        setHealthStatus({ connected: false })
      }
    }
    checkHealth()
  }, [])

  const publishedProducts = products.filter((p) => p.status === 'published').length
  const draftProducts = products.filter((p) => p.status === 'draft').length
  const totalProjects = projects.length
  const totalEvents = events.length

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__stats">
        <div className="stat-card">
          <h4>Productos publicados</h4>
          <div className="stat-value">{publishedProducts}</div>
        </div>
        <div className="stat-card">
          <h4>Borradores</h4>
          <div className="stat-value">{draftProducts}</div>
        </div>
        <div className="stat-card">
          <h4>Murales</h4>
          <div className="stat-value">{totalProjects}</div>
        </div>
        <div className="stat-card">
          <h4>Exhibiciones</h4>
          <div className="stat-value">{totalEvents}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="admin-dashboard__actions">
          <h3>Accesos rápidos</h3>
          <div className="action-buttons">
            <button onClick={() => onNavigate('products')}>Gestión de Productos</button>
            <button onClick={() => onNavigate('projects')}>Gestión de Murales</button>
            <button onClick={() => onNavigate('events')}>Gestión de Exhibiciones</button>
            <button onClick={() => onNavigate('content')}>Editar Textos</button>
            <button onClick={() => onNavigate('settings')}>Configuración</button>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #ded5cc', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Servidor CMS</h4>
          {healthStatus === null ? (
            <p style={{ fontSize: '0.9rem', color: '#746b64' }}>Verificando conexión...</p>
          ) : healthStatus.connected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', background: '#4caf50', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#181615' }}>Conectado</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#746b64', margin: 0 }}>Versión del motor: {healthStatus.version}</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', background: '#f44336', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#181615' }}>Desconectado</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#746b64', margin: 0 }}>El backend no responde al test de salud.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
