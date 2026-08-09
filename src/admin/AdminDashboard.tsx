import { useCms } from '../context/CmsContext'

interface AdminDashboardProps {
  onNavigate: (tab: string) => void
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { products, projects, events } = useCms()

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
    </div>
  )
}
