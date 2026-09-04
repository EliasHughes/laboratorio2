import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { Plus, Search, Pencil, UserX, UserCheck } from 'lucide-react'

const SCREENS = [
  { key: 'dashboard:view', group: 'General', label: 'Panel' },
  { key: 'dashboard:view', group: 'General', label: 'Área de trabajo' },
  { key: 'forms:view', group: 'LIMS', label: 'Formularios Y-FO' },
  { key: 'solutions:view', group: 'LIMS', label: 'Soluciones' },
  { key: 'inventory:view', group: 'LIMS', label: 'Ubicaciones calidad' },
  { key: 'withdrawals:view', group: 'LIMS', label: 'Retiros lab' },
  { key: 'inventory:view', group: 'Inventario', label: 'Productos y lotes' },
  { key: 'receiving:view', group: 'Inventario', label: 'Recepción' },
  { key: 'warehouse:view', group: 'Inventario', label: 'Almacén' },
  { key: 'wms:view', group: 'Inventario', label: 'WMS piso' },
  { key: 'kardex:view', group: 'Inventario', label: 'Kardex' },
  { key: 'ehs:view', group: 'EHS', label: 'Seguridad industrial' },
  { key: 'purchases:view', group: 'Compras', label: 'OC y proveedores' },
  { key: 'reports:view', group: 'Informes', label: 'Reportes' },
  { key: 'users:view', group: 'Sistema', label: 'Usuarios' },
  { key: 'roles:view', group: 'Sistema', label: 'Roles' },
]

const UNIQUE_KEYS = [...new Set(SCREENS.map((s) => s.key))]

