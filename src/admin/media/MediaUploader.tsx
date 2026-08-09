import { useState, type ChangeEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { LABELS } from '../../cms/helpers'
import type { MediaItem, MediaRole } from '../../cms/types'

interface MediaUploaderProps {
  entityType: 'products' | 'projects' | 'events'
  entityId?: string
  media: MediaItem[]
  onChange: (updatedMedia: MediaItem[]) => void
  onToast?: (msg: string, type?: 'success' | 'error') => void
}

export default function MediaUploader({ entityType, entityId, media = [], onChange, onToast }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)

  if (!entityId) {
    return (
      <div style={{ padding: '0.85rem 1rem', background: '#fbf8f3', border: '1px solid #ded5cc', color: '#746b64', fontSize: '0.85rem' }}>
        Guardá primero el registro para poder subir imágenes.
      </div>
    )
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onToast?.('Solo se permiten imágenes JPEG, PNG o WEBP', 'error')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      onToast?.('La imagen no puede superar los 8MB', 'error')
      return
    }

    setUploading(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const base64Str = dataUrl.split(',')[1]
      const role = media.length === 0 ? 'cover' : 'gallery'
      const altText = file.name.replace(/\.[^/.]+$/, '')

      const response = await cmsApi.uploadMedia({
        fileName: file.name,
        mimeType: file.type,
        base64: base64Str,
        entityType,
        entityId,
        role,
        altText,
      })

      if (response.success && response.data?.url) {
        const newItem: MediaItem = {
          url: response.data.url,
          id: response.data.id || `img-${Date.now()}`,
          role: role as MediaRole,
          alt: altText,
        }
        onChange([...media, newItem])
        onToast?.('Imagen subida correctamente', 'success')
      } else {
        onToast?.(response.error || 'No se pudo subir la imagen al servidor.', 'error')
      }
    } catch {
      onToast?.('Error al procesar el archivo', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const setRole = async (index: number, role: MediaRole) => {
    const item = media[index]
    if (item?.id && !item.id.startsWith('fallback')) {
      try {
        const response = await cmsApi.updateMediaRole(item.id, role)
        if (!response.success) {
          onToast?.(response.error || 'No se pudo actualizar el rol de la imagen', 'error')
          return
        }
      } catch {
        onToast?.('Error al actualizar el rol', 'error')
        return
      }
    }

    const updated = media.map((m, i) => {
      if (role === 'cover') {
        return { ...m, role: i === index ? ('cover' as MediaRole) : ('gallery' as MediaRole) }
      }
      return i === index ? { ...m, role } : m
    })
    onChange(updated)
    onToast?.('Rol de imagen actualizado', 'success')
  }

  const handleAltBlur = async (index: number, rawAlt: string) => {
    const item = media[index]
    if (!item) return

    const normalizedAlt = rawAlt.trim()

    // No enviar request si el valor no cambió
    if (item.alt === normalizedAlt) return

    if (item.id && !item.id.startsWith('fallback')) {
      try {
        const response = await cmsApi.updateMediaAlt(item.id, normalizedAlt)
        if (!response.success) {
          onToast?.(response.error || 'No se pudo guardar el texto alternativo', 'error')
          return
        }
      } catch {
        onToast?.('Error al guardar el texto alternativo', 'error')
        return
      }
    }

    // Solo modificar estado local después de éxito
    const updated = media.map((m, i) => (i === index ? { ...m, alt: normalizedAlt } : m))
    onChange(updated)
    onToast?.('Texto alternativo guardado', 'success')
  }

  const archiveMedia = async (index: number) => {
    const item = media[index]
    if (!item) return

    if (!window.confirm('¿Confirma que desea quitar esta imagen?')) {
      return
    }

    if (item.id && !item.id.startsWith('fallback')) {
      try {
        const response = await cmsApi.archiveMedia(item.id)
        if (!response.success) {
          onToast?.(response.error || 'No se pudo quitar la imagen', 'error')
          return
        }
      } catch {
        onToast?.('Error al quitar la imagen', 'error')
        return
      }
    }

    const updated = media.filter((_, i) => i !== index)
    onChange(updated)
    onToast?.('Imagen quitada correctamente', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label className="btn-secondary-admin" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
          {uploading ? 'Subiendo imagen...' : '📷 Seleccionar e Imagen'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '0.8rem', color: '#746b64' }}>Formatos: JPG, PNG, WEBP (Max 8MB)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
        {media.map((item, index) => (
          <div key={item.id || index} style={{ border: '1px solid #ded5cc', background: '#ffffff', padding: '0.5rem', borderRadius: 0, position: 'relative' }}>
            {item.url
              ? <img src={item.url} alt={item.alt || ''} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '110px', background: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0a599', fontSize: '1.4rem' }}>🖼</div>
            }

            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <select
                value={item.role || 'gallery'}
                onChange={(e) => setRole(index, e.target.value as MediaRole)}
                style={{ fontSize: '0.75rem', padding: '0.25rem', border: '1px solid #ded5cc' }}
              >
                <option value="cover">{LABELS.mediaRole.cover}</option>
                <option value="gallery">{LABELS.mediaRole.gallery}</option>
                <option value="detail">{LABELS.mediaRole.detail}</option>
                <option value="ambient">{LABELS.mediaRole.ambient}</option>
                <option value="signature">{LABELS.mediaRole.signature}</option>
              </select>

              <input
                type="text"
                placeholder="Texto alt / descripción"
                defaultValue={item.alt || ''}
                onBlur={(e) => handleAltBlur(index, e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.25rem', border: '1px solid #ded5cc' }}
              />

              <button
                type="button"
                onClick={() => archiveMedia(index)}
                style={{ fontSize: '0.75rem', color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: '0.25rem' }}
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
