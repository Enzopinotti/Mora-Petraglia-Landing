import { useEffect } from 'react'
import { useCms } from '../context/CmsContext'

export default function SiteMeta() {
  const { getSetting } = useCms()

  const seoTitle = getSetting('seo_title') || 'Mora Petraglia — Artista Plástica y Muralista'
  const seoDescription = getSetting('seo_description') || 'Portfolio y tienda de Mora Petraglia, artista plástica y muralista de La Plata.'

  useEffect(() => {
    // Título
    document.title = seoTitle

    // Meta descripción
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', seoDescription)

    // OpenGraph
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', seoTitle)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', seoDescription)

    // Twitter
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.setAttribute('content', seoTitle)

    const twitterDesc = document.querySelector('meta[name="twitter:description"]')
    if (twitterDesc) twitterDesc.setAttribute('content', seoDescription)
  }, [seoTitle, seoDescription])

  return null
}
