import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { cmsApi } from '../cms/api'
import { cmsAuth } from '../cms/auth'
import type { CmsBootstrap, CmsContent, CmsSettings, EventItem, Product, Project } from '../cms/types'
import { EXHIBITIONS, MURALS, PRODUCTS } from '../data/landing'

interface CmsContextType {
  loading: boolean
  error: string | null
  content: CmsContent
  settings: CmsSettings
  products: Product[]
  projects: Project[]
  events: EventItem[]
  getContent: (key: string, fallback?: string) => string
  getSetting: (key: string, fallback?: any) => any
  refetch: () => Promise<boolean>
  source: 'cms' | 'fallback' | null
}

const CmsContext = createContext<CmsContextType | null>(null)

// Promesa compartida para deduplicar bootstrapping simultáneo en Dev (StrictMode)
let publicBootstrapPromise: Promise<any> | null = null

export function CmsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CmsBootstrap | null>(null)
  const [source, setSource] = useState<'cms' | 'fallback' | null>(null)

  const fetchBootstrap = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    const isAdmin = window.location.pathname.startsWith('/admin')
    const hasToken = cmsAuth.isAuthenticated()

    try {
      let response
      if (isAdmin && hasToken) {
        response = await cmsApi.getAdminBootstrap()
      } else {
        // En parte pública o login sin token, usamos bootstrap público
        if (!publicBootstrapPromise) {
          publicBootstrapPromise = cmsApi.getPublicBootstrap()
        }
        response = await publicBootstrapPromise
        // Limpiamos después del resultado para futuros refetchs manuales
        publicBootstrapPromise = null
      }

      if (response.success && response.data) {
        setData(response.data)
        setSource('cms')
        setLoading(false)
        return true
      } else {
        // Fallback local solo en fallo real de CMS público
        if (!isAdmin) {
          setSource('fallback')
          setData({})
        } else {
          setError(response.error || 'Sesión inválida o error en el panel administrativo.')
        }
        setLoading(false)
        return false
      }
    } catch (err: any) {
      if (!isAdmin) {
        setSource('fallback')
        setData({})
      } else {
        setError(err?.message || 'Error de conexión con el servidor CMS.')
      }
      setLoading(false)
      return false
    }
  }

  useEffect(() => {
    // Si es /admin pero no hay sesión guardada, no hace falta gatillar bootstrap público
    const isAdmin = window.location.pathname.startsWith('/admin')
    const hasToken = cmsAuth.isAuthenticated()
    if (isAdmin && !hasToken) {
      setLoading(false)
      return
    }
    fetchBootstrap()
  }, [])

  const cleanLegacyUrl = (val: any): any => {
    if (typeof val !== 'string') return val
    // Limpieza legacy Markdown [https://www.instagram.com/morapetraglia/](https://www.instagram.com/morapetraglia/)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/
    const match = val.match(mdLinkRegex)
    if (match) {
      let url = match[2]
      if (url.startsWith('mailto:')) {
        return url.replace('mailto:', '')
      }
      return url
    }
    return val
  }

  const getContent = (key: string, fallback: string = ''): string => {
    if (data?.content && data.content[key]) {
      return cleanLegacyUrl(data.content[key])
    }
    return fallback
  }

  const getSetting = (key: string, fallback: any = null): any => {
    if (data?.settings && data.settings[key] !== undefined) {
      return cleanLegacyUrl(data.settings[key])
    }
    return fallback
  }

  // Resolver productos
  const products: Product[] =
    source === 'cms' && data?.products !== undefined && data.products !== null
      ? data.products
      : source === 'fallback'
      ? PRODUCTS.map((p, idx) => ({
          id: `fallback-p-${idx}`,
          name: p.title,
          subtype: 'print',
          short_description: p.detail,
          price: p.price,
          size_label: p.size,
          edition_type: p.edition,
          status: 'published',
          image: p.image,
          sort_order: idx,
        }))
      : []

  // Resolver proyectos (murales)
  const projects: Project[] =
    source === 'cms' && data?.projects !== undefined && data.projects !== null
      ? data.projects
      : source === 'fallback'
      ? MURALS.map((m, idx) => ({
          id: `fallback-m-${idx}`,
          title: m.title,
          subtype: 'mural',
          short_description: m.note,
          location: m.location,
          status: 'published',
          image: m.image,
          span: m.span,
          sort_order: idx,
        }))
      : []

  // Resolver exhibiciones
  const events: EventItem[] =
    source === 'cms' && data?.events !== undefined && data.events !== null
      ? data.events
      : source === 'fallback'
      ? EXHIBITIONS.map((ex, idx) => ({
          id: `fallback-e-${idx}`,
          title: ex.title,
          subtype: 'exhibition',
          short_description: ex.text,
          date_label: ex.date,
          status: 'published',
          image: ex.image,
          sort_order: idx,
        }))
      : []

  return (
    <CmsContext.Provider
      value={{
        loading,
        error,
        content: data?.content || {},
        settings: data?.settings || {},
        products,
        projects,
        events,
        getContent,
        getSetting,
        refetch: fetchBootstrap,
        source,
      }}
    >
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  const context = useContext(CmsContext)
  if (!context) {
    throw new Error('useCms debe utilizarse dentro de CmsProvider')
  }
  return context
}
