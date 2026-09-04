import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

function unwrap(p: any): any[] {
  if (Array.isArray(p)) return p
  if (Array.isArray(p?.data)) return p.data
  if (Array.isArray(p?.items)) return p.items
  return []
}

function isLab(loc: string) {
  const s = (loc || '').toLowerCase()
  return s.includes('lab') || s.includes('laboratorio') || s.includes('calidad')
}

function expiryOf(r: any) {
  return String(r.expiration_date || r.expiry_date || '').slice(0, 10)
}

function tone(r: any) {
  const qty = Number(r.current_qty ?? r.qty ?? 0)
  const min = Number(r.min_qty ?? 0)
  const exp = expiryOf(r)
  const today = new Date().toISOString().slice(0, 10)
  if (exp && exp < today) return { cls: 'bg-rose-200 text-rose-900', label: 'vencido' }
  if (min > 0 && qty <= min) return { cls: 'bg-rose-200 text-rose-900', label: 'mínimo' }
  if (exp) {
    const d = (new Date(exp).getTime() - Date.now()) / 86400000
    if (d <= 30) return { cls: 'bg-amber-200 text-amber-900', label: 'por vencer' }
  }
  const ini = Number(r.initial_qty ?? qty || 1)
  if (ini && qty / ini <= 0.3) return { cls: 'bg-amber-200 text-amber-900', label: 'bajo' }
  return { cls: 'bg-lime-200 text-lime-900', label: 'ok' }
}

export default function LabStockPage() {
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<any>(null)
  const [form, setForm] = useState({ current_qty: '', min_qty: '', expiration_date: '', notes: '' })
  const [msg, setMsg] = useState('')

  const load = () =>
    api.get('/lots').then(({ data }) => setRows(unwrap(data))).catch(() => setRows([]))

  useEffect(() => { load() }, [])

  const lab = useMemo(() => {
    const s = q.toLowerCase()
    return rows.filter((r) => isLab(r.location || '')).filter((r) =>
      `${r.lot_number} ${r.product_name || ''}`.toLowerCase().includes(s),
    )
  }, [rows, q])

  const alerts = lab.filter((r) => ['vencido', 'mínimo', 'por vencer', 'bajo'].includes(tone(r).label))

  const open = (r: any) => {
    setEdit(r)
    setForm({
      current_qty: String(r.current_qty ?? ''),
      min_qty: String(r.min_qty ?? ''),
      expiration_date: expiryOf(r),
      notes: r.notes || '',
    })
    setMsg('')
  }

  const save = async () => {
    if (!edit) return
    try {
      await api.put(`/lots/${edit.id}/lab`, {
        current_qty: form.current_qty === '' ? null : Number(form.current_qty),
        min_qty: form.min_qty === '' ? null : Number(form.min_qty),
        expiration_date: form.expiration_date || null,
        notes: form.notes || 'Ajuste almacén laboratorio',
      })
      setEdit(null)
      load()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'No se guardó el ajuste')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">LIMS</p>
        <h2 className="text-2xl font-semibold">Almacén de laboratorio</h2>
        <p className="text-sm text-[#5C5046]">Ajustes locales. Quedan en kardex como movimiento tipo ajuste.</p>
      </div>

      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {alerts.length} ítem(s) en mínimo, bajos o por vencer. Revisa la columna Estado.
        </div>
      )}

      <input className="border rounded-xl px-3 py-2 text-sm max-w-md" placeholder="Buscar lote / reactivo"
        value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="rounded-2xl border bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3EFE8] text-left text-[10px] uppercase text-[#5C5046]">
              <th className="px-3 py-2">Lote</th>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Vence</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Mínimo</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lab.map((r) => {
              const t = tone(r)
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.lot_number}</td>
                  <td className="px-3 py-2">{r.product_name || '—'}</td>
                  <td className="px-3 py-2">{r.location}</td>
                  <td className="px-3 py-2">{expiryOf(r) || '—'}</td>
                  <td className="px-3 py-2">{r.current_qty}</td>
                  <td className="px-3 py-2">{r.min_qty ?? '—'}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[11px] ${t.cls}`}>{t.label}</span></td>
                  <td className="px-3 py-2">
                    <button type="button" className="text-xs font-semibold underline text-[#8A5A12]" onClick={() => open(r)}>Editar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-semibold">Ajuste {edit.lot_number}</h3>
            {msg ? <p className="text-sm text-rose-700">{msg}</p> : null}
            <label className="text-sm block">Cantidad actual
              <input type="number" className="mt-1 w-full border rounded-xl px-3 py-2" value={form.current_qty}
                onChange={(e) => setForm({ ...form, current_qty: e.target.value })} />
            </label>
            <label className="text-sm block">Cantidad mínima (alerta)
              <input type="number" className="mt-1 w-full border rounded-xl px-3 py-2" value={form.min_qty}
                onChange={(e) => setForm({ ...form, min_qty: e.target.value })} />
            </label>
            <label className="text-sm block">Vencimiento
              <input type="date" className="mt-1 w-full border rounded-xl px-3 py-2" value={form.expiration_date}
                onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} />
            </label>
            <label className="text-sm block">Nota (kardex)
              <input className="mt-1 w-full border rounded-xl px-3 py-2" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-full border px-4 py-1.5" onClick={() => setEdit(null)}>Cancelar</button>
              <button type="button" className="rounded-full bg-[#DCA54C] px-4 py-1.5 font-semibold" onClick={save}>Guardar ajuste</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}