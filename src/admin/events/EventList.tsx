import { useState, type FormEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { getCoverImage, LABELS } from '../../cms/helpers'
import type { EventItem, SubtypeEvent } from '../../cms/types'
import { useCms } from '../../context/CmsContext'
import { AdminThumb } from '../components/AdminThumb'
import MediaUploader from '../media/MediaUploader'

type ActionMenuState = { eventId: string } | null

export default function EventList({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const { events, refetch } = useCms()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null)
  const [editing, setEditing] = useState<Partial<EventItem> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = events.filter((ev) => {
    if (filterStatus !== 'all' && ev.status !== filterStatus) return false
    if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = () => {
    setEditing({
      title: '',
      subtype: 'exhibition',
      status: 'draft',
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

    const cleanEvent = {
      ...editing,
      year: editing.year !== '' && editing.year !== undefined ? String(editing.year) : '',
    }
    // Removemos date_label y short_description del payload, el backend los calcula o mapea
    delete cleanEvent.date_label
    delete cleanEvent.short_description

    try {
      const response = await cmsApi.saveEvent(cleanEvent)
      if (response.success) {
        if (isNew && response.data?.id) {
          setEditing(response.data)
          onToast('Exhibición creada. Ya podés cargar sus imágenes.', 'success')
          await refetch()
        } else {
          onToast('Exhibición guardada correctamente', 'success')
          setIsModalOpen(false)
          await refetch()
        }
      } else {
        onToast(response.error || 'No se pudo guardar la exhibición', 'error')
      }
    } catch {
      onToast('Error al guardar la exhibición', 'error')
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
        <h2>Exhibiciones</h2>
        <button className="btn-primary-admin" onClick={handleCreate}>
          + Nueva exhibición
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
              <th>Tipo</th>
              <th>Fecha / Salón</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => (
              <tr key={ev.id || ev.title}>
                <td>
                  <AdminThumb src={getCoverImage(ev.media, ev.image)} alt={ev.title} />
                </td>
                <td>
                  <strong>{ev.title}</strong>
                </td>
                <td>{LABELS.subtypeEvent[ev.subtype as SubtypeEvent] || ev.subtype || 'Exhibición'}</td>
                <td>{ev.date_label || '-'}</td>
                <td>
                  <span className={`badge badge--${ev.status}`}>{LABELS.status[ev.status] || ev.status}</span>
                </td>
                <td style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary-admin" onClick={() => { setEditing(ev); setIsModalOpen(true); setActionMenu(null) }} style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      Editar
                    </button>
                    <button
                      className="btn-secondary-admin"
                      onClick={() => setActionMenu(actionMenu?.eventId === ev.id ? null : { eventId: ev.id })}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ▾
                    </button>
                  </div>

                  {actionMenu?.eventId === ev.id && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ded5cc', zIndex: 50, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {ev.status !== 'published' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(ev.id, cmsApi.publishEvent.bind(cmsApi), 'Exhibición publicada')}>
                          Publicar
                        </button>
                      )}
                      {ev.status !== 'hidden' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(ev.id, cmsApi.hideEvent.bind(cmsApi), 'Exhibición ocultada')}>
                          Ocultar
                        </button>
                      )}
                      {ev.status !== 'draft' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(ev.id, cmsApi.restoreEvent.bind(cmsApi), 'Exhibición devuelta a Borrador')}>
                          Volver a borrador
                        </button>
                      )}
                      {ev.status === 'archived' ? (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(ev.id, cmsApi.restoreEvent.bind(cmsApi), 'Exhibición restaurada como borrador')}>
                          Restaurar
                        </button>
                      ) : (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#d32f2f' }}
                          onClick={() => {
                            if (!window.confirm('¿Archivar esta exhibición?')) return
                            executeAction(ev.id, cmsApi.archiveEvent.bind(cmsApi), 'Exhibición archivada')
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
              {editing.id ? 'Editar Exhibición / Evento' : 'Nueva Exhibición / Evento'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Grupo 1: Información Principal */}
              <div>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Básica</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Título / Nombre de Exhibición</label>
                    <input type="text" required value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo de Evento</label>
                    <select value={editing.subtype || 'exhibition'} onChange={(e) => setEditing({ ...editing, subtype: e.target.value as SubtypeEvent })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="exhibition">Exhibición</option>
                      <option value="award">Premio</option>
                      <option value="competition">Salón / certamen</option>
                      <option value="talk">Charla</option>
                      <option value="launch">Inauguración</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre de Obra Presentada</label>
                    <input type="text" value={editing.artwork_name || ''} onChange={(e) => setEditing({ ...editing, artwork_name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo Participación (Ej: Colectiva, Individual)</label>
                    <input type="text" value={editing.participation_type || ''} onChange={(e) => setEditing({ ...editing, participation_type: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción / Detalle</label>
                  <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Grupo 2: Institución & Fechas */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institución & Fechas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Institución</label>
                    <input type="text" placeholder="Ej: Museo Bellas Artes" value={editing.institution || ''} onChange={(e) => setEditing({ ...editing, institution: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Lugar / Sala (Venue)</label>
                    <input type="text" placeholder="Ej: Sala Lidaura Sandrini" value={editing.venue || ''} onChange={(e) => setEditing({ ...editing, venue: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '0.8rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Fecha de Inicio</label>
                    <input type="date" value={editing.start_date || ''} onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Fecha de Cierre</label>
                    <input type="date" value={editing.end_date || ''} onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Año</label>
                    <input type="text" value={editing.year || ''} onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.8rem' }}>
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
                </div>
              </div>

              {/* Grupo 3: Publicación */}
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
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Destacar Exhibición</span>
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
                  entityType="events"
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
