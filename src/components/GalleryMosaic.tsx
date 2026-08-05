import { MURALS } from '../data/landing'

export default function GalleryMosaic() {
  return (
    <section id="murales" className="gallery-mosaic" aria-labelledby="murales-title">
      <div className="container">
        <div className="section-heading gallery-mosaic__heading" data-reveal>
          <div>
            <p className="section-kicker">Murales</p>
            <h2 id="murales-title" className="section-title">
              Galería de murales.
            </h2>
          </div>
          <p>
            Paredes, procesos y escenas de gran escala. Pasá el cursor por cada imagen para ver el detalle.
          </p>
        </div>

        <div className="gallery-mosaic__grid">
          {MURALS.map((mural) => (
            <article key={mural.title} className={`gallery-item${mural.span ? ` gallery-item--${mural.span}` : ''}`} data-reveal>
              <img src={mural.image} alt={mural.title} loading="lazy" data-parallax="-6" />
              <div className="gallery-item__caption">
                <p>{mural.type} · {mural.location}</p>
                <h3>{mural.title}</h3>
                <span>{mural.note}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
