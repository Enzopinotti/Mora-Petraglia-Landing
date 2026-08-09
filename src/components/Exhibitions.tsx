import { getCoverImage, LABELS } from '../cms/helpers'
import { useCms } from '../context/CmsContext'

export default function Exhibitions() {
  const { events, getContent } = useCms()

  const kicker = getContent('exhibiciones.kicker', 'Exhibiciones')
  const title = getContent('exhibiciones.title', 'Muestras, obra pública y encuentros.')
  const subtitle = getContent(
    'exhibiciones.subtitle',
    'Registros de obra en exhibición, encuentros culturales y momentos donde la pintura sale a dialogar con público.',
  )

  const hideBrokenImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none'
  }

  return (
    <section id="exhibiciones" className="exhibitions" aria-labelledby="exhibiciones-title">
      <div className="container">
        <div className="section-heading exhibitions__heading" data-reveal>
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 id="exhibiciones-title" className="section-title">
              {title}
            </h2>
          </div>
          <p>{subtitle}</p>
        </div>

        {events.length > 0 && (
          <div className="exhibitions__grid">
            {events.map((item) => {
              const imgSrc = getCoverImage(item.media, item.image)
              const typeLabel = LABELS.subtypeEvent[item.subtype as keyof typeof LABELS.subtypeEvent] || 'Exhibición'
              const dateLabel = item.date_label || (item.year ? `${typeLabel} · ${item.year}` : typeLabel)

              return (
                <article className="exhibition-card" key={item.id || item.title} data-reveal>
                  <div className="exhibition-card__image">
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={item.title}
                        loading="lazy"
                        style={{ objectPosition: 'center center' }}
                        onError={hideBrokenImage}
                      />
                    )}
                  </div>
                  <div className="exhibition-card__copy">
                    <p>{dateLabel}</p>
                    <h3>{item.title}</h3>
                    <span>{item.short_description || item.description}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
