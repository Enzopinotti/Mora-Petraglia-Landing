import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ success: false, error: 'Método no permitido. Solo GET es aceptado.' })
  }

  const { id } = req.query
  if (!id || typeof id !== 'string' || !id.startsWith('med_')) {
    return res.status(400).json({ success: false, error: 'El ID de la imagen es obligatorio y debe ser válido.' })
  }

  const cmsUrl = process.env.MORA_CMS_URL
  if (!cmsUrl) {
    return res.status(500).json({ success: false, error: 'La variable de entorno MORA_CMS_URL no está configurada.' })
  }

  try {
    const targetUrl = new URL(cmsUrl)
    targetUrl.searchParams.set('action', 'media')
    targetUrl.searchParams.set('id', id)

    const response = await fetch(targetUrl.toString())
    if (!response.ok) {
      throw new Error(`Upstream HTTP error! status: ${response.status}`)
    }

    const payload = await response.json()
    if (!payload.success || !payload.data || !payload.data.base64) {
      return res.status(404).json({ success: false, error: payload.error || 'No se encontró la imagen solicitada o el archivo está vacío.' })
    }

    const { mimeType, base64 } = payload.data
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimes.includes(mimeType)) {
      return res.status(400).json({ success: false, error: 'Formato de imagen no permitido o MIME inválido.' })
    }

    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'La imagen decodificada no contiene bytes válidos.' })
    }

    // Cabeceras de caché e inline image
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Content-Disposition', 'inline')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=86400')

    return res.status(200).send(buffer)
  } catch (error: any) {
    console.error(`[Vercel Media Proxy Error] id: ${id}:`, error)
    return res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor al procesar la imagen.' })
  }
}
