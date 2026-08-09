/**
 * Renders an image thumbnail for the admin panel.
 * If src is empty/falsy, shows a neutral placeholder square instead of
 * a broken image request.
 */
interface AdminThumbProps {
  src?: string
  alt: string
}

export function AdminThumb({ src, alt }: AdminThumbProps) {
  if (src) {
    return <img src={src} alt={alt} className="thumb" />
  }
  return (
    <div
      className="thumb"
      style={{
        background: '#f0ebe4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#b0a599',
        fontSize: '1.2rem',
      }}
      aria-label="Sin imagen"
      title="Sin imagen"
    >
      🖼
    </div>
  )
}
