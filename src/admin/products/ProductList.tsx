import { useState, type FormEvent } from 'react'
import { formatPrice, getCoverImage, LABELS } from '../../cms/helpers'
import type { Product, SubtypeProduct } from '../../cms/types'
import { useCms } from '../../context/CmsContext'
import MediaUploader from '../media/MediaUploader'

interface ProductListProps {
  onToast: (msg: string, type?: 'success' | 'error') => void
}

export default function ProductList({ onToast }: ProductListProps) {
  const { products, refetch } = useCms()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const filtered = products.filter((p) => {
    if (filterType !== 'all' && p.subtype !== filterType) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = () => {
    setEditingProduct({
      name: '',
      subtype: 'print',
      status: 'draft',
      price: '',
      currency: 'ARS',
      availability: 'available',
      media: [],
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product })
    setIsModalOpen(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.name) return

    setSaving(true)
    try {
      // Si estuviéramos guardando contra backend real:
      // await cmsApi.saveProduct(editingProduct)
      onToast('Producto guardado correctamente', 'success')
      setIsModalOpen(false)
      refetch()
    } catch {
      onToast('Error al guardar el producto', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-header-actions">
        <h2>Productos y Obras</h2>
        <button className="btn-primary-admin" onClick={handleCreate}>
          + Nueva obra o print
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc', minWidth: '220px' }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc' }}>
          <option value="all">Todos los tipos</option>
          <option value="print">Prints</option>
          <option value="original_artwork">Obras originales</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc' }}>
          <option value="all">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Destacado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prod) => (
              <tr key={prod.id || prod.name}>
                <td>
                  <img src={getCoverImage(prod.media, prod.image)} alt={prod.name} className="thumb" />
                </td>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#746b64' }}>{prod.short_description || '-'}</span>
                </td>
                <td>{LABELS.subtypeProduct[prod.subtype as SubtypeProduct] || prod.subtype}</td>
                <td>{formatPrice(prod.price, prod.currency)}</td>
                <td>
                  <span className={`badge badge--${prod.status}`}>{LABELS.status[prod.status] || prod.status}</span>
                </td>
                <td>{prod.featured ? '★ Sí' : '-'}</td>
                <td>
                  <button className="btn-secondary-admin" onClick={() => handleEdit(prod)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #ded5cc', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', margin: '0 0 1.5rem 0' }}>
              {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Tipo</label>
                  <select
                    value={editingProduct.subtype || 'print'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtype: e.target.value as SubtypeProduct })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                  >
                    <option value="print">Print</option>
                    <option value="original_artwork">Obra original</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Descripción corta</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Precio (ARS)</label>
                  <input
                    type="text"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    placeholder="Ej: 85000"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Estado</label>
                  <select
                    value={editingProduct.status || 'draft'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ded5cc' }}
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Destacado</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    />
                    Obra destacada
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Imágenes</label>
                <MediaUploader
                  media={editingProduct.media || []}
                  onChange={(updatedMedia) => setEditingProduct({ ...editingProduct, media: updatedMedia })}
                  onToast={onToast}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary-admin" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-admin" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
