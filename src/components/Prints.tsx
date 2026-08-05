import type { CSSProperties } from 'react'

import { FEATURED_ARTWORK, PRODUCTS } from '../data/landing'

type ProductImageStyle = CSSProperties & {
  '--print-image-scale'?: string
  '--print-image-hover-scale'?: string
}

export default function Prints() {
  const handleArtworkInquiry = () => {
    window.dispatchEvent(
      new CustomEvent('mora:quote-request', {
        detail: {
          type: 'obra',
          message: `Hola Mora, quiero consultar por la obra "${FEATURED_ARTWORK.title}".\n\nMedida de la obra: ${FEATURED_ARTWORK.size}.\nNecesito presupuesto y disponibilidad.\n\nMi ciudad/zona de entrega:\nTelefono de contacto:\nConsulta o descripcion:`,
        },
      }),
    )
  }

  return (
    <section id="prints" className="prints" aria-labelledby="prints-title">
      <div className="container">
        <div className="section-heading prints__heading" data-reveal>
          <div>
            <p className="section-kicker">Prints</p>
            <h2 id="prints-title" className="section-title">
              Prints y obra disponible.
            </h2>
          </div>
          <p>
            Prints fine art y piezas disponibles para consulta. Los valores son de referencia y luego quedarán conectados a Mercado Pago.
          </p>
        </div>

        <div className="prints__grid">
          {PRODUCTS.map((product) => {
            const imageStyle: ProductImageStyle = {
              objectPosition: product.imagePosition || 'center center',
              '--print-image-scale': product.imageScale || '1',
              '--print-image-hover-scale': product.imageHoverScale || '1.055',
            }

            return (
              <article className="print-card" key={product.title} data-reveal>
                <div className="print-card__image">
                  <img src={product.image} alt={product.title} loading="lazy" style={imageStyle} />
                </div>
                <div className="print-card__copy">
                  <p>{product.edition}</p>
                  <h3>{product.title}</h3>
                  <span>{product.detail}</span>
                  <dl className="print-card__details">
                    <div>
                      <dt>Medida</dt>
                      <dd>{product.size}</dd>
                    </div>
                    <div>
                      <dt>Estado</dt>
                      <dd>{product.availability}</dd>
                    </div>
                  </dl>
                  <div className="print-card__footer">
                    <strong>{product.price}</strong>
                    <a href="#contacto">Consultar</a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="prints__featured-heading" data-reveal>
          <span>Obra original a consultar</span>
        </div>

        <article id="obra" className="featured-artwork-panel" data-reveal>
          <div className="featured-artwork-panel__media">
            <img src={FEATURED_ARTWORK.image} alt={FEATURED_ARTWORK.title} loading="lazy" />
          </div>
          <div className="featured-artwork-panel__copy">
            <p className="featured-artwork-panel__kicker">{FEATURED_ARTWORK.edition}</p>
            <h3>{FEATURED_ARTWORK.title}</h3>
            <span>{FEATURED_ARTWORK.detail}</span>

            <dl className="featured-artwork-panel__details">
              <div>
                <dt>Valor</dt>
                <dd>{FEATURED_ARTWORK.price}</dd>
              </div>
              <div>
                <dt>Medida</dt>
                <dd>{FEATURED_ARTWORK.size}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{FEATURED_ARTWORK.availability}</dd>
              </div>
            </dl>

            <p className="featured-artwork-panel__prompt">{FEATURED_ARTWORK.quotePrompt}</p>
            <a className="btn btn-primary" href="#contacto" onClick={handleArtworkInquiry}>
              Solicitar presupuesto
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
