import { useState, type FormEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { getCoverImage, LABELS } from '../../cms/helpers'
import type { Project, SubtypeProject } from '../../cms/types'
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
      featured: false,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing?.title) return
    const isNew = !editing.id
    setSaving(true)

    // Omitimos span del payload enviado al backend, solo se maneja localmente
    const cleanProject = {
      ...editing,
      year: editing.year !== '' && editing.year !== undefined ? String(editing.year) : '',
    }
    delete cleanProject.span

    try {
      const response = await cmsApi.saveProject(cleanProject)
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
                      {mural.status !== 'draft' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(mural.id, cmsApi.restoreProject.bind(cmsApi), 'Mural devuelto a Borrador')}>
                          Volver a borrador
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
          <div style={{ background: '#fff', border: '1px solid #ded5cc', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', margin: '0 0 1.5rem 0', borderBottom: '1px solid #ded5cc', paddingBottom: '0.5rem' }}>
              {editing.id ? 'Editar Mural' : 'Nuevo Mural'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Grupo 1: Información Básica */}
              <div>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Básica</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Título del mural</label>
                    <input type="text" required value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Subtipo</label>
                    <select value={editing.subtype || 'mural'} onChange={(e) => setEditing({ ...editing, subtype: e.target.value as SubtypeProject })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="mural">Mural</option>
                      <option value="installation">Instalación</option>
                      <option value="collaboration">Colaboración</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción corta (ficha / nota)</label>
                  <textarea rows={2} value={editing.short_description || ''} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc', fontFamily: 'inherit' }} />
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción completa / Relato del proceso</label>
                  <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Grupo 2: Contexto & Ubicación */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contexto & Ubicación</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Ubicación (barrio / pared)</label>
                    <input type="text" placeholder="Ej: Calle 50 y 12" value={editing.location || ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Ciudad</label>
                    <input type="text" value={editing.city || ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>País</label>
                    <input type="text" value={editing.country || ''} onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Año</label>
                    <input type="text" value={editing.year || ''} onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cliente / Encargado por</label>
                    <input type="text" value={editing.client || ''} onChange={(e) => setEditing({ ...editing, client: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Técnica utilizada</label>
                    <input type="text" placeholder="Látex, aerosoles..." value={editing.technique || ''} onChange={(e) => setEditing({ ...editing, technique: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Dimensiones físicas</label>
                    <input type="text" placeholder="Ej: 3 x 6 metros" value={editing.dimensions || ''} onChange={(e) => setEditing({ ...editing, dimensions: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>
              </div>

              {/* Grupo 3: Publicación & Visualización */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publicación</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Estado</label>
                    <select value={editing.status || 'draft'} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="hidden">Oculto</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Orden visual</label>
                    <input type="number" placeholder="10, 20, 30..." value={editing.sort_order || ''} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '0.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" checked={Boolean(editing.featured)} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Destacar en la galería</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Grupo 4: SEO */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEO</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Título SEO</label>
                    <input type="text" value={editing.seo_title || ''} onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción SEO</label>
                    <input type="text" value={editing.seo_description || ''} onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>
              </div>

              {/* Grupo 5: Imágenes */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Imágenes</h4>
                <MediaUploader
                  entityType="projects"
                  entityId={editing.id}
                  media={editing.media || []}
                  onChange={(media) => setEditing({ ...editing, media })}
                  onToast={onToast}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #eee8e0', paddingTop: '1.5rem' }}>
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
