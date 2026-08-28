import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import {
  Plus, Search, Edit2, UserX, UserCheck, Shield, X, Save, Loader2
} from 'lucide-react'

interface User {
  id: number
  username: string
  full_name: string
  email?: string
  role_id: number
  role: string
  is_active: boolean
  created_at: string
}

interface RoleOption {
  id: number
  name: string
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')

  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role_id: 0,
    is_active: true,
  })

  const loadUsers = async () => {
    try {
      setLoading(true)
      setApiError('')
      const { data } = await api.get<User[]>('/users')
      setUsers(data)
    } catch (err: any) {
      console.error(err)
      setApiError(err.response?.data?.detail || err.message || 'Error al cargar usuarios')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const { data } = await api.get('/roles')
      setRoles(data.map((r: any) => ({ id: r.id, name: r.name })))
    } catch (err) {
      console.error('No se pudieron cargar los roles', err)
    }
  }

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      username: '',
      full_name: '',
      email: '',
      password: '',
      role_id: roles[0]?.id || 0,
      is_active: true,
    })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({
      username: u.username,
      full_name: u.full_name,
      email: u.email || '',
      password: '',
      role_id: u.role_id,
      is_active: u.is_active,
    })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      if (editing) {
        const payload: any = {
          full_name: form.full_name,
          email: form.email || null,
          role_id: form.role_id,
          is_active: form.is_active,
        }
        if (form.password) payload.password = form.password
        await api.put(`/users/${editing.id}`, payload)
      } else {
        if (!form.password || form.password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres')
          setSaving(false)
          return
        }
        if (!form.role_id) {
          setError('Debes seleccionar un rol')
          setSaving(false)
          return
        }
        await api.post('/users', form)
      }
      setModalOpen(false)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (u: User) => {
    if (u.id === currentUser?.id) return
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active })
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-50">Usuarios y Roles</h2>
          <p className="text-sm text-stone-400">Gestión de personal y permisos del sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm hover:bg-amber-400 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          {apiError}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
        />
      </div>

      <div className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">No se encontraron usuarios</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-caribe-border text-left text-xs text-stone-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Creado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-caribe-border/50 hover:bg-caribe-hover/50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-stone-100">{u.full_name}</p>
                      <p className="text-xs text-stone-500">@{u.username}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-sky-500/20 text-sky-300 border-sky-500/30">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        u.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-stone-500/15 text-stone-400'
                      }`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-caribe-hover text-stone-400 hover:text-yazoo-gold transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => toggleActive(u)}
                            className="p-1.5 rounded-lg hover:bg-caribe-hover text-stone-400 hover:text-rose-400 transition"
                            title={u.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-caribe-card border border-caribe-border rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-caribe-border">
              <h3 className="text-lg font-semibold text-stone-100">
                {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-caribe-hover text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              {!editing && (
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Usuario</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                    placeholder="nombre.usuario"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Nombre completo</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">
                  {editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Rol</label>
                <select
                  value={form.role_id || ''}
                  onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {editing && (
                <label className="flex items-center gap-2 text-sm text-stone-300">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-caribe-border"
                  />
                  Usuario activo
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-caribe-border">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}