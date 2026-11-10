import type { EventItem, Product, Project } from './types'

/**
 * Defensa del render público. El CMS ya filtra por estado, pero una respuesta
 * accidentalmente más amplia no debe publicar borradores u obras archivadas.
 * El panel administrativo usa los arrays completos, sin pasar por estos filtros.
 */
const PUBLIC_PRODUCT_STATUSES: ReadonlySet<Product['status']> = new Set([
  'published',
  'sold',
  'out_of_stock',
])

export function filterPublicProducts<T extends Pick<Product, 'status'>>(items: readonly T[]): T[] {
  return items.filter((item) => PUBLIC_PRODUCT_STATUSES.has(item.status))
}

export function filterPublicProjects<T extends Pick<Project, 'status'>>(items: readonly T[]): T[] {
  return items.filter((item) => item.status === 'published')
}

export function filterPublicEvents<T extends Pick<EventItem, 'status'>>(items: readonly T[]): T[] {
  return items.filter((item) => item.status === 'published')
}
