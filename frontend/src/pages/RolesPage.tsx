import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, Shield, X, Save, Loader2, Check } from 'lucide-react'

interface Permission {
  id: number
  code: string
  module: string
  action: string
  description?: string
}

interface Role {
  id: number
  name: string
  description?: string
  is_system: boolean
  is_active: boolean
  permissions: Permission[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
    permission_ids: [] as number[],
  })

  const load = async () => {
    try {
      setLoading(true)
      const [rolesRes, permsRes] = await Promise.all([
        api.get<Role[]>('/roles'),
        api.get<Permission[]>('/roles/permissions'),
      ])
      setRoles(rolesRes.data)
      setPermissions(permsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', is_active: true, permission_ids: [] })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditing(role)
    setForm({
      name: role.name,
      description: role.description || '',
      is_active: role.is_active,
      permission_ids: role.permissions.map((p) => p.id),
    })
    setError('')
    setModalOpen(true)
  }

  const togglePerm = (id: number) => {
    setForm((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(id)
        ? prev.permission_ids.filter((x) => x !== id)
        : [...prev.permission_ids, id],
    }))
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/roles/${editing.id}`, form)
      } else {
        await api.post('/roles', form)
      }
      setModalOpen(false)
      load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (role.is_system) return
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return
    try {
      await api.delete(`/roles/${role.id}`)
      load()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'No se pudo eliminar')
    }
  }

  // Agrupar permisos por módulo
  const permsByModule = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module].push(p)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-50">Roles y Permisos</h2>
          <p className="text-sm text-stone-400">Administración dinámica de roles del sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm hover:bg-amber-400 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Rol
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500">Cargando...</div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-caribe-border bg-caribe-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-yazoo-gold" />
                  <h3 className="font-semibold text-stone-100 capitalize">{role.name}</h3>
                  {role.is_system && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">Sistema</span>
                  )}
                  {!role.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300">Inactivo</span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mb-2">{role.description || 'Sin descripción'}</p>
                <p className="text-xs text-stone-500">
                  {role.permissions.length} permisos asignados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(role)}
                  className="p-2 rounded-lg hover:bg-caribe-hover text-stone-400 hover:text-yazoo-gold transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="p-2 rounded-lg hover:bg-caribe-hover text-stone-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-caribe-card border border-caribe-border rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-caribe-border sticky top-0 bg-caribe-card z-10">
              <h3 className="text-lg font-semibold text-stone-100">
                {editing ? `Editar rol: ${editing.name}` : 'Nuevo Rol'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-caribe-hover text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Nombre del rol</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={editing?.is_system}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold disabled:opacity-50"
                    placeholder="ej: supervisor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1.5 uppercase">Descripción</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-400 mb-3 uppercase">Permisos</p>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {Object.entries(permsByModule).map(([module, perms]) => (
                    <div key={module} className="border border-caribe-border rounded-lg p-3">
                      <p className="text-xs font-bold text-yazoo-gold uppercase mb-2">{module}</p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => {
                          const checked = form.permission_ids.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => togglePerm(p.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition ${
                                checked
                                  ? 'bg-yazoo-gold/20 border-yazoo-gold text-yazoo-gold'
                                  : 'bg-caribe-dark border-caribe-border text-stone-400 hover:border-stone-500'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3" />}
                              {p.action}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-caribe-border sticky bottom-0 bg-caribe-card">
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