import { cmsAuth } from './auth'
import type { ApiResponse, CmsBootstrap, EventItem, Product, Project } from './types'

const CMS_URL = import.meta.env.VITE_MORA_CMS_URL || ''

/**
 * Normaliza las URLs de imágenes de una entidad a través del proxy de Vercel.
 */
function normalizeEntityMedia<T extends { media?: any[]; image?: string }>(entity: T): T {
  if (!entity) return entity
  const updatedMedia = entity.media?.map((m) => {
    if (m.id && m.id.startsWith('med_')) {
      return {
        ...m,
        url: `/api/media?id=${m.id}`,
      }
    }
    return m
  })

  let updatedImage = entity.image
  const cover = updatedMedia?.find((m) => m.role === 'cover') || updatedMedia?.[0]
  if (cover && cover.id && cover.id.startsWith('med_')) {
    updatedImage = `/api/media?id=${cover.id}`
  }

  return {
    ...entity,
    media: updatedMedia,
    image: updatedImage,
  }
}

function normalizeBootstrapData(data: CmsBootstrap): CmsBootstrap {
  return {
    ...data,
    products: data.products?.map(normalizeEntityMedia),
    projects: data.projects?.map(normalizeEntityMedia),
    events: data.events?.map(normalizeEntityMedia),
  }
}

async function requestCms<T = any>(
  action: string,
  options: {
    method: 'GET' | 'POST'
    auth?: boolean
    payload?: Record<string, any>
  }
): Promise<ApiResponse<T>> {
  if (!CMS_URL) {
    return { success: false, error: 'VITE_MORA_CMS_URL no está configurada.' }
  }

  try {
    const url = new URL(CMS_URL)
    url.searchParams.set('action', action)

    const reqOptions: RequestInit = {
      method: options.method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    }

    if (options.method === 'POST') {
      const bodyPayload: Record<string, any> = { action, ...(options.payload || {}) }
      if (options.auth) {
        const token = cmsAuth.getToken()
        if (token) {
          bodyPayload.token = token
        }
      }
      reqOptions.body = JSON.stringify(bodyPayload)
    }

    const response = await fetch(url.toString(), reqOptions)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()
    // Log de desarrollo mínimo sin exponer información sensible
    console.log(`[CMS API] Action: ${action} - Success: ${json.success}`)
    return json
  } catch (error: any) {
    console.error(`[CMS API Error] ${action}:`, error)
    return {
      success: false,
      error: error?.message || 'No se pudo conectar con el servidor CMS.',
    }
  }
}

