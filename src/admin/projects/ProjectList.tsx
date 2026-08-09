import { useState, type FormEvent } from 'react'
import { getCoverImage, LABELS } from '../../cms/helpers'
import type { Project } from '../../cms/types'
import { useCms } from '../../context/CmsContext'
import MediaUploader from '../media/MediaUploader'

export default function ProjectList({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const { projects, refetch } = useCms()
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    try {
      onToast('Mural guardado correctamente', 'success')
      setIsModalOpen(false)
      refetch()
    } catch {
      onToast('Error al guardar el mural', 'error')
    } finally {
      setSaving(false)
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
            {projects.map((mural) => (
              <tr key={mural.id || mural.title}>
                <td>
                  <img src={getCoverImage(mural.media, mural.image)} alt={mural.title} className="thumb" />
                </td>
                <td>
                  <strong>{mural.title}</strong>
                </td>
                <td>{mural.location || 'La Plata'}</td>
                <td>
                  <span className={`badge badge--${mural.status}`}>{LABELS.status[mural.status] || mural.status}</span>
                </td>
                <td>
                  <button className="btn-secondary-admin" onClick={() => { setEditing(mural); setIsModalOpen(true); }} style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                    Editar
                  </button>
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
                <MediaUploader media={editing.media || []} onChange={(media) => setEditing({ ...editing, media })} onToast={onToast} />
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
