import { useState, type FormEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { formatPrice, getCoverImage, LABELS } from '../../cms/helpers'
import type { Product, ProductStatus, SubtypeProduct } from '../../cms/types'
import { useCms } from '../../context/CmsContext'
import { AdminThumb } from '../components/AdminThumb'
import MediaUploader from '../media/MediaUploader'

interface ProductListProps {
  onToast: (msg: string, type?: 'success' | 'error') => void
}

type ActionMenuState = { productId: string } | null

export default function ProductList({ onToast }: ProductListProps) {
  const { products, refetch, getSetting } = useCms()
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null)
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
    const defaultCurrency = getSetting('currency') || 'ARS'
    setEditingProduct({
      name: '',
      subtype: 'print',
      status: 'draft',
      price: '',
      currency: defaultCurrency,
      stock: 1,
      sale_mode: 'inquiry',
      media: [],
      signed: false,
      certificate: false,
      featured: false,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product })
    setIsModalOpen(true)
    setActionMenu(null)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingProduct?.name) return
    const isNew = !editingProduct.id
    setSaving(true)

    // Normalizar números y cadenas vacías para evitar null accidentales
    const cleanProduct = {
      ...editingProduct,
      price: editingProduct.price !== '' && editingProduct.price !== undefined ? String(editingProduct.price) : '',
      stock: editingProduct.stock !== undefined && editingProduct.stock !== null ? Number(editingProduct.stock) : 0,
      width: editingProduct.width !== '' && editingProduct.width !== undefined ? String(editingProduct.width) : '',
      height: editingProduct.height !== '' && editingProduct.height !== undefined ? String(editingProduct.height) : '',
      depth: editingProduct.depth !== '' && editingProduct.depth !== undefined ? String(editingProduct.depth) : '',
      year: editingProduct.year !== '' && editingProduct.year !== undefined ? String(editingProduct.year) : '',
    }

    try {
      const response = await cmsApi.saveProduct(cleanProduct)
      if (response.success) {
        if (isNew && response.data?.id) {
          setEditingProduct(response.data)
          onToast('Obra creada. Ya podés cargar sus imágenes.', 'success')
          await refetch()
        } else {
          onToast('Producto guardado correctamente', 'success')
          setIsModalOpen(false)
          await refetch()
        }
      } else {
        onToast(response.error || 'No se pudo guardar el producto', 'error')
      }
    } catch {
      onToast('Error al guardar el producto', 'error')
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
        <h2>Productos y Obras</h2>
        <button className="btn-primary-admin" onClick={handleCreate}>
          + Nueva obra o print
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc', minWidth: '200px' }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc' }}>
          <option value="all">Todos los tipos</option>
          <option value="print">Prints</option>
          <option value="original_artwork">Obras originales</option>
          <option value="physical_product">Producto físico</option>
          <option value="service">Servicio</option>
          <option value="other">Otro</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.6rem 1rem', border: '1px solid #ded5cc' }}>
          <option value="all">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="hidden">Oculto</option>
          <option value="sold">Vendido</option>
          <option value="out_of_stock">Sin stock</option>
          <option value="archived">Archivado</option>
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
                  <AdminThumb src={getCoverImage(prod.media, prod.image)} alt={prod.name} />
                </td>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#746b64' }}>{prod.short_description || '-'}</span>
                </td>
                <td>{LABELS.subtypeProduct[prod.subtype as SubtypeProduct] || prod.subtype}</td>
                <td>{formatPrice(prod.price, prod.currency)}</td>
                <td>
                  <span className={`badge badge--${prod.status}`}>{LABELS.status[prod.status as keyof typeof LABELS.status] || prod.status}</span>
                </td>
                <td>{prod.featured ? '★ Sí' : '-'}</td>
                <td style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary-admin" onClick={() => handleEdit(prod)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                      Editar
                    </button>
                    <button
                      className="btn-secondary-admin"
                      onClick={() => setActionMenu(actionMenu?.productId === prod.id ? null : { productId: prod.id })}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ▾
                    </button>
                  </div>

                  {actionMenu?.productId === prod.id && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #ded5cc', zIndex: 50, minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {prod.status !== 'published' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.publishProduct.bind(cmsApi), 'Producto publicado')}>
                          Publicar
                        </button>
                      )}
                      {prod.status !== 'hidden' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.hideProduct.bind(cmsApi), 'Producto ocultado')}>
                          Ocultar
                        </button>
                      )}
                      {prod.status !== 'sold' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.markProductSold.bind(cmsApi), 'Producto marcado como vendido')}>
                          Marcar vendido
                        </button>
                      )}
                      {prod.status !== 'out_of_stock' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.markProductOutOfStock.bind(cmsApi), 'Producto marcado sin stock')}>
                          Marcar sin stock
                        </button>
                      )}
                      {prod.status !== 'draft' && (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.restoreProduct.bind(cmsApi), 'Producto devuelto a Borrador')}>
                          Volver a borrador
                        </button>
                      )}
                      {prod.status === 'archived' ? (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => executeAction(prod.id, cmsApi.restoreProduct.bind(cmsApi), 'Producto restaurado como borrador')}>
                          Restaurar
                        </button>
                      ) : (
                        <button style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#d32f2f' }}
                          onClick={() => {
                            if (!window.confirm('¿Archivar este producto?')) return
                            executeAction(prod.id, cmsApi.archiveProduct.bind(cmsApi), 'Producto archivado')
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

      {/* Modal Edición */}
      {isModalOpen && editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #ded5cc', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', margin: '0 0 1.5rem 0', borderBottom: '1px solid #ded5cc', paddingBottom: '0.5rem' }}>
              {editingProduct.id ? 'Editar Producto / Obra' : 'Nuevo Producto / Obra'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Grupo 1: Información Básica */}
              <div>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Básica</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre / Título</label>
                    <input type="text" required value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo de Obra</label>
                    <select value={editingProduct.subtype || 'print'} onChange={(e) => setEditingProduct({ ...editingProduct, subtype: e.target.value as SubtypeProduct })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="print">Print</option>
                      <option value="original_artwork">Obra original</option>
                      <option value="physical_product">Producto físico</option>
                      <option value="service">Servicio</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción corta (ficha técnica / detalles)</label>
                  <input type="text" value={editingProduct.short_description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                </div>
                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción completa / Relato</label>
                  <textarea rows={3} value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Grupo 2: Características Físicas */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ficha Técnica & Edición</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Técnica</label>
                    <input type="text" placeholder="Acrílico, óleo..." value={editingProduct.technique || ''} onChange={(e) => setEditingProduct({ ...editingProduct, technique: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Soporte</label>
                    <input type="text" placeholder="Lienzo, bastidor..." value={editingProduct.support || ''} onChange={(e) => setEditingProduct({ ...editingProduct, support: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Año</label>
                    <input type="text" value={editingProduct.year || ''} onChange={(e) => setEditingProduct({ ...editingProduct, year: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Medida en texto</label>
                    <input type="text" placeholder="50 x 70 cm" value={editingProduct.size_label || ''} onChange={(e) => setEditingProduct({ ...editingProduct, size_label: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Ancho (cm)</label>
                    <input type="number" step="any" value={editingProduct.width || ''} onChange={(e) => setEditingProduct({ ...editingProduct, width: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Alto (cm)</label>
                    <input type="number" step="any" value={editingProduct.height || ''} onChange={(e) => setEditingProduct({ ...editingProduct, height: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Espesor (cm)</label>
                    <input type="number" step="any" value={editingProduct.depth || ''} onChange={(e) => setEditingProduct({ ...editingProduct, depth: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo Edición</label>
                    <input type="text" placeholder="Serie limitada / Única" value={editingProduct.edition_type || ''} onChange={(e) => setEditingProduct({ ...editingProduct, edition_type: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Total Edición</label>
                    <input type="text" placeholder="Ej: 50" value={editingProduct.edition_total || ''} onChange={(e) => setEditingProduct({ ...editingProduct, edition_total: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.8rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="checkbox" checked={Boolean(editingProduct.signed)} onChange={(e) => setEditingProduct({ ...editingProduct, signed: e.target.checked })} />
                    <span style={{ fontSize: '0.85rem' }}>Firmado por Mora</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input type="checkbox" checked={Boolean(editingProduct.certificate)} onChange={(e) => setEditingProduct({ ...editingProduct, certificate: e.target.checked })} />
                    <span style={{ fontSize: '0.85rem' }}>Incluye Certificado de Autenticidad</span>
                  </label>
                </div>
              </div>

              {/* Grupo 3: Venta & Publicación */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comercialización & Estado</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Precio</label>
                    <input type="text" value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      placeholder="Ej: 85000" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Moneda</label>
                    <input type="text" value={editingProduct.currency || 'ARS'} onChange={(e) => setEditingProduct({ ...editingProduct, currency: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Modo de venta</label>
                    <select value={editingProduct.sale_mode || 'inquiry'} onChange={(e) => setEditingProduct({ ...editingProduct, sale_mode: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="inquiry">Consultar</option>
                      <option value="direct">Compra Directa (MP)</option>
                      <option value="unavailable">No disponible</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Stock actual</label>
                    <input type="number" value={editingProduct.stock ?? 1} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Enlace de pago (Mercado Pago / etc.)</label>
                  <input type="url" placeholder="https://mpago.la/..." value={editingProduct.payment_link || ''} onChange={(e) => setEditingProduct({ ...editingProduct, payment_link: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Estado de publicación</label>
                    <select value={editingProduct.status || 'draft'} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })}
                      style={{ width: '100%', padding: '0.55rem', border: '1px solid #ded5cc' }}>
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="hidden">Oculto</option>
                      <option value="sold">Vendido</option>
                      <option value="out_of_stock">Sin stock</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Orden visual</label>
                    <input type="number" placeholder="10, 20, 30..." value={editingProduct.sort_order || ''} onChange={(e) => setEditingProduct({ ...editingProduct, sort_order: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '0.6rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" checked={Boolean(editingProduct.featured)} onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Obra destacada</span>
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
                    <input type="text" value={editingProduct.seo_title || ''} onChange={(e) => setEditingProduct({ ...editingProduct, seo_title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Descripción SEO</label>
                    <input type="text" value={editingProduct.seo_description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, seo_description: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ded5cc' }} />
                  </div>
                </div>
              </div>

              {/* Grupo 5: Imágenes */}
              <div style={{ borderTop: '1px solid #eee8e0', paddingTop: '1.2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#746b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Imágenes</h4>
                <MediaUploader
                  entityType="products"
                  entityId={editingProduct.id}
                  media={editingProduct.media || []}
                  onChange={(updatedMedia) => setEditingProduct({ ...editingProduct, media: updatedMedia })}
                  onToast={onToast}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #eee8e0', paddingTop: '1.5rem' }}>
                <button type="button" className="btn-secondary-admin" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary-admin" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
