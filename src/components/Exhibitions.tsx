import { EXHIBITIONS } from '../data/landing'

export default function Exhibitions() {
  return (
    <section id="exhibiciones" className="exhibitions" aria-labelledby="exhibiciones-title">
      <div className="container">
        <div className="section-heading exhibitions__heading" data-reveal>
          <div>
            <p className="section-kicker">Exhibiciones</p>
            <h2 id="exhibiciones-title" className="section-title">
              Muestras, obra pública y encuentros.
            </h2>
          </div>
          <p>
            Registros de obra en exhibición, encuentros culturales y momentos donde la pintura sale a dialogar con público.
          </p>
        </div>

        <div className="exhibitions__grid">
          {EXHIBITIONS.map((item) => (
            <article className="exhibition-card" key={item.title} data-reveal>
              <div className="exhibition-card__image">
                <img src={item.image} alt={item.title} loading="lazy" style={{ objectPosition: item.imagePosition }} />
              </div>
              <div className="exhibition-card__copy">
                <p>{item.date}</p>
                <h3>{item.title}</h3>
                <span>{item.text}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
