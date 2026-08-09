import { useState, type FormEvent } from 'react'
import { cmsApi } from '../cms/api'
import { cmsAuth } from '../cms/auth'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await cmsApi.login(password)
      if (response.success && response.data?.token) {
        cmsAuth.setSession(response.data.token, response.data.expiresAt, response.data.user)
        onLoginSuccess()
      } else {
        setError(response.error || 'Contraseña incorrecta o sesión inválida.')
      }
    } catch {
      setError('No se pudo establecer conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <h1>Mora Petraglia</h1>
          <p>Administración</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#ffebee', color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-pass">Contraseña</label>
            <input
              id="admin-pass"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
