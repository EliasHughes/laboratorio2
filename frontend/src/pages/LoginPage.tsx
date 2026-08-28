import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    try {
      const body = new URLSearchParams()
      body.set('username', username.trim())
      body.set('password', password)

      const { data } = await api.post('/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      if (!data?.access_token) {
        setError('No se recibió token del servidor')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }

      login(data.access_token, data.user)
      navigate('/', { replace: true })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Usuario o contraseña incorrectos')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120c08] flex items-center justify-center px-4">
      {/* Fondo bodega */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c1810] via-[#120c08] to-[#0a0705]" />
        <div className="yazoo-sun absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-40" />
        <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-amber-700/15 blur-3xl animate-glow" />
        <div className="absolute bottom-[10%] right-[8%] w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-glow-delay" />

        {/* Barricas realistas */}
        <div className="absolute left-[4%] top-[12%] opacity-30 animate-barrel-1">
          <RealisticBarrel className="w-36 h-44" />
        </div>
        <div className="absolute right-[5%] top-[18%] opacity-25 animate-barrel-2">
          <RealisticBarrel className="w-44 h-52" />
        </div>
        <div className="absolute left-[8%] bottom-[8%] opacity-22 animate-barrel-3">
          <RealisticBarrel className="w-32 h-40" />
        </div>
        <div className="absolute right-[12%] bottom-[10%] opacity-28 animate-barrel-4">
          <RealisticBarrel className="w-40 h-48" />
        </div>

        {/* Botellas */}
        <div className="absolute left-[22%] top-[30%] opacity-20 animate-bottle-1">
          <RealisticBottle className="w-14 h-36" />
        </div>
        <div className="absolute right-[22%] top-[28%] opacity-18 animate-bottle-2">
          <RealisticBottle className="w-12 h-32" />
        </div>
        <div className="absolute left-[18%] bottom-[22%] opacity-16 animate-bottle-3">
          <RealisticBottle className="w-11 h-30" />
        </div>
      </div>

      <div className={`relative z-10 w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-amber-400/25 blur-2xl rounded-full scale-150" />
            <img
              src="/logo.png"
              alt="Yazoo"
              className="relative h-24 w-auto drop-shadow-2xl"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-wide text-center">
            RONES Y BEBIDAS DEL CARIBE YAZOO
          </h1>
          <p className="text-sm text-stone-400 mt-2 text-center">
            Control de Inventario de Laboratorio
          </p>
          <p className="text-[11px] text-stone-600 mt-1">San Pedro de Macorís · RD</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-fade-up bg-black/45 backdrop-blur-xl border border-amber-900/50 rounded-2xl p-8 shadow-2xl shadow-black/60"
          style={{ animationDelay: '0.12s' }}
        >
          <h2 className="text-lg font-semibold text-stone-100 text-center mb-6">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="login-user"
                className="block text-xs text-stone-400 mb-1.5 uppercase tracking-wide"
              >
                Usuario o correo
              </label>
              <input
                id="login-user"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a120c] border border-amber-900/50 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
                placeholder="admin · Minerva · correo@"
                required
              />
            </div>
            <div>
              <label
                htmlFor="login-pass"
                className="block text-xs text-stone-400 mb-1.5 uppercase tracking-wide"
              >
                Contraseña
              </label>
              <input
                id="login-pass"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a120c] border border-amber-900/50 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-500 text-[#1a120c] font-semibold text-sm hover:bg-amber-400 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-600 mt-6">
          © {new Date().getFullYear()} Rones y Bebidas del Caribe Yazoo
        </p>
      </div>
    </div>
  )
}

/** Barrica de roble más realista (duelas, aros de hierro, tapa) */
function RealisticBarrel({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5c3310" />
          <stop offset="35%" stopColor="#8B5A2B" />
          <stop offset="50%" stopColor="#A67B5B" />
          <stop offset="65%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#4a2c0a" />
        </linearGradient>
        <linearGradient id="iron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b6b6b" />
          <stop offset="50%" stopColor="#3d3d3d" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      {/* Cuerpo */}
      <ellipse cx="40" cy="14" rx="28" ry="10" fill="#6B3E1A" />
      <path
        d="M12 14 C12 14 10 50 12 78 C14 90 28 96 40 96 C52 96 66 90 68 78 C70 50 68 14 68 14 Z"
        fill="url(#wood)"
      />
      <ellipse cx="40" cy="78" rx="28" ry="10" fill="#3d2410" opacity="0.9" />
      {/* Duelas */}
      <path d="M22 16 L20 78" stroke="#3d2410" strokeWidth="1.2" opacity="0.45" fill="none" />
      <path d="M30 12 L30 90" stroke="#3d2410" strokeWidth="1.2" opacity="0.35" fill="none" />
      <path d="M40 10 L40 96" stroke="#3d2410" strokeWidth="1.2" opacity="0.3" fill="none" />
      <path d="M50 12 L50 90" stroke="#3d2410" strokeWidth="1.2" opacity="0.35" fill="none" />
      <path d="M58 16 L60 78" stroke="#3d2410" strokeWidth="1.2" opacity="0.45" fill="none" />
      {/* Aros de hierro */}
      <ellipse cx="40" cy="28" rx="29" ry="7" fill="none" stroke="url(#iron)" strokeWidth="3.5" />
      <ellipse cx="40" cy="50" rx="30" ry="7" fill="none" stroke="url(#iron)" strokeWidth="3.5" />
      <ellipse cx="40" cy="70" rx="29" ry="7" fill="none" stroke="url(#iron)" strokeWidth="3.5" />
      {/* Brillo */}
      <path d="M24 20 C26 40 26 60 24 76" stroke="#c4a574" strokeWidth="2" opacity="0.25" fill="none" />
    </svg>
  )
}

/** Botella de ron más realista */
function RealisticBottle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 110" className={className} aria-hidden>
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3d2914" />
          <stop offset="40%" stopColor="#8B4513" />
          <stop offset="60%" stopColor="#A0522D" />
          <stop offset="100%" stopColor="#2a1a0c" />
        </linearGradient>
        <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2691E" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#8B4513" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* Cuello */}
      <rect x="15" y="2" width="10" height="18" rx="1.5" fill="#5c4030" />
      <rect x="14" y="0" width="12" height="5" rx="1" fill="#2a1810" />
      {/* Hombros */}
      <path d="M15 20 L10 32 L30 32 L25 20 Z" fill="url(#glass)" />
      {/* Cuerpo */}
      <path
        d="M10 32 L8 95 C8 102 14 108 20 108 C26 108 32 102 32 95 L30 32 Z"
        fill="url(#glass)"
      />
      {/* Líquido */}
      <path
        d="M11 48 L9 94 C9 100 14 105 20 105 C26 105 31 100 31 94 L29 48 Z"
        fill="url(#liquid)"
        opacity="0.75"
      />
      {/* Brillo */}
      <path d="M13 34 L12 90" stroke="#f5deb3" strokeWidth="2" opacity="0.2" fill="none" />
      {/* Etiqueta */}
      <rect x="12" y="55" width="16" height="18" rx="1" fill="#1a120c" opacity="0.7" />
      <rect x="13" y="57" width="14" height="3" rx="0.5" fill="#c9a227" opacity="0.8" />
    </svg>
  )
}