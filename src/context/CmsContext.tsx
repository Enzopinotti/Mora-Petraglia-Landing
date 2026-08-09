import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { cmsApi } from '../cms/api'
import type { CmsBootstrap, CmsContent, CmsSettings, EventItem, Product, Project } from '../cms/types'
import { EXHIBITIONS, FEATURED_ARTWORK, MURALS, PRODUCTS, SOCIAL_LINKS } from '../data/landing'

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
  refetch: () => Promise<void>
}

const CmsContext = createContext<CmsContextType | null>(null)

export function CmsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CmsBootstrap>({})

  const fetchBootstrap = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await cmsApi.getBootstrap()
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.error || 'No se pudieron obtener datos del CMS.')
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión con el CMS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBootstrap()
  }, [])

  const getContent = (key: string, fallback: string = ''): string => {
    if (data.content && data.content[key]) {
      return data.content[key]
    }
    return fallback
  }

  const getSetting = (key: string, fallback: any = null): any => {
    if (data.settings && data.settings[key] !== undefined) {
      return data.settings[key]
    }
    return fallback
  }

  // Fallback mappings if CMS list is empty or API failed
  const products: Product[] =
    data.products && data.products.length > 0
      ? data.products.filter((p) => p.status === 'published' || !p.status)
      : PRODUCTS.map((p, idx) => ({
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

  const projects: Project[] =
    data.projects && data.projects.length > 0
      ? data.projects.filter((pr) => pr.status === 'published' || !pr.status)
      : MURALS.map((m, idx) => ({
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

  const events: EventItem[] =
    data.events && data.events.length > 0
      ? data.events.filter((e) => e.status === 'published' || !e.status)
      : EXHIBITIONS.map((ex, idx) => ({
          id: `fallback-e-${idx}`,
          title: ex.title,
          subtype: 'exhibition',
          short_description: ex.text,
          date_label: ex.date,
          status: 'published',
          image: ex.image,
          sort_order: idx,
        }))

  return (
    <CmsContext.Provider
      value={{
        loading,
        error,
        content: data.content || {},
        settings: data.settings || {},
        products,
        projects,
        events,
        getContent,
        getSetting,
        refetch: fetchBootstrap,
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
