import { useState, type FormEvent } from 'react'
import { cmsApi } from '../../cms/api'
import { useCms } from '../../context/CmsContext'

interface ContentEditorProps {
  onToast: (msg: string, type?: 'success' | 'error') => void
}

export default function ContentEditor({ onToast }: ContentEditorProps) {
  const { content, refetch } = useCms()
  const [formState, setFormState] = useState<Record<string, string>>({
    'header.announcement': content['header.announcement'] || 'Prints de edición limitada disponibles · Envíos a Argentina y exterior',
    'hero.kicker': content['hero.kicker'] || 'Artista plástica y muralista · La Plata',
    'hero.title_part1': content['hero.title_part1'] || 'Mora',
    'hero.title_part2': content['hero.title_part2'] || 'Petraglia',
    'hero.description': content['hero.description'] || 'Retratos pop, murales y cultura popular argentina en una obra de color intenso, memoria urbana y personajes que vuelven a mirar desde la calle.',
    'intro.kicker': content['intro.kicker'] || 'Mora Petraglia',
    'intro.title': content['intro.title'] || 'La calle, los íconos y el gesto pop.',
    'intro.copy1': content['intro.copy1'] || 'Desde su archivo de Instagram aparece una Mora en movimiento: retratos de personajes argentinos, murales con frases de barrio, fotos de proceso, escenas de muestra y una paleta que mezcla rosa, azul, rojo y turquesa sin pedir permiso.',
    'intro.copy2': content['intro.copy2'] || 'Este recorrido toma esa energía como punto de partida: ritmo, movimiento, obra real y una galería concentrada en el vínculo entre pintura, pared y cultura popular.',
    'prints.title': content['prints.title'] || 'Prints y obra disponible.',
    'murales.title': content['murales.title'] || 'Galería de murales.',
    'about.title': content['about.title'] || 'Una mirada entre taller, vereda y cultura popular.',
    'exhibiciones.title': content['exhibiciones.title'] || 'Muestras, obra pública y encuentros.',
    'contacto.title': content['contacto.title'] || 'Encargos, obra disponible y proyectos.',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await cmsApi.saveContent(formState)
      if (response.success) {
        onToast('Textos guardados correctamente', 'success')
        await refetch()
      } else {
        onToast(response.error || 'No se pudieron guardar los textos', 'error')
      }
    } catch {
      onToast('Error al guardar los textos', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const sections = [
    {
      name: 'Header / Barra Superior',
      fields: [
        { key: 'header.announcement', label: 'Anuncio superior', type: 'input' },
      ],
    },
    {
      name: 'Hero / Portada Principal',
      fields: [
        { key: 'hero.kicker', label: 'Bajada Kicker', type: 'input' },
        { key: 'hero.title_part1', label: 'Título Línea 1', type: 'input' },
        { key: 'hero.title_part2', label: 'Título Línea 2', type: 'input' },
        { key: 'hero.description', label: 'Descripción principal', type: 'textarea' },
      ],
    },
    {
      name: 'Introducción',
      fields: [
        { key: 'intro.kicker', label: 'Kicker', type: 'input' },
        { key: 'intro.title', label: 'Título', type: 'input' },
        { key: 'intro.copy1', label: 'Párrafo 1', type: 'textarea' },
        { key: 'intro.copy2', label: 'Párrafo 2', type: 'textarea' },
      ],
    },
    {
      name: 'Títulos de Secciones',
      fields: [
        { key: 'prints.title', label: 'Título de Prints', type: 'input' },
        { key: 'murales.title', label: 'Título de Murales', type: 'input' },
        { key: 'about.title', label: 'Título Sobre Mora', type: 'input' },
        { key: 'exhibiciones.title', label: 'Título Exhibiciones', type: 'input' },
        { key: 'contacto.title', label: 'Título Contacto', type: 'input' },
      ],
    },
  ]

  return (
    <div>
      <div className="admin-header-actions">
        <h2>Edición de Textos</h2>
        <button className="btn-primary-admin" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Todos los Textos'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map((sec) => (
          <div key={sec.name} style={{ background: '#ffffff', border: '1px solid #ded5cc', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', margin: '0 0 1.25rem 0', borderBottom: '1px solid #eee8e0', paddingBottom: '0.5rem' }}>
              {sec.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {sec.fields.map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#181615' }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formState[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formState[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ded5cc' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary-admin" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Todos los Textos'}
          </button>
        </div>
      </form>
    </div>
  )
}
