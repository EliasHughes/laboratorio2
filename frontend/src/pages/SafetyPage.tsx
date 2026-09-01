import { FormEvent, useEffect, useState } from 'react'
import api from '../services/api'

export default function SafetyPage() {
  const [rows, setRows] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('Laboratorio')
  const [severity, setSeverity] = useState('media')
  const [lot, setLot] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    setErr('')
    try {
      const res = await api.get('/incidents')
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Sin permiso o API no montada')
      setRows([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/incidents', {
      title,
      area,
      severity,
      lot_number: lot || null,
      description,
    })
    setTitle('')
    setDescription('')
    setLot('')
    await load()
  }

  const closeIt = async (r: any) => {
    await api.put(`/incidents/${r.id}`, { ...r, status: 'cerrado', title: r.title })
    await load()
  }

  return (
    <div className="space-y-5 text-[#1A120E]">
      <div>
        <h2 className="text-xl font-semibold">Seguridad industrial</h2>
        <p className="text-sm text-stone-500">Incidentes y casi-accidentes · Fase 5.1</p>
      </div>
      {err ? <p className="text-red-700 text-sm">{err}</p> : null}

      <form onSubmit={save} className="rounded-xl border border-[#E6E2DC] bg-white p-4 grid sm:grid-cols-2 gap-3">
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Área" value={area} onChange={(e) => setArea(e.target.value)} />
        <select className="border rounded-lg px-3 py-2 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="baja">baja</option>
          <option value="media">media</option>
          <option value="alta">alta</option>
        </select>
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Lote (opcional)" value={lot} onChange={(e) => setLot(e.target.value)} />
        <textarea className="border rounded-lg px-3 py-2 text-sm sm:col-span-2" rows={3} placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="bg-[#DCA54C] px-4 py-2 rounded-full font-semibold sm:col-span-2">Registrar incidente</button>
      </form>

      <div className="rounded-xl border border-[#E6E2DC] bg-white divide-y">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">Sin incidentes</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="px-4 py-3 flex justify-between gap-3 text-sm">
              <span>
                {r.title} · {r.area || '—'} · {r.severity} · {r.status} · lote {r.lot_number || '—'}
              </span>
              {r.status !== 'cerrado' && (
                <button type="button" className="text-[#8A5A12]" onClick={() => closeIt(r)}>
                  Cerrar
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}