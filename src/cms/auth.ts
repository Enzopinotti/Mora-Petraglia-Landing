import type { AdminSession } from './types'

const SESSION_KEY = 'mora_admin_session'

export const cmsAuth = {
  getToken(): string | null {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (!stored) return null
      const session: AdminSession = JSON.parse(stored)
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.logout()
        return null
      }
      return session.token
    } catch {
      return null
    }
  },

  setSession(token: string, expiresAt?: number, user?: string): void {
    const session: AdminSession = { token, expiresAt, user }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY)
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken())
  },
}
