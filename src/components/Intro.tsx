import { useCms } from '../context/CmsContext'

const DEFAULT_MARQUEE = ['retratos pop', 'murales', 'La Plata', 'memoria popular', 'prints fine art', 'color argentino']

export default function Intro() {
  const { getContent } = useCms()

  const kicker = getContent('intro.kicker', 'Mora Petraglia')
  const title = getContent('intro.title', 'La calle, los íconos y el gesto pop.')
  const copy1 = getContent(
    'intro.copy1',
    'Desde su archivo de Instagram aparece una Mora en movimiento: retratos de personajes argentinos, murales con frases de barrio, fotos de proceso, escenas de muestra y una paleta que mezcla rosa, azul, rojo y turquesa sin pedir permiso.',
  )
  const copy2 = getContent(
    'intro.copy2',
    'Este recorrido toma esa energía como punto de partida: ritmo, movimiento, obra real y una galería concentrada en el vínculo entre pintura, pared y cultura popular.',
  )
  const marqueeRaw = getContent('intro.marquee', DEFAULT_MARQUEE.join(','))
  const marqueeWords = marqueeRaw ? marqueeRaw.split(',').map((w) => w.trim()) : DEFAULT_MARQUEE
  const marqueeTrack = Array.from({ length: 10 }, () => marqueeWords).flat()

  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div data-reveal>
          <p className="section-kicker">{kicker}</p>
          <h2 id="intro-title" className="section-title">
            {title}
          </h2>
        </div>

        <div className="intro__body" data-reveal>
          <p>{copy1}</p>
          <p>{copy2}</p>
        </div>
      </div>

      <div className="intro__marquee" aria-hidden="true">
        <div className="intro__marquee-track">
          {marqueeTrack.map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
