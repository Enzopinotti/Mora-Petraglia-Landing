import { useState, type FormEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { getCoverImage, LABELS } from '../../cms/helpers'
import type { Project } from '../../cms/types'
import { useCms } from '../../context/CmsContext'
import { AdminThumb } from '../components/AdminThumb'
import MediaUploader from '../media/MediaUploader'

type ActionMenuState = { projectId: string } | null

export default function ProjectList({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const { projects, refetch } = useCms()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null)
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = projects.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = () => {
    setEditing({
      title: '',
      subtype: 'mural',
      status: 'draft',
      location: 'La Plata',
      media: [],
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing?.title) return
    const isNew = !editing.id
    setSaving(true)
    try {
      const response = await cmsApi.saveProject(editing)
      if (response.success) {
        if (isNew && response.data?.id) {
          setEditing(response.data)
          onToast('Mural creado. Ya podés cargar sus imágenes.', 'success')
          await refetch()
        } else {
          onToast('Mural guardado correctamente', 'success')
          setIsModalOpen(false)
          await refetch()
        }
      } else {
        onToast(response.error || 'No se pudo guardar el mural', 'error')
      }
    } catch {
      onToast('Error al guardar el mural', 'error')
    } finally {
      setSaving(false)
    }
  }

  const executeAction = async (
    id: string,
    fn: (id: string) => Promise<any>,
    successMsg: string,
  ) => {
    setActionMenu(null)
    try {
      const response = await fn(id)
      if (response.success) {
        onToast(successMsg, 'success')
        await refetch()
      } else {
        onToast(response.error || 'No se pudo completar la acción', 'error')
      }
    } catch {
      onToast('Error al ejecutar la acción', 'error')
    }
  }

  return (
    <div>
      <div className="admin-header-actions">
        <h2>Murales</h2>
        <button className="btn-primary-admin" onClick={handleCreate}>
          + Nuevo mural
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc', minWidth: '200px' }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc' }}>
          <option value="all">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="hidden">Oculto</option>
          <option value="archived">Archivado</option>
        </select>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mural) => (
              <tr key={mural.id || mural.title}>
                <td>
                  <AdminThumb src={getCoverImage(mural.media, mural.image)} alt={mural.title} />
                </td>
                <td>
                  <strong>{mural.title}</strong>
                </td>
                <td>{mural.location || 'La Plata'}</td>
                <td>
                  <span className={`badge badge--${mural.status}`}>{LABELS.status[mural.status] || mural.status}</span>
                </td>
                <td style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary-admin" onClick={() => { setEditing(mural); setIsModalOpen(true); setActionMenu(null) }} style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      Editar
                    </button>
                    <button
                      className="btn-secondary-admin"
                      onClick={() => setActionMenu(actionMenu?.projectId === mural.id ? null : { projectId: mural.id })}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ▾
                    </button>
                  </div>

                  {actionMenu?.projectId === mural.id && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ded5cc', zIndex: 50, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {mural.status !== 'published' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(mural.id, cmsApi.publishProject.bind(cmsApi), 'Mural publicado')}>
                          Publicar
                        </button>
                      )}
                      {mural.status !== 'hidden' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(mural.id, cmsApi.hideProject.bind(cmsApi), 'Mural ocultado')}>
                          Ocultar
                        </button>
                      )}
                      {mural.status === 'archived' ? (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(mural.id, cmsApi.restoreProject.bind(cmsApi), 'Mural restaurado como borrador')}>
                          Restaurar
                        </button>
                      ) : (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#d32f2f' }}
                          onClick={() => {
                            if (!window.confirm('¿Archivar este mural?')) return
                            executeAction(mural.id, cmsApi.archiveProject.bind(cmsApi), 'Mural archivado')
                          }}>
                          Archivar
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #ded5cc', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', margin: '0 0 1.5rem 0' }}>
              {editing.id ? 'Editar Mural' : 'Nuevo Mural'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Título</label>
                <input
                  type="text"
                  required
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Ubicación / Contexto</label>
                <input
                  type="text"
                  value={editing.location || ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Descripción / Nota</label>
                <textarea
                  rows={3}
                  value={editing.short_description || ''}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Imágenes</label>
                <MediaUploader
                  entityType="projects"
                  entityId={editing.id}
                  media={editing.media || []}
                  onChange={(media) => setEditing({ ...editing, media })}
                  onToast={onToast}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary-admin" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-admin" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
