export type SubtypeProduct = 'print' | 'original_artwork' | 'physical_product' | 'service' | 'other'
export type ProductStatus = 'draft' | 'published' | 'hidden' | 'sold' | 'out_of_stock' | 'archived'
export type ProductAvailability = 'available' | 'sold' | 'out_of_stock' | 'on_request'

export type MediaRole = 'cover' | 'gallery' | 'detail' | 'ambient' | 'signature'

export interface MediaItem {
  id?: string
  url: string
  role?: MediaRole
  alt?: string
  sort_order?: number
}

export interface Product {
  id: string
  slug?: string
  name: string
  subtype: SubtypeProduct
  short_description?: string
  description?: string
  technique?: string
  support?: string
  year?: string | number
  width?: string | number
  height?: string | number
  depth?: string | number
  size_label?: string
  price?: number | string | null
  currency?: string
  sale_mode?: string
  payment_link?: string
  stock?: number
  edition_type?: string
  edition_total?: number | string
  signed?: boolean
  certificate?: boolean
  availability?: ProductAvailability | string
  status: ProductStatus
  featured?: boolean
  sort_order?: number
  seo_title?: string
  seo_description?: string
  media?: MediaItem[]
  image?: string // Fallback compatibility
}

export type SubtypeProject = 'mural' | 'installation' | 'collaboration' | 'other'

export interface Project {
  id: string
  slug?: string
  title: string
  subtype?: SubtypeProject
  short_description?: string
  description?: string
  location?: string
  city?: string
  country?: string
  year?: string | number
  client?: string
  technique?: string
  dimensions?: string
  status: ProductStatus
  featured?: boolean
  sort_order?: number
  seo_title?: string
  seo_description?: string
  media?: MediaItem[]
  image?: string // Fallback compatibility
  span?: string
}

export type SubtypeEvent = 'exhibition' | 'award' | 'competition' | 'talk' | 'launch' | 'other'

export interface EventItem {
  id: string
  slug?: string
  title: string
  subtype?: SubtypeEvent
  artwork_name?: string
  institution?: string
  venue?: string
  city?: string
  country?: string
  start_date?: string
  end_date?: string
  year?: string | number
  participation_type?: string
  short_description?: string
  description?: string
  status: ProductStatus
  featured?: boolean
  sort_order?: number
  seo_title?: string
  seo_description?: string
  media?: MediaItem[]
  image?: string // Fallback compatibility
  date_label?: string
}

export type CmsContent = Record<string, string>
export type CmsSettings = Record<string, any>

export interface CmsBootstrap {
  content?: CmsContent
  settings?: CmsSettings
  products?: Product[]
  projects?: Project[]
  events?: EventItem[]
}

export interface AdminSession {
  token: string
  expiresAt?: number
  user?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
