const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ID_PATTERN = /^med_[A-Za-z0-9_-]+$/
const UPSTREAM_TIMEOUT_MS = 15_000

function jsonError(message: string, status: number): Response {
  return Response.json(
    { success: false, error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}

export async function GET(request: Request): Promise<Response> {
  // --- Validar parámetro id ---
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id || !ID_PATTERN.test(id)) {
    return jsonError('El ID de la imagen es obligatorio y debe ser válido (med_xxx).', 400)
  }

  // --- Validar env ---
  const cmsUrl = process.env.MORA_CMS_URL
  if (!cmsUrl) {
    return jsonError('La variable de entorno MORA_CMS_URL no está configurada.', 500)
  }

  try {
    // --- Construir URL upstream ---
    const targetUrl = new URL(cmsUrl)
    targetUrl.searchParams.set('action', 'media')
    targetUrl.searchParams.set('id', id)

    // --- Fetch con timeout ---
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

    let upstreamRes: globalThis.Response
    try {
      upstreamRes = await fetch(targetUrl.toString(), { signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }

    if (!upstreamRes.ok) {
      return jsonError(`Upstream HTTP error: ${upstreamRes.status}`, 502)
    }

    const payload = await upstreamRes.json()

    if (!payload.success || !payload.data?.base64) {
      return jsonError(
        payload.error || 'No se encontró la imagen solicitada o el archivo está vacío.',
        404
      )
    }

    // --- Validar MIME ---
    const { mimeType, base64 } = payload.data
    if (!ALLOWED_MIMES.has(mimeType)) {
      return jsonError('Formato de imagen no permitido o MIME inválido.', 400)
    }

    // --- Decodificar y validar tamaño ---
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length === 0) {
      return jsonError('La imagen decodificada no contiene bytes válidos.', 400)
    }

    // --- Responder con la imagen ---
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buffer.length),
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: any) {
    const message =
      error?.name === 'AbortError'
        ? 'Timeout al conectar con el backend de imágenes.'
        : error?.message || 'Error interno del servidor al procesar la imagen.'
    console.error(`[Media Proxy] id=${id}: ${message}`)
    return jsonError(message, 500)
  }
}
