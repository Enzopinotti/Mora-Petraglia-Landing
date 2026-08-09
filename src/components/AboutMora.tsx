import { useCms } from '../context/CmsContext'
import { ABOUT_IMAGE } from '../data/landing'

export default function AboutMora() {
  const { getContent } = useCms()

  const kicker = getContent('about.kicker', 'Sobre Mora')
  const title = getContent('about.title', 'Una mirada entre taller, vereda y cultura popular.')
  const copy1 = getContent(
    'about.copy1',
    'Mora Petraglia trabaja desde La Plata con una pintura de retrato expresiva, colores saturados y una sensibilidad muy conectada con personajes, frases e imágenes que forman parte del imaginario argentino.',
  )
  const copy2 = getContent(
    'about.copy2',
    'En sus redes conviven cuadros, murales, momentos de proceso y registros de exhibiciones. Esa mezcla marca el nuevo tono del sitio: menos catálogo quieto, más recorrido visual por una obra en circulación.',
  )
  const imageUrl = getContent('about.image_url', ABOUT_IMAGE)
  const ctaLabel = getContent('about.cta_label', 'Escribirle a Mora')

  return (
    <section id="sobre-mora" className="about-mora" aria-labelledby="sobre-title">
      <div className="container about-mora__grid">
        <div className="about-mora__media" data-reveal>
          <div className="about-mora__image-wrapper">
            <img src={imageUrl} alt="Mora Petraglia en su taller" loading="lazy" />
          </div>
        </div>

        <div className="about-mora__copy" data-reveal>
          <p className="section-kicker">{kicker}</p>
          <h2 id="sobre-title" className="section-title">
            {title}
          </h2>
          <div className="about-mora__text">
            <p>{copy1}</p>
            <p>{copy2}</p>
          </div>
          <a href="#contacto" className="btn btn-outline">
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
