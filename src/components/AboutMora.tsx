import { ABOUT_IMAGE } from '../data/landing'

export default function AboutMora() {
  return (
    <section id="sobre-mora" className="about-mora" aria-labelledby="sobre-title">
      <div className="container about-mora__grid">
        <div className="about-mora__media" data-reveal>
          <div className="about-mora__image-wrapper">
            <img src={ABOUT_IMAGE} alt="Mora Petraglia junto a una obra de Maradona" loading="lazy" />
          </div>
        </div>

        <div className="about-mora__copy" data-reveal>
          <p className="section-kicker">Sobre Mora</p>
          <h2 id="sobre-title" className="section-title">
            Una mirada entre taller, vereda y cultura popular.
          </h2>
          <div className="about-mora__text">
            <p>
              Mora Petraglia trabaja desde La Plata con una pintura de retrato expresiva, colores saturados y una sensibilidad muy conectada con personajes, frases e imágenes que forman parte del imaginario argentino.
            </p>
            <p>
              En sus redes conviven cuadros, murales, momentos de proceso y registros de exhibiciones. Esa mezcla marca el nuevo tono del sitio: menos catálogo quieto, más recorrido visual por una obra en circulación.
            </p>
          </div>
          <a href="#contacto" className="btn btn-outline">
            Escribirle a Mora
          </a>
        </div>
      </div>
    </section>
  )
}