export const cmsApi = {
  // --- PUBLIC READ ENDPOINTS (GET, auth: false) ---
  async health(): Promise<ApiResponse<{ status: string; version?: string }>> {
    return requestCms('health', { method: 'GET', auth: false })
  },

  async getPublicBootstrap(): Promise<ApiResponse<CmsBootstrap>> {
    const res = await requestCms<CmsBootstrap>('bootstrap', { method: 'GET', auth: false })
    if (res.success && res.data) {
      res.data = normalizeBootstrapData(res.data)
    }
    return res
  },

  async getPublicProducts(): Promise<ApiResponse<Product[]>> {
    const res = await requestCms<Product[]>('products', { method: 'GET', auth: false })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getPublicProjects(): Promise<ApiResponse<Project[]>> {
    const res = await requestCms<Project[]>('projects', { method: 'GET', auth: false })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getPublicEvents(): Promise<ApiResponse<EventItem[]>> {
    const res = await requestCms<EventItem[]>('events', { method: 'GET', auth: false })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getPublicContent(): Promise<ApiResponse<Record<string, string>>> {
    return requestCms('content', { method: 'GET', auth: false })
  },

  async getPublicSettings(): Promise<ApiResponse<Record<string, any>>> {
    return requestCms('settings', { method: 'GET', auth: false })
  },

  // --- ADMIN PUBLIC ENDPOINTS ---
  async login(password: string): Promise<ApiResponse<{ token: string; expiresAt?: number; user?: string }>> {
    // POST, no requiere auth token
    return requestCms('login', { method: 'POST', auth: false, payload: { password } })
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await requestCms('logout', { method: 'POST', auth: true })
    cmsAuth.logout()
    return res
  },

  // --- ADMIN AUTHENTICATED ENDPOINTS (POST, auth: true) ---
  async getAdminBootstrap(): Promise<ApiResponse<CmsBootstrap>> {
    const res = await requestCms<CmsBootstrap>('bootstrap', { method: 'POST', auth: true })
    if (res.success && res.data) {
      res.data = normalizeBootstrapData(res.data)
    }
    return res
  },

  async getAdminProducts(): Promise<ApiResponse<Product[]>> {
    const res = await requestCms<Product[]>('products', { method: 'POST', auth: true })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getAdminProjects(): Promise<ApiResponse<Project[]>> {
    const res = await requestCms<Project[]>('projects', { method: 'POST', auth: true })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getAdminEvents(): Promise<ApiResponse<EventItem[]>> {
    const res = await requestCms<EventItem[]>('events', { method: 'POST', auth: true })
    if (res.success && res.data) {
      res.data = res.data.map(normalizeEntityMedia)
    }
    return res
  },

  async getAdminContent(): Promise<ApiResponse<Record<string, string>>> {
    return requestCms('content', { method: 'POST', auth: true })
  },

  async getAdminSettings(): Promise<ApiResponse<Record<string, any>>> {
    return requestCms('settings', { method: 'POST', auth: true })
  },

  // Products CRUD
  async saveProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
    const action = product.id ? 'updateProduct' : 'createProduct'
    const res = await requestCms<Product>(action, { method: 'POST', auth: true, payload: { product } })
    if (res.success && res.data) {
      res.data = normalizeEntityMedia(res.data)
    }
    return res
  },

  async setProductStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return requestCms('updateProductStatus', { method: 'POST', auth: true, payload: { id, status } })
  },

  async publishProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'published')
  },

  async hideProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'hidden')
  },

  async archiveProduct(id: string): Promise<ApiResponse<void>> {
    return requestCms('deleteProduct', { method: 'POST', auth: true, payload: { id } })
  },

  async restoreProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'draft')
  },

  async markProductSold(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'sold')
  },

  async markProductOutOfStock(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'out_of_stock')
  },

  // Projects CRUD
  async saveProject(project: Partial<Project>): Promise<ApiResponse<Project>> {
    const action = project.id ? 'updateProject' : 'createProject'
    const res = await requestCms<Project>(action, { method: 'POST', auth: true, payload: { project } })
    if (res.success && res.data) {
      res.data = normalizeEntityMedia(res.data)
    }
    return res
  },

  async setProjectStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return requestCms('updateProjectStatus', { method: 'POST', auth: true, payload: { id, status } })
  },

  async publishProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'published')
  },

  async hideProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'hidden')
  },

  async archiveProject(id: string): Promise<ApiResponse<void>> {
    return requestCms('deleteProject', { method: 'POST', auth: true, payload: { id } })
  },

  async restoreProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'draft')
  },

  // Events CRUD
  async saveEvent(event: Partial<EventItem>): Promise<ApiResponse<EventItem>> {
    const action = event.id ? 'updateEvent' : 'createEvent'
    const res = await requestCms<EventItem>(action, { method: 'POST', auth: true, payload: { event } })
    if (res.success && res.data) {
      res.data = normalizeEntityMedia(res.data)
    }
    return res
  },

  async setEventStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return requestCms('updateEventStatus', { method: 'POST', auth: true, payload: { id, status } })
  },

  async publishEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'published')
  },

  async hideEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'hidden')
  },

  async archiveEvent(id: string): Promise<ApiResponse<void>> {
    return requestCms('deleteEvent', { method: 'POST', auth: true, payload: { id } })
  },

  async restoreEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'draft')
  },

  // Content & Settings
  async saveContent(content: Record<string, string>): Promise<ApiResponse<void>> {
    return requestCms('updateContent', { method: 'POST', auth: true, payload: { content } })
  },

  async saveSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return requestCms('updateSettings', { method: 'POST', auth: true, payload: { settings } })
  },

  // Media Operations
  async uploadMedia(fileData: {
    fileName: string
    mimeType: string
    base64: string
    entityType: 'products' | 'projects' | 'events' | 'site'
    entityId: string
    role?: string
    altText?: string
  }): Promise<ApiResponse<{ url: string; id?: string }>> {
    const res = await requestCms<{ url: string; id?: string }>('uploadMedia', { method: 'POST', auth: true, payload: fileData })
    if (res.success && res.data?.id) {
      res.data.url = `/api/media?id=${res.data.id}`
    }
    return res
  },

  async updateMediaRole(id: string, role: string): Promise<ApiResponse<void>> {
    return requestCms('updateMediaRole', { method: 'POST', auth: true, payload: { id, role } })
  },

  async updateMediaAlt(id: string, altText: string): Promise<ApiResponse<void>> {
    return requestCms('updateMediaAlt', { method: 'POST', auth: true, payload: { id, altText } })
  },

  async archiveMedia(id: string): Promise<ApiResponse<void>> {
    return requestCms('archiveMedia', { method: 'POST', auth: true, payload: { id } })
  },

  async restoreMedia(id: string): Promise<ApiResponse<void>> {
    return requestCms('restoreMedia', { method: 'POST', auth: true, payload: { id } })
  },

  async updateMediaOrder(id: string, sortOrder: number): Promise<ApiResponse<void>> {
    return requestCms('updateMediaOrder', { method: 'POST', auth: true, payload: { id, sortOrder } })
  },
}
