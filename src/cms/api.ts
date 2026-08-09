import { cmsAuth } from './auth'
import type { ApiResponse, CmsBootstrap, EventItem, Product, Project } from './types'

const CMS_URL = import.meta.env.VITE_MORA_CMS_URL || ''

async function fetchCms<T = any>(action: string, payload?: Record<string, any>): Promise<ApiResponse<T>> {
  if (!CMS_URL) {
    return { success: false, error: 'VITE_MORA_CMS_URL no está configurada.' }
  }

  try {
    const token = cmsAuth.getToken()
    const url = new URL(CMS_URL)
    url.searchParams.set('action', action)

    // Si hay token o payload, realizar POST enviando token en el body para no exponerlo en la URL
    const isPost = Boolean(payload || token)
    const options: RequestInit = {
      method: isPost ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    }

    if (isPost) {
      options.body = JSON.stringify({ action, token, ...payload })
    }

    const response = await fetch(url.toString(), options)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()
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
  async getBootstrap(): Promise<ApiResponse<CmsBootstrap>> {
    return fetchCms<CmsBootstrap>('bootstrap')
  },

  async login(password: string): Promise<ApiResponse<{ token: string; expiresAt?: number; user?: string }>> {
    return fetchCms('login', { password })
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await fetchCms('logout')
    cmsAuth.logout()
    return res
  },

  // Products CRUD
  async saveProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
    const action = product.id ? 'updateProduct' : 'createProduct'
    return fetchCms<Product>(action, { product })
  },

  async setProductStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return fetchCms('updateProductStatus', { id, status })
  },

  async publishProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'published')
  },

  async hideProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'hidden')
  },

  async archiveProduct(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteProduct', { id })
  },

  async restoreProduct(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'draft')
  },

  async markProductSold(id: string): Promise<ApiResponse<void>> {
    return this.setProductStatus(id, 'sold')
  },

  // Projects CRUD
  async saveProject(project: Partial<Project>): Promise<ApiResponse<Project>> {
    const action = project.id ? 'updateProject' : 'createProject'
    return fetchCms<Project>(action, { project })
  },

  async setProjectStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return fetchCms('updateProjectStatus', { id, status })
  },

  async publishProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'published')
  },

  async hideProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'hidden')
  },

  async archiveProject(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteProject', { id })
  },

  async restoreProject(id: string): Promise<ApiResponse<void>> {
    return this.setProjectStatus(id, 'draft')
  },

  // Events CRUD
  async saveEvent(event: Partial<EventItem>): Promise<ApiResponse<EventItem>> {
    const action = event.id ? 'updateEvent' : 'createEvent'
    return fetchCms<EventItem>(action, { event })
  },

  async setEventStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return fetchCms('updateEventStatus', { id, status })
  },

  async publishEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'published')
  },

  async hideEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'hidden')
  },

  async archiveEvent(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteEvent', { id })
  },

  async restoreEvent(id: string): Promise<ApiResponse<void>> {
    return this.setEventStatus(id, 'draft')
  },

  // Content & Settings
  async saveContent(content: Record<string, string>): Promise<ApiResponse<void>> {
    return fetchCms('updateContent', { content })
  },

  async saveSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return fetchCms('updateSettings', { settings })
  },

  // Media Operations
  async uploadMedia(fileData: {
    fileName: string
    mimeType: string
    base64: string
    entityType: 'products' | 'projects' | 'events'
    entityId: string
    role?: string
    altText?: string
  }): Promise<ApiResponse<{ url: string; id?: string }>> {
    return fetchCms('uploadMedia', fileData)
  },

  async updateMediaRole(id: string, role: string): Promise<ApiResponse<void>> {
    return fetchCms('updateMediaRole', { id, role })
  },

  async updateMediaAlt(id: string, altText: string): Promise<ApiResponse<void>> {
    return fetchCms('updateMediaAlt', { id, altText })
  },

  async archiveMedia(id: string): Promise<ApiResponse<void>> {
    return fetchCms('archiveMedia', { id })
  },
}
