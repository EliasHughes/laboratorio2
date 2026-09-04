import { useEffect, useState } from 'react'
import api from '../services/api'
import { printRecord } from './FormsPage'

export default function ApprovalsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')

  const load = async () => {
    setErr('')
    try {
      const { data } = await api.get('/approvals/inbox')
      setRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se cargó la bandeja')
    }
  }

  useEffect(() => { load() }, [])

  const decide = async (id: number, action: 'approve' | 'reject') => {
    await api.post(`/approvals/${id}/decide`, { action, note })
    setNote('')
    load()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">Calidad</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Aprobaciones pendientes</h2>
        <p className="text-sm text-[#5C5046]">Formularios que esperan tu firma de supervisor o gerente.</p>
      </div>
      {err ? <p className="text-sm text-rose-700">{err}</p> : null}
      <textarea className="w-full max-w-xl border rounded-xl px-3 py-2 text-sm" placeholder="Nota al aprobar / rechazar (opcional)"
        value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="rounded-2xl border border-[#E6E2DC] bg-white overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3EFE8] text-left text-[10px] uppercase tracking-wide text-[#5C5046]">
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Autor</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="px-3 py-8 text-center text-[#8A8076]" colSpan={5}>Nada pendiente</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-[#EFEAE3]">
                <td className="px-3 py-2 whitespace-nowrap">{r.form_code || r.id}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.created_by_name}</td>
                <td className="px-3 py-2 flex flex-wrap gap-2">
                  <button type="button" className="text-xs underline" onClick={() => printRecord(r)}>Ver / imprimir</button>
                  <button type="button" className="text-xs font-semibold text-emerald-800" onClick={() => decide(r.id, 'approve')}>Aprobar</button>
                  <button type="button" className="text-xs font-semibold text-rose-800" onClick={() => decide(r.id, 'reject')}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}