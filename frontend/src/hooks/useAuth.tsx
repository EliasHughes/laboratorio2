import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import api from '../services/api'

export type AuthUser = {
  id: number
  username: string
  full_name?: string
  email?: string
  role?: string
  role_id?: number
  is_active?: boolean
  permissions?: string[]
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user?: AuthUser) => void
  logout: () => void
  can: (code: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [loading, setLoading] = useState(true)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const login = (newToken: string, newUser?: AuthUser) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
    }
  }

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          setLoading(false)
        }
        return
      }

      setToken(storedToken)

      try {
        const { data } = await api.get('/auth/me')
        if (!cancelled) {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch {
        // Si /me falla, mantenemos user de localStorage si existe
        const cached = readStoredUser()
        if (!cached) {
          if (!cancelled) logout()
        } else if (!cancelled) {
          setUser(cached)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

    const can = (perm: string) => {
    const raw: any = user?.role
    const roleName = String(raw?.name || raw || '').toLowerCase()
    if (roleName.includes('admin')) return true
    return (user?.permissions || []).includes(perm)
  }
  
  return (
    <AuthContext.Provider
      value={{
          user,
          token,
          loading,
          isLoading: loading,
          isAuthenticated: Boolean(token),
          login,
          logout,
          can,
        }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}