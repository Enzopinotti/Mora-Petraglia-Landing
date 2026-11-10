import type { MediaItem } from './types'

export function parseArgentinePrice(price: number | string | null | undefined): number | null {
  if (typeof price === 'number') {
    return Number.isFinite(price) && price >= 0 ? price : null
  }
  if (typeof price !== 'string') return null

  const value = price
    .replace(/^\s*(?:ARS\s*)?\$?\s*/i, '')
    .replace(/\s*ARS\s*$/i, '')
    .trim()

  if (!value) return null
  if (/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(value)) {
    const number = Number(value.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(number) ? number : null
  }
  if (/^\d+\.\d{1,2}$/.test(value)) {
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }
  return null
}

export function formatPrice(price: number | string | null | undefined, currency: string = 'ARS'): string {
  const numericPrice = parseArgentinePrice(price)
  if (numericPrice === null || numericPrice === 0) {
    return 'Consultar'
  }

  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(numericPrice)
  return `$ ${formatted}${currency === 'ARS' ? '' : ` ${currency}`}`
}

export function getCoverImage(media?: MediaItem[], fallback?: string): string {
  if (!media || media.length === 0) return fallback || ''
  const cover = media.find((m) => m.role === 'cover')
  return cover?.url || media[0]?.url || fallback || ''
}

export function getGalleryImages(media?: MediaItem[]): MediaItem[] {
  if (!media) return []
  return media.filter((m) => m.role !== 'cover')
}

export const LABELS = {
  status: {
    draft: 'Borrador',
    published: 'Publicado',
    hidden: 'Oculto',
    sold: 'Vendido',
    out_of_stock: 'Sin stock',
    archived: 'Archivado',
  },
  availability: {
    available: 'En stock',
    sold: 'Vendido',
    out_of_stock: 'Sin stock',
    on_request: 'Consultar',
  },
  subtypeProduct: {
    print: 'Print',
    original_artwork: 'Obra original',
    physical_product: 'Producto',
    service: 'Servicio',
    other: 'Otro',
  },
  subtypeProject: {
    mural: 'Mural',
    installation: 'Instalación',
    collaboration: 'Colaboración',
    other: 'Otro',
  },
  subtypeEvent: {
    exhibition: 'Exhibición',
    award: 'Premio',
    competition: 'Salón / certamen',
    talk: 'Charla',
    launch: 'Inauguración',
    other: 'Otro',
  },
  mediaRole: {
    cover: 'Portada',
    gallery: 'Galería',
    detail: 'Detalle',
    ambient: 'Ambientada',
    signature: 'Firma',
  },
  saleMode: {
    inquiry: 'Consultar',
    direct: 'Compra directa',
    unavailable: 'No disponible',
  },
}
