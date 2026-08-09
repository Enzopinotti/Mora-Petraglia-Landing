import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useCms } from '../context/CmsContext'

type QuoteRequestDetail = {
  type?: string
  message?: string
}

export default function Contact() {
  const { getContent } = useCms()
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', type: 'obra', message: '' })
  const [sent, setSent] = useState(false)

  const kicker = getContent('contacto.kicker', 'Contacto')
  const title = getContent('contacto.title', 'Encargos, obra disponible y proyectos.')
  const copy = getContent(
    'contacto.copy',
    'Dejá una consulta para prints, obra original, murales privados o propuestas de exhibición. Para presupuestos, sumá teléfono, medidas, ubicación y una descripción breve.',
  )

  useEffect(() => {
    const handleQuoteRequest = (event: Event) => {
      const detail = (event as CustomEvent<QuoteRequestDetail>).detail

      setSent(false)
      setFormState((current) => ({
        ...current,
        type: detail?.type || 'obra',
        message: detail?.message || current.message,
      }))

      window.setTimeout(() => messageRef.current?.focus(), 350)
    }

    window.addEventListener('mora:quote-request', handleQuoteRequest)
    return () => window.removeEventListener('mora:quote-request', handleQuoteRequest)
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <section id="contacto" className="contact" aria-labelledby="contacto-title">
      <div className="container contact__grid">
        <div className="contact__copy" data-reveal>
          <p className="section-kicker">{kicker}</p>
          <h2 id="contacto-title" className="section-title">
            {title}
          </h2>
          <p>{copy}</p>
        </div>

        {sent ? (
          <div className="contact__sent" data-reveal>
            <h3>Mensaje preparado</h3>
            <p>Gracias por comunicarte. Mora responderá a tu correo a la brevedad.</p>
          </div>
        ) : (
          <form className="contact__form" onSubmit={handleSubmit} data-reveal>
            <div>
              <label htmlFor="contact-name">Nombre completo</label>
              <input
                id="contact-name"
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="contact-phone">Teléfono para enviar el presupuesto</label>
              <input
                id="contact-phone"
                type="tel"
                required
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="contact-type">Tipo de consulta</label>
              <select
                id="contact-type"
                value={formState.type}
                onChange={(e) => setFormState({ ...formState, type: e.target.value })}
              >
                <option value="obra">Obra original</option>
                <option value="print">Prints Fine Art</option>
                <option value="mural">Proyecto o Encargo de Mural</option>
                <option value="exposicion">Muestras y Prensa</option>
                <option value="otro">Otra consulta</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-message">Medidas, ubicación y descripción</label>
              <textarea
                id="contact-message"
                ref={messageRef}
                rows={5}
                required
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
