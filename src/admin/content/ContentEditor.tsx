import { useState, type FormEvent, useEffect } from 'react'
import { cmsApi } from '../../cms/api'
import { useCms } from '../../context/CmsContext'

interface ContentEditorProps {
  onToast: (msg: string, type?: 'success' | 'error') => void
}

const DEFAULT_VALUES: Record<string, string> = {
  'header.announcement': 'Prints de edición limitada disponibles · Envíos a Argentina y exterior',
  'hero.kicker': 'Artista plástica y muralista · La Plata',
  'hero.title_part1': 'Mora',
  'hero.title_part2': 'Petraglia',
  'hero.description': 'Retratos pop, murales y cultura popular argentina en una obra de color intenso, memoria urbana y personajes que vuelven a mirar desde la calle.',
  'hero.cta_primary': 'Ver Prints',
  'hero.cta_secondary': 'Murales',
  'intro.kicker': 'Mora Petraglia',
  'intro.title': 'La calle, los íconos y el gesto pop.',
  'intro.copy1': 'Desde su archivo de Instagram aparece una Mora en movimiento: retratos de personajes argentinos, murales con frases de barrio, fotos de proceso, escenas de muestra y una paleta que mezcla rosa, azul, rojo y turquesa sin pedir permiso.',
  'intro.copy2': 'Este recorrido toma esa energía como punto de partida: ritmo, movimiento, obra real y una galería concentrada en el vínculo entre pintura, pared y cultura popular.',
  'intro.marquee': 'Murales · Cuadros · Retratos Pop · Pintura Urbana · Obra disponible',
  'prints.kicker': 'Prints',
  'prints.title': 'Prints y obra disponible.',
  'prints.subtitle': 'Prints fine art y piezas disponibles para consulta. Los valores son de referencia y luego quedarán conectados a Mercado Pago.',
  'murales.kicker': 'Murales',
  'murales.title': 'Galería de murales.',
  'murales.subtitle': 'Paredes, procesos y escenas de gran escala. Pasá el cursor por cada imagen para ver el detalle.',
  'about.kicker': 'Sobre Mora',
  'about.title': 'Una mirada entre taller, vereda y cultura popular.',
  'about.copy1': 'Mora Petraglia trabaja desde La Plata con una pintura de retrato expresiva, colores saturados y una sensibilidad muy conectada con personajes, frases e imágenes que forman parte del imaginario argentino.',
  'about.copy2': 'En sus redes conviven cuadros, murales, momentos de proceso y registros de exhibiciones. Esa mezcla marca el nuevo tono del sitio: menos catálogo quieto, más recorrido visual por una obra en circulación.',
  'about.image_url': '',
  'about.cta_label': 'Escribirle a Mora',
  'exhibiciones.kicker': 'Exhibiciones',
  'exhibiciones.title': 'Muestras, obra pública y encuentros.',
  'exhibiciones.subtitle': 'Registros de obra en exhibición, encuentros culturales y momentos donde la pintura sale a dialogar con público.',
  'contacto.kicker': 'Contacto',
  'contacto.title': 'Encargos, obra disponible y proyectos.',
  'contacto.copy': 'Dejá una consulta para prints, obra original, murales privados o propuestas de exhibición. Para presupuestos, sumá teléfono, medidas, ubicación y una descripción breve.',
  'footer.location': 'La Plata, Buenos Aires, Argentina.',
}

export default function ContentEditor({ onToast }: ContentEditorProps) {
  const { content, refetch } = useCms()
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  // Sincronización controlada sin pisar campos editándose (dirty)
  useEffect(() => {
    const newState: Record<string, string> = { ...formState }
    Object.keys(DEFAULT_VALUES).forEach((key) => {
      if (!dirtyFields[key]) {
        newState[key] = content[key] !== undefined ? content[key] : DEFAULT_VALUES[key]
      }
    })
    setFormState(newState)
  }, [content])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await cmsApi.saveContent(formState)
      if (response.success) {
        onToast('Textos guardados correctamente', 'success')
        setDirtyFields({})
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
    setDirtyFields((prev) => ({ ...prev, [key]: true }))
  }

  const sections = [
    {
      name: 'Cabecera (Header / Footer)',
      fields: [
        { key: 'header.announcement', label: 'Anuncio superior', type: 'input' },
        { key: 'footer.location', label: 'Ubicación en el pie de página', type: 'input' },
      ],
    },
    {
      name: 'Hero / Portada Principal',
      fields: [
        { key: 'hero.kicker', label: 'Bajada Kicker', type: 'input' },
        { key: 'hero.title_part1', label: 'Título Línea 1', type: 'input' },
        { key: 'hero.title_part2', label: 'Título Línea 2', type: 'input' },
        { key: 'hero.description', label: 'Descripción principal', type: 'textarea' },
        { key: 'hero.cta_primary', label: 'Botón Primario (ej: Ver Prints)', type: 'input' },
        { key: 'hero.cta_secondary', label: 'Botón Secundario (ej: Murales)', type: 'input' },
      ],
    },
    {
      name: 'Introducción',
      fields: [
        { key: 'intro.kicker', label: 'Kicker', type: 'input' },
        { key: 'intro.title', label: 'Título', type: 'input' },
        { key: 'intro.copy1', label: 'Párrafo 1', type: 'textarea' },
        { key: 'intro.copy2', label: 'Párrafo 2', type: 'textarea' },
        { key: 'intro.marquee', label: 'Texto Marquesina Desplazable (Marquee)', type: 'input' },
      ],
    },
    {
      name: 'Sección Prints',
      fields: [
        { key: 'prints.kicker', label: 'Kicker', type: 'input' },
        { key: 'prints.title', label: 'Título', type: 'input' },
        { key: 'prints.subtitle', label: 'Subtítulo / Bajada', type: 'textarea' },
      ],
    },
    {
      name: 'Sección Murales',
      fields: [
        { key: 'murales.kicker', label: 'Kicker', type: 'input' },
        { key: 'murales.title', label: 'Título', type: 'input' },
        { key: 'murales.subtitle', label: 'Subtítulo / Bajada', type: 'textarea' },
      ],
    },
    {
      name: 'Sobre Mora (Bio)',
      fields: [
        { key: 'about.kicker', label: 'Kicker', type: 'input' },
        { key: 'about.title', label: 'Título', type: 'input' },
        { key: 'about.copy1', label: 'Párrafo Bio 1', type: 'textarea' },
        { key: 'about.copy2', label: 'Párrafo Bio 2', type: 'textarea' },
        { key: 'about.cta_label', label: 'Etiqueta del Botón de Contacto', type: 'input' },
        { key: 'about.image_url', label: 'URL de Imagen de Mora (About)', type: 'input' },
      ],
    },
    {
      name: 'Sección Exhibiciones',
      fields: [
        { key: 'exhibiciones.kicker', label: 'Kicker', type: 'input' },
        { key: 'exhibiciones.title', label: 'Título', type: 'input' },
        { key: 'exhibiciones.subtitle', label: 'Subtítulo / Bajada', type: 'textarea' },
      ],
    },
    {
      name: 'Sección Contacto',
      fields: [
        { key: 'contacto.kicker', label: 'Kicker', type: 'input' },
        { key: 'contacto.title', label: 'Título', type: 'input' },
        { key: 'contacto.copy', label: 'Texto descriptivo del formulario', type: 'textarea' },
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
