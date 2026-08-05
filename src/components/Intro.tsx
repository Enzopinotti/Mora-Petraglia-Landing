const MARQUEE_WORDS = ['retratos pop', 'murales', 'La Plata', 'memoria popular', 'prints fine art', 'color argentino']
const MARQUEE_TRACK = Array.from({ length: 10 }, () => MARQUEE_WORDS).flat()

export default function Intro() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div data-reveal>
          <p className="section-kicker">Mora Petraglia</p>
          <h2 id="intro-title" className="section-title">
            La calle, los íconos y el gesto pop.
          </h2>
        </div>

        <div className="intro__body" data-reveal>
          <p>
            Desde su archivo de Instagram aparece una Mora en movimiento: retratos de personajes argentinos, murales con frases de barrio, fotos de proceso, escenas de muestra y una paleta que mezcla rosa, azul, rojo y turquesa sin pedir permiso.
          </p>
          <p>
            Este recorrido toma esa energía como punto de partida: ritmo, movimiento, obra real y una galería concentrada en el vínculo entre pintura, pared y cultura popular.
          </p>
        </div>
      </div>

      <div className="intro__marquee" aria-hidden="true">
        <div className="intro__marquee-track">
          {MARQUEE_TRACK.map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
