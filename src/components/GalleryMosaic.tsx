import { getCoverImage, LABELS } from '../cms/helpers'
import { useCms } from '../context/CmsContext'

export default function GalleryMosaic() {
  const { projects, getContent } = useCms()

  const kicker = getContent('murales.kicker', 'Murales')
  const title = getContent('murales.title', 'Galería de murales.')
  const subtitle = getContent(
    'murales.subtitle',
    'Paredes, procesos y escenas de gran escala. Pasá el cursor por cada imagen para ver el detalle.',
  )

  const hideBrokenImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none'
  }

  return (
    <section id="murales" className="gallery-mosaic" aria-labelledby="murales-title">
      <div className="container">
        <div className="section-heading gallery-mosaic__heading" data-reveal>
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 id="murales-title" className="section-title">
              {title}
            </h2>
          </div>
          <p>{subtitle}</p>
        </div>

        {projects.length > 0 && (
          <div className="gallery-mosaic__grid">
            {projects.map((mural) => {
              const imgSrc = getCoverImage(mural.media, mural.image)
              const typeLabel = LABELS.subtypeProject[mural.subtype as keyof typeof LABELS.subtypeProject] || mural.subtype || 'Mural'
              const locationLabel = mural.location || (mural.city ? `${mural.city}, ${mural.country || ''}` : 'La Plata')

              return (
                <article key={mural.id || mural.title} className={`gallery-item${mural.span ? ` gallery-item--${mural.span}` : ''}`} data-reveal>
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={mural.title}
                      loading="lazy"
                      data-parallax="-6"
                      onError={hideBrokenImage}
                    />
                  )}
                  <div className="gallery-item__caption">
                    <p>
                      {typeLabel} · {locationLabel}
                    </p>
                    <h3>{mural.title}</h3>
                    <span>{mural.short_description || mural.description}</span>
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
