import type { CSSProperties } from 'react'
import { formatPrice, getCoverImage, LABELS } from '../cms/helpers'
import { useCms } from '../context/CmsContext'
import { FEATURED_ARTWORK } from '../data/landing'

type ProductImageStyle = CSSProperties & {
  '--print-image-scale'?: string
  '--print-image-hover-scale'?: string
}

export default function Prints() {
  const { products, getContent } = useCms()

  const kicker = getContent('prints.kicker', 'Prints')
  const title = getContent('prints.title', 'Prints y obra disponible.')
  const subtitle = getContent(
    'prints.subtitle',
    'Prints fine art y piezas disponibles para consulta. Los valores son de referencia y luego quedarán conectados a Mercado Pago.',
  )

  // Separar prints y obra destacada
  const printsList = products.filter((p) => p.subtype === 'print' || !p.subtype)
  const featuredProduct = products.find((p) => p.subtype === 'original_artwork' && p.featured) || products.find((p) => p.subtype === 'original_artwork')

  const handleArtworkInquiry = (artworkTitle: string, size?: string) => {
    window.dispatchEvent(
      new CustomEvent('mora:quote-request', {
        detail: {
          type: 'obra',
          message: `Hola Mora, quiero consultar por la obra "${artworkTitle}".\n\nMedida de la obra: ${size || 'A convenir'}.\nNecesito presupuesto y disponibilidad.\n\nMi ciudad/zona de entrega:\nTelefono de contacto:\nConsulta o descripcion:`,
        },
      }),
    )
  }

  const featTitle = featuredProduct?.name || FEATURED_ARTWORK.title
  const featEdition = featuredProduct ? (LABELS.subtypeProduct[featuredProduct.subtype] || 'Obra original') : FEATURED_ARTWORK.edition
  const featDetail = featuredProduct?.short_description || FEATURED_ARTWORK.detail
  const featPrice = featuredProduct ? formatPrice(featuredProduct.price, featuredProduct.currency) : FEATURED_ARTWORK.price
  const featSize = featuredProduct?.size_label || (featuredProduct?.width && featuredProduct?.height ? `${featuredProduct.width} x ${featuredProduct.height} cm` : FEATURED_ARTWORK.size)
  const featAvailability = featuredProduct ? (LABELS.availability[featuredProduct.availability as keyof typeof LABELS.availability] || 'Consultar') : FEATURED_ARTWORK.availability
  const featImage = featuredProduct ? getCoverImage(featuredProduct.media, featuredProduct.image) : FEATURED_ARTWORK.image

  return (
    <section id="prints" className="prints" aria-labelledby="prints-title">
      <div className="container">
        <div className="section-heading prints__heading" data-reveal>
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 id="prints-title" className="section-title">
              {title}
            </h2>
          </div>
          <p>{subtitle}</p>
        </div>

        <div className="prints__grid">
          {printsList.map((product) => {
            const imgSrc = getCoverImage(product.media, product.image)
            const priceFormatted = formatPrice(product.price, product.currency)
            const availabilityLabel = LABELS.availability[product.availability as keyof typeof LABELS.availability] || product.availability || 'En stock'
            const editionLabel = product.edition_type || LABELS.subtypeProduct[product.subtype] || 'Serie limitada'
            const sizeLabel = product.size_label || (product.width && product.height ? `${product.width} x ${product.height} cm` : 'Medida estándar')

            const imageStyle: ProductImageStyle = {
              objectPosition: 'center center',
              '--print-image-scale': '1',
              '--print-image-hover-scale': '1.055',
            }

            return (
              <article className="print-card" key={product.id || product.name} data-reveal>
                <div className="print-card__image">
                  <img src={imgSrc} alt={product.name} loading="lazy" style={imageStyle} />
                </div>
                <div className="print-card__copy">
                  <p>{editionLabel}</p>
                  <h3>{product.name}</h3>
                  <span>{product.short_description || product.description}</span>
                  <dl className="print-card__details">
                    <div>
                      <dt>Medida</dt>
                      <dd>{sizeLabel}</dd>
                    </div>
                    <div>
                      <dt>Estado</dt>
                      <dd>{availabilityLabel}</dd>
                    </div>
                  </dl>
                  <div className="print-card__footer">
                    <strong>{priceFormatted}</strong>
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
            <img src={featImage} alt={featTitle} loading="lazy" />
          </div>
          <div className="featured-artwork-panel__copy">
            <p className="featured-artwork-panel__kicker">{featEdition}</p>
            <h3>{featTitle}</h3>
            <span>{featDetail}</span>

            <dl className="featured-artwork-panel__details">
              <div>
                <dt>Valor</dt>
                <dd>{featPrice}</dd>
              </div>
              <div>
                <dt>Medida</dt>
                <dd>{featSize}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{featAvailability}</dd>
              </div>
            </dl>

            <p className="featured-artwork-panel__prompt">{FEATURED_ARTWORK.quotePrompt}</p>
            <a className="btn btn-primary" href="#contacto" onClick={() => handleArtworkInquiry(featTitle, featSize)}>
              Solicitar presupuesto
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
