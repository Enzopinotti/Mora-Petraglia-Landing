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
    if (token) {
      url.searchParams.set('token', token)
    }

    const options: RequestInit = {
      method: payload ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    }

    if (payload) {
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

  async login(password: string): Promise<ApiResponse<{ token: string; user?: string }>> {
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

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteProduct', { id })
  },

  // Projects CRUD
  async saveProject(project: Partial<Project>): Promise<ApiResponse<Project>> {
    const action = project.id ? 'updateProject' : 'createProject'
    return fetchCms<Project>(action, { project })
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteProject', { id })
  },

  // Events CRUD
  async saveEvent(event: Partial<EventItem>): Promise<ApiResponse<EventItem>> {
    const action = event.id ? 'updateEvent' : 'createEvent'
    return fetchCms<EventItem>(action, { event })
  },

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return fetchCms('deleteEvent', { id })
  },

  // Content & Settings
  async saveContent(content: Record<string, string>): Promise<ApiResponse<void>> {
    return fetchCms('updateContent', { content })
  },

  async saveSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return fetchCms('updateSettings', { settings })
  },

  // Media Upload (Apps Script compatible base64 / payload)
  async uploadMedia(fileData: { fileName: string; mimeType: string; base64: string; entityId?: string; role?: string }): Promise<ApiResponse<{ url: string; id?: string }>> {
    return fetchCms('uploadMedia', fileData)
  },
}
