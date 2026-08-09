import { useState } from 'react'

interface AdminToastProps {
  message: string | null
  type?: 'info' | 'success' | 'error'
  onClose?: () => void
}

export function AdminToast({ message, type = 'info' }: AdminToastProps) {
  if (!message) return null

  return (
    <div className={`admin-toast admin-toast--${type}`}>
      <span>{message}</span>
    </div>
  )
}

interface AdminModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function AdminModal({ isOpen, title, onClose, children }: AdminModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(24, 22, 21, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #ded5cc',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#746b64' }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AdminLoader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#746b64' }}>
      <p style={{ fontSize: '1.1rem', margin: 0 }}>{text}</p>
    </div>
  )
}

export function AdminEmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', border: '1px solid #ded5cc' }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', margin: '0 0 0.5rem 0', color: '#181615' }}>{title}</h3>
      <p style={{ color: '#746b64', margin: '0 0 1.5rem 0' }}>{description}</p>
      {actionLabel && onAction && (
        <button className="btn-primary-admin" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
