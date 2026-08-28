import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Beaker, Plus, Search, Save, Loader2, X, Trash2, CheckCircle2
} from 'lucide-react'

interface Component {
  component_name: string
  qty_used: number
  unit: string
}

interface Solution {
  id: number
  code: string
  name: string
  formula?: string
  target_volume?: number
  unit: string
  prepared_date?: string
  expiry_date?: string
  status: string
  notes?: string
  prepared_by_name?: string
  components: Component[]
  created_at?: string
}

const emptyForm = {
  code: '',
  name: '',
  formula: '',
  target_volume: '',
  unit: 'mL',
  prepared_date: new Date().toISOString().slice(0, 10),
  expiry_date: '',
  notes: '',
  components: [{ component_name: '', qty_used: '', unit: 'mL' }] as {
    component_name: string
    qty_used: string
    unit: string
  }[],
}

export default function SolutionsPage() {
  const [items, setItems] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<Solution[]>('/solutions')
      setItems(data)
    } catch (err) {
      console.error(err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setError('')
    setSuccess(false)
    setModal(true)
  }

  const addComponent = () => {
    setForm({
      ...form,
      components: [...form.components, { component_name: '', qty_used: '', unit: 'mL' }],
    })
  }

  const updateComponent = (idx: number, field: string, value: string) => {
    const comps = [...form.components]
    comps[idx] = { ...comps[idx], [field]: value }
    setForm({ ...form, components: comps })
  }

  const removeComponent = (idx: number) => {
    setForm({
      ...form,
      components: form.components.filter((_, i) => i !== idx),
    })
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      await api.post('/solutions', {
        code: form.code,
        name: form.name,
        formula: form.formula || null,
        target_volume: form.target_volume ? Number(form.target_volume) : null,
        unit: form.unit,
        prepared_date: form.prepared_date || null,
        expiry_date: form.expiry_date || null,
        notes: form.notes || null,
        components: form.components
          .filter((c) => c.component_name && c.qty_used)
          .map((c) => ({
            component_name: c.component_name,
            qty_used: Number(c.qty_used),
            unit: c.unit,
          })),
      })
      setSuccess(true)
      setModal(false)
      load()
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta solución?')) return
    try {
      await api.delete(`/solutions/${id}`)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = items.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor: Record<string, string> = {
    preparada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    en_uso: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    agotada: 'bg-stone-500/15 text-stone-400 border-stone-500/30',
    descartada: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
            <Beaker className="w-5 h-5 text-yazoo-gold" />
            Soluciones Internas
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            Preparación y registro de soluciones de laboratorio
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm hover:bg-amber-400"
        >
          <Plus className="w-4 h-4" />
          Nueva solución
        </button>
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Solución registrada
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código o nombre..."
          className="w-full pl-10 pr-4 py-2.5 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100 focus:outline-none focus:border-yazoo-gold"
        />
      </div>

      <div className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">No hay soluciones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-caribe-border text-left text-xs text-stone-400 uppercase">
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Volumen</th>
                  <th className="px-5 py-3">Preparación</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Responsable</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-caribe-border/50 hover:bg-caribe-hover/40">
                    <td className="px-5 py-3 font-mono text-xs text-yazoo-gold">{s.code}</td>
                    <td className="px-5 py-3 text-stone-100">{s.name}</td>
                    <td className="px-5 py-3 text-stone-300">
                      {s.target_volume != null ? `${s.target_volume} ${s.unit}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-stone-400 text-xs">
                      {s.prepared_date
                        ? new Date(s.prepared_date).toLocaleDateString('es-DO')
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                          statusColor[s.status] || statusColor.preparada
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-400 text-xs">{s.prepared_by_name || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg hover:bg-caribe-hover text-stone-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-caribe-card border border-caribe-border rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-caribe-border sticky top-0 bg-caribe-card">
              <h3 className="text-lg font-semibold text-stone-100">Nueva solución</h3>
              <button onClick={() => setModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1 uppercase">Código *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1 uppercase">Nombre *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1 uppercase">Fórmula / Método</label>
                <textarea
                  value={form.formula}
                  onChange={(e) => setForm({ ...form, formula: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1 uppercase">Volumen</label>
                  <input
                    type="number"
                    value={form.target_volume}
                    onChange={(e) => setForm({ ...form, target_volume: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1 uppercase">Unidad</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1 uppercase">Fecha prep.</label>
                  <input
                    type="date"
                    value={form.prepared_date}
                    onChange={(e) => setForm({ ...form, prepared_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-stone-400 uppercase font-semibold">Componentes</label>
                  <button type="button" onClick={addComponent} className="text-xs text-yazoo-gold hover:underline">
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {form.components.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder="Nombre"
                        value={c.component_name}
                        onChange={(e) => updateComponent(idx, 'component_name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                      />
                      <input
                        type="number"
                        placeholder="Cant."
                        value={c.qty_used}
                        onChange={(e) => updateComponent(idx, 'qty_used', e.target.value)}
                        className="w-20 px-2 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                      />
                      <input
                        value={c.unit}
                        onChange={(e) => updateComponent(idx, 'unit', e.target.value)}
                        className="w-16 px-2 py-2 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                      />
                      {form.components.length > 1 && (
                        <button type="button" onClick={() => removeComponent(idx)} className="text-stone-500 hover:text-rose-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1 uppercase">Notas</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-caribe-border">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-stone-400">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code || !form.name}
                className="flex items-center gap-2 px-5 py-2 bg-yazoo-gold text-caribe-dark font-semibold rounded-lg text-sm disabled:opacity-60"
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