export default function UsersPage() {
  const { user: currentUser } = useAuth() as any
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const emptyForm = {
    username: '',
    full_name: '',
    email: '',
    password: '',
    role_id: 0,
    is_active: true,
    position: '',
    supervisor_id: '' as number | '',
    manager_id: '' as number | '',
    signature_data: '',
    screens: [] as string[],
  }

  const [form, setForm] = useState(emptyForm)
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const load = async () => {
    try {
      setApiError('')
      const [u, r] = await Promise.all([api.get('/users'), api.get('/roles')])
      setUsers(Array.isArray(u.data) ? u.data : [])
      setRoles((Array.isArray(r.data) ? r.data : []).map((x: any) => ({ id: x.id, name: x.name })))
    } catch (e: any) {
      setApiError(e?.response?.data?.detail || e?.message || 'No se cargaron usuarios')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return users.filter((u) => `${u.full_name} ${u.username} ${u.email || ''}`.toLowerCase().includes(s))
  }, [users, search])

  const parseScreens = (raw: any): string[] => {
    try {
      const v = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, role_id: roles[0]?.id || 0, screens: [] })
    setError('')
    setModal(true)
    setTimeout(clearPad, 50)
  }

  const openEdit = (u: any) => {
    setEditing(u)
    setForm({
      username: u.username,
      full_name: u.full_name,
      email: u.email || '',
      password: '',
      role_id: u.role_id,
      is_active: u.is_active,
      position: u.position || '',
      supervisor_id: u.supervisor_id || '',
      manager_id: u.manager_id || '',
      signature_data: u.signature_data || '',
      screens: parseScreens(u.extra_screens),
    })
    setError('')
    setModal(true)
    setTimeout(() => {
      clearPad()
      if (u.signature_data?.startsWith('data:image')) {
        const img = new Image()
        img.onload = () => canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0, 360, 120)
        img.src = u.signature_data
      }
    }, 50)
  }

  const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const start = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const move = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = pos(e)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#1A120E'
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const end = () => {
    drawing.current = false
    const data = canvasRef.current?.toDataURL('image/png')
    if (data) set('signature_data', data)
  }
  const clearPad = () => {
    const c = canvasRef.current
    if (!c) return
    c.getContext('2d')?.clearRect(0, 0, c.width, c.height)
  }
  const onFile = (file?: File) => {
    if (!file) return
    const rd = new FileReader()
    rd.onload = () => set('signature_data', String(rd.result))
    rd.readAsDataURL(file)
  }

  const toggleScreen = (key: string) => {
    set(
      'screens',
      form.screens.includes(key) ? form.screens.filter((k) => k !== key) : [...form.screens, key],
    )
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const signature = form.signature_data || form.full_name || form.username
      const body: any = {
        username: form.username,
        full_name: form.full_name,
        email: form.email || null,
        role_id: Number(form.role_id),
        is_active: form.is_active,
        position: form.position || null,
        supervisor_id: form.supervisor_id || null,
        manager_id: form.manager_id || null,
        signature_data: signature,
        extra_screens: JSON.stringify(form.screens),
      }
      if (editing) {
        if (form.password) body.password = form.password
        await api.put(`/users/${editing.id}`, body)
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
        body.password = form.password
        await api.post('/users', body)
      }
      setModal(false)
      load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'No se guardó el usuario')
    } finally {
      setSaving(false)
    }
  }

  const nameOf = (id?: number | null) => users.find((u) => u.id === id)?.full_name || '—'
  const groups = [...new Set(SCREENS.map((s) => s.group))]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">Sistema</p>
          <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Gestión de usuarios</h2>
          <p className="text-sm text-[#5C5046]">Firma, supervisor y pantallas extra por usuario.</p>
        </div>
        <button type="button" onClick={openCreate} className="rounded-full bg-[#DCA54C] px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </button>
      </div>

      {apiError ? <p className="text-sm text-rose-700">{apiError}</p> : null}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8A8076]" />
        <input className="w-full border border-[#C9C2B6] rounded-xl pl-9 pr-3 py-2 text-sm" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-[#E6E2DC] bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3EFE8] text-left text-[10px] uppercase tracking-wide text-[#5C5046]">
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Cargo</th>
              <th className="px-3 py-2">Supervisor</th>
              <th className="px-3 py-2">Gerente</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-[#EFEAE3]">
                <td className="px-3 py-2 font-medium">{u.username}</td>
                <td className="px-3 py-2">{u.full_name}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.position || '—'}</td>
                <td className="px-3 py-2">{nameOf(u.supervisor_id)}</td>
                <td className="px-3 py-2">{nameOf(u.manager_id)}</td>
                <td className="px-3 py-2">{u.is_active ? 'activo' : 'inactivo'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(u)}><Pencil className="w-4 h-4 text-[#8A5A12]" /></button>
                    {u.id !== currentUser?.id ? (
                      <button type="button" onClick={() => api.put(`/users/${u.id}`, { is_active: !u.is_active }).then(load)}>
                        {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-5 space-y-4 my-8">
            <h3 className="text-lg font-semibold">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <label>Nombre
                <input className="mt-1 w-full border rounded-xl px-3 py-2" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
              </label>
              <label>Usuario / email
                <input className="mt-1 w-full border rounded-xl px-3 py-2" value={form.username} onChange={(e) => set('username', e.target.value)} />
              </label>
              <label>Correo
                <input className="mt-1 w-full border rounded-xl px-3 py-2" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </label>
              <label>Contraseña {editing ? '(vacío = no cambia)' : ''}
                <input type="password" className="mt-1 w-full border rounded-xl px-3 py-2" value={form.password} onChange={(e) => set('password', e.target.value)} />
              </label>
              <label>Rol
                <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white" value={form.role_id} onChange={(e) => set('role_id', Number(e.target.value))}>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <label>Cargo
                <input className="mt-1 w-full border rounded-xl px-3 py-2" value={form.position} onChange={(e) => set('position', e.target.value)} />
              </label>
              <label>Supervisor directo
                <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white" value={form.supervisor_id} onChange={(e) => set('supervisor_id', e.target.value ? Number(e.target.value) : '')}>
                  <option value="">— Sin supervisor —</option>
                  {users.filter((u) => u.id !== editing?.id).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </label>
              <label>Gerente / director de área
                <select className="mt-1 w-full border rounded-xl px-3 py-2 bg-white" value={form.manager_id} onChange={(e) => set('manager_id', e.target.value ? Number(e.target.value) : '')}>
                  <option value="">— Sin gerente —</option>
                  {users.filter((u) => u.id !== editing?.id).map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
              </label>
            </div>

            <div>
              <p className="text-xs font-medium mb-1">Firma (dibuja o adjunta). Si no hay, se usa el nombre.</p>
              <canvas ref={canvasRef} width={360} height={120} className="border rounded-xl bg-[#FCFCF9] w-full max-w-md"
                onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} />
              <div className="flex gap-2 mt-2 text-xs">
                <button type="button" className="underline" onClick={() => { clearPad(); set('signature_data', '') }}>Limpiar</button>
                <label className="underline cursor-pointer">Adjuntar imagen
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6E2DC] overflow-hidden">
              <div className="bg-[#F3EFE8] px-3 py-2 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wide text-[#5C5046]">
                  Pantallas visibles ({form.screens.length}/{UNIQUE_KEYS.length})
                </p>
                <div className="flex gap-3 text-[11px]">
                  <button type="button" className="underline" onClick={() => set('screens', UNIQUE_KEYS)}>Seleccionar todo</button>
                  <button type="button" className="underline" onClick={() => set('screens', [])}>Ninguno</button>
                </div>
              </div>
              <div className="p-3 max-h-56 overflow-y-auto space-y-3">
                {groups.map((g) => (
                  <div key={g}>
                    <p className="text-[10px] uppercase tracking-wide text-[#8A8076] mb-1">{g}</p>
                    <div className="grid sm:grid-cols-2 gap-1 text-xs">
                      {SCREENS.filter((s) => s.group === g).map((s) => (
                        <label key={g + s.label} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#DCA54C]"
                            checked={form.screens.includes(s.key)}
                            onChange={() => toggleScreen(s.key)}
                          />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-1.5" onClick={() => setModal(false)}>Cancelar</button>
              <button type="button" className="rounded-full bg-[#DCA54C] px-4 py-1.5 font-semibold" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}