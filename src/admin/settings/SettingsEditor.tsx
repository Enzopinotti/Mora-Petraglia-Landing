import { useState, type FormEvent, useEffect } from 'react'
import { cmsApi } from '../../cms/api'
import { useCms } from '../../context/CmsContext'
import { SOCIAL_LINKS } from '../../data/landing'

interface SettingsEditorProps {
  onToast: (msg: string, type?: 'success' | 'error') => void
}

const DEFAULT_SETTINGS: Record<string, any> = {
  instagram: SOCIAL_LINKS.instagram,
  email: 'contacto@morapetraglia.com',
  whatsapp: '',
  currency: 'ARS',
  shipping_ar: 'Envíos a toda Argentina',
  shipping_intl: 'Envíos internacionales bajo consulta',
  seo_title: 'Mora Petraglia — Artista Plástica y Muralista',
  seo_description: 'Retratos pop, murales y arte contemporáneo desde La Plata, Argentina.',
}

export default function SettingsEditor({ onToast }: SettingsEditorProps) {
  const { settings, refetch } = useCms()
  const [formState, setFormState] = useState<Record<string, any>>({})
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  // Sincronización controlada de settings
  useEffect(() => {
    const newState: Record<string, any> = { ...formState }
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      if (!dirtyFields[key]) {
        newState[key] = settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key]
      }
    })
    setFormState(newState)
  }, [settings])

  const cleanMarkdown = (val: string): string => {
    if (!val) return ''
    // [text](url) -> url
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/
    const match = val.match(mdLinkRegex)
    if (match) {
      let url = match[2]
      if (url.startsWith('mailto:')) {
        return url.replace('mailto:', '')
      }
      return url
    }
    return val
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Normalizar a valores limpios antes de mandar al backend
    const normalizedState = { ...formState }
    Object.keys(normalizedState).forEach((key) => {
      if (typeof normalizedState[key] === 'string') {
        normalizedState[key] = cleanMarkdown(normalizedState[key].trim())
      }
    })

    try {
      const response = await cmsApi.saveSettings(normalizedState)
      if (response.success) {
        onToast('Configuración guardada correctamente', 'success')
        setDirtyFields({})
        await refetch()
      } else {
        onToast(response.error || 'No se pudo guardar la configuración', 'error')
      }
    } catch {
      onToast('Error al guardar la configuración', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
    setDirtyFields((prev) => ({ ...prev, [key]: true }))
  }

  return (
    <div>
      <div className="admin-header-actions">
        <h2>Configuración del Sitio</h2>
        <button className="btn-primary-admin" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff', border: '1px solid #ded5cc', padding: '2rem' }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Redes & Contacto</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Instagram (URL)</label>
            <input
              type="url"
              value={formState.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email de contacto</label>
            <input
              type="email"
              value={formState.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>WhatsApp (Número con código de país)</label>
            <input
              type="tel"
              placeholder="Ej: 5492211234567"
              value={formState.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
        </div>

        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', margin: '1.5rem 0 1rem 0', borderTop: '1px solid #eee8e0', paddingTop: '1.5rem' }}>
          Ventas y Envíos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Moneda por defecto</label>
            <input
              type="text"
              value={formState.currency || ''}
              onChange={(e) => handleChange('currency', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Envíos Argentina</label>
            <input
              type="text"
              value={formState.shipping_ar || ''}
              onChange={(e) => handleChange('shipping_ar', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Envíos Exterior</label>
            <input
              type="text"
              value={formState.shipping_intl || ''}
              onChange={(e) => handleChange('shipping_intl', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
        </div>

        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', margin: '1.5rem 0 1rem 0', borderTop: '1px solid #eee8e0', paddingTop: '1.5rem' }}>
          SEO General
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Título SEO por defecto</label>
            <input
              type="text"
              value={formState.seo_title || ''}
              onChange={(e) => handleChange('seo_title', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Descripción SEO por defecto</label>
            <textarea
              rows={3}
              value={formState.seo_description || ''}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn-primary-admin" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
