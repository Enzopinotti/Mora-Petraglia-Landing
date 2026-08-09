import type { MediaItem } from './types'

export function formatPrice(price: number | string | null | undefined, currency: string = 'ARS'): string {
  if (price === null || price === undefined || price === '') {
    return 'Consultar'
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price

  if (isNaN(numericPrice) || numericPrice === 0) {
    return 'Consultar'
  }

  try {
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(numericPrice)

    return `$ ${formatted}${currency === 'ARS' ? '' : ` ${currency}`}`
  } catch {
    return `$ ${numericPrice}`
  }
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
    archived: 'Archivado',
  },
  availability: {
    sold: 'Vendido',
    out_of_stock: 'Sin stock',
    available: 'En stock',
    on_request: 'Consultar',
  },
  subtypeProduct: {
    print: 'Print',
    original_artwork: 'Obra original',
    physical_product: 'Producto',
    service: 'Servicio',
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
