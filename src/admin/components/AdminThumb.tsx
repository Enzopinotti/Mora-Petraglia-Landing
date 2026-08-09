import { useState } from 'react'

interface AdminThumbProps {
  src?: string
  alt: string
}

export function AdminThumb({ src, alt }: AdminThumbProps) {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className="thumb"
        onError={() => setHasError(true)}
      />
    )
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
