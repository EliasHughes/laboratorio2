import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ClipboardCheck, FileWarning, GraduationCap, Shield, Siren } from 'lucide-react'
import api from '../services/api'
import EvidenceBox from './EvidenceBox'

const TABS = [
  { id: 'tablero', label: 'Siniestralidad', icon: Shield },
  { id: 'incidentes', label: 'Incidentes', icon: Siren },
  { id: 'inspecciones', label: 'Inspecciones', icon: ClipboardCheck },
  { id: 'permisos', label: 'Permisos', icon: AlertTriangle },
  { id: 'capacitacion', label: 'Capacitación', icon: GraduationCap },
  { id: 'ncr', label: 'NCR', icon: FileWarning },
]

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const AREAS = ['Laboratorio', 'Almacén', 'Envasado', 'Añejamiento', 'Recepción', 'Patio']

const INSP = [
  { code: 'Y-FO-BI-018', title: 'Inspección de las instalaciones', hint: 'Fotos en el formulario oficial' },
  { code: 'Y-FO-CC-038', title: 'Isotanques, cisternas y contenedores', hint: 'Fotos en el formulario oficial' },
  { code: 'Y-FO-SI-004', title: 'Contenedores, isotanque y chasis', hint: 'Fotos en el formulario oficial' },
]

function unwrap(d: any) {
  return Array.isArray(d) ? d : []
}

function EhsPhotos({ kind, id }: { kind: string; id: number }) {
  return (
    <EvidenceBox
      listUrl={`/ehs/${kind}/${id}/attachments`}
      uploadUrl={`/ehs/${kind}/${id}/attachments`}
      filePrefix="/ehs/attachments"
    />
  )
}

export default function SafetyPage() {
  const nav = useNavigate()
  const [tab, setTab] = useState('tablero')
  const [inc, setInc] = useState<any[]>([])
  const [months, setMonths] = useState<any[]>([])
  const [recs, setRecs] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('Laboratorio')
  const [severity, setSeverity] = useState('media')
  const [lot, setLot] = useState('')
  const [desc, setDesc] = useState('')
  const [y, setY] = useState(String(new Date().getFullYear()))
  const [m, setM] = useState(String(new Date().getMonth() + 1))
  const [nave, setNave] = useState('Nave 4')
  const [acc, setAcc] = useState('0')
  const [lost, setLost] = useState('0')
  const [workers, setWorkers] = useState('120')
  const [hht, setHht] = useState('')
  const [recTitle, setRecTitle] = useState('')

  const load = async () => {
    setErr('')
    try {
      const [a, b, c] = await Promise.all([
        api.get('/ehs/incidents').catch(() => ({ data: [] })),
        api.get('/ehs/monthly').catch(() => ({ data: [] })),
        api.get('/ehs/records').catch(() => ({ data: [] })),
      ])
      setInc(unwrap(a.data))
      setMonths(unwrap(b.data))
      setRecs(unwrap(c.data))
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se pudo cargar EHS')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const byKind = (kind: string) => recs.filter((r) => r.kind === kind)
  const openInc = inc.filter((x) => x.status !== 'cerrado').length
  const yearAcc = months.reduce((n, r) => n + Number(r.accidents || 0), 0)
  const last = months[0]
  const hhtCalc = Number(workers || 0) * 8 * 22

  const chartIF = useMemo(() => {
    const map: Record<number, number> = {}
    months.forEach((r) => {
      map[r.month] = Number(r.ifreq || 0)
    })
    const max = Math.max(1, ...Object.values(map), 1)
    return Array.from({ length: 12 }, (_, i) => ({ m: MESES[i], v: map[i + 1] || 0, max }))
  }, [months])

  const saveInc = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/ehs/incidents', { title, area, severity, lot_number: lot || null, description: desc })
    setTitle('')
    setDesc('')
    setLot('')
    await load()
    setTab('incidentes')
  }

  const closeInc = async (r: any) => {
    await api.put(`/ehs/incidents/${r.id}`, { ...r, status: 'cerrado', title: r.title || 'Incidente' })
    await load()
  }

  const saveMonth = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/ehs/monthly', {
      year: Number(y),
      month: Number(m),
      nave,
      area,
      accidents: Number(acc),
      lost_days: Number(lost),
      avg_workers: Number(workers),
      hht: hht ? Number(hht) : undefined,
      constant: 200000,
    })
    setAcc('0')
    setLost('0')
    await load()
  }

  const saveRec = async (kind: string) => {
    if (!recTitle.trim()) return
    await api.post('/ehs/records', { kind, title: recTitle, area, status: 'abierto' })
    setRecTitle('')
    await load()
  }

  const closeRec = async (id: number) => {
    await api.put(`/ehs/records/${id}`)
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">Fase 5.1 · EHS</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Seguridad industrial</h2>
        <p className="text-sm text-[#5C5046]">Tablero, incidentes e inspecciones. Fotos en disco, no en SQL Server.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { l: 'Incidentes abiertos', v: openInc },
          { l: 'Accidentes año', v: yearAcc },
          { l: 'IF último mes', v: last?.ifreq ?? '—' },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-[#E6E2DC] bg-white px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-[#8A8076]">{c.l}</p>
            <p className="text-2xl font-semibold text-[#1A120E]">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              tab === t.id ? 'bg-[#DCA54C] font-semibold' : 'border border-[#E6E2DC] bg-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {err ? <p className="text-sm text-rose-700">{err}</p> : null}

      {tab === 'tablero' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="rounded-2xl border border-[#E6E2DC] bg-white p-4 space-y-4">
            <p className="text-sm font-medium">Índice de frecuencia por mes</p>
            <div className="flex items-end gap-1 h-36">
              {chartIF.map((b) => (
                <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-[#DCA54C]" style={{ height: `${Math.max(4, (b.v / b.max) * 120)}px` }} />
                  <span className="text-[9px] text-[#8A8076]">{b.m}</span>
                </div>
              ))}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#8A8076]">
                    <th className="py-1">Mes</th>
                    <th>Nave</th>
                    <th>Área</th>
                    <th>Acc</th>
                    <th>Días</th>
                    <th>HHT</th>
                    <th>IF</th>
                    <th>IG</th>
                    <th>IA</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((r) => (
                    <tr key={r.id} className="border-t border-[#EFEAE3]">
                      <td className="py-1">{r.month}/{r.year}</td>
                      <td>{r.nave}</td>
                      <td>{r.area}</td>
                      <td>{r.accidents}</td>
                      <td>{r.lost_days}</td>
                      <td>{r.hht}</td>
                      <td>{r.ifreq}</td>
                      <td>{r.igrav}</td>
                      <td>{r.iacc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!months.length ? <p className="text-sm text-[#8A8076] py-4">Carga el primer mes a la derecha.</p> : null}
            </div>
          </div>
          <form onSubmit={saveMonth} className="rounded-2xl border border-[#E6E2DC] bg-white p-4 space-y-2 text-sm">
            <p className="font-medium">Alta mensual</p>
            <div className="grid grid-cols-2 gap-2">
              <input className="border rounded-xl px-2 py-1" value={y} onChange={(e) => setY(e.target.value)} />
              <select className="border rounded-xl px-2 py-1" value={m} onChange={(e) => setM(e.target.value)}>
                {MESES.map((n, i) => (
                  <option key={n} value={i + 1}>{n}</option>
                ))}
              </select>
            </div>
            <input className="border rounded-xl px-2 py-1 w-full" value={nave} onChange={(e) => setNave(e.target.value)} />
            <select className="border rounded-xl px-2 py-1 w-full" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <input className="border rounded-xl px-2 py-1 w-full" value={acc} onChange={(e) => setAcc(e.target.value)} placeholder="Accidentes" />
            <input className="border rounded-xl px-2 py-1 w-full" value={lost} onChange={(e) => setLost(e.target.value)} placeholder="Días incapacidad" />
            <input className="border rounded-xl px-2 py-1 w-full" value={workers} onChange={(e) => setWorkers(e.target.value)} placeholder="Trabajadores" />
            <input className="border rounded-xl px-2 py-1 w-full" value={hht} onChange={(e) => setHht(e.target.value)} placeholder={`HHT (vacío = ${hhtCalc})`} />
            <p className="text-[11px] text-[#8A8076]">IF = acc×200000/HHT · IG = días×200000/HHT · IA = IF×IG/1000</p>
            <button className="w-full rounded-full bg-[#DCA54C] py-2 font-semibold" type="submit">Registrar mes</button>
          </form>
        </div>
      )}

      {tab === 'incidentes' && (
        <div className="grid lg:grid-cols-[340px_1fr] gap-4">
          <form onSubmit={saveInc} className="rounded-2xl border border-[#E6E2DC] bg-white p-4 space-y-2 text-sm h-fit">
            <p className="font-medium">Nuevo incidente</p>
            <input className="border rounded-xl px-2 py-2 w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required />
            <select className="border rounded-xl px-2 py-2 w-full" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select className="border rounded-xl px-2 py-2 w-full" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <input className="border rounded-xl px-2 py-2 w-full" value={lot} onChange={(e) => setLot(e.target.value)} placeholder="Lote (opcional)" />
            <textarea className="border rounded-xl px-2 py-2 w-full" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción" />
            <p className="text-xs text-[#8A8076]">Guarda primero. Las fotos salen en la tarjeta de la derecha.</p>
            <button className="w-full rounded-full bg-[#DCA54C] py-2 font-semibold" type="submit">Registrar</button>
          </form>
          <div className="space-y-3">
            {inc.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[#E6E2DC] bg-white px-4 py-3 space-y-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-[#8A8076]">{r.area} · {r.severity} · {r.lot_number || 'sin lote'} · {r.status}</p>
                  </div>
                  {r.status !== 'cerrado' ? (
                    <button type="button" className="text-xs text-[#8A5A12]" onClick={() => closeInc(r)}>Cerrar</button>
                  ) : null}
                </div>
                <EhsPhotos kind="incidents" id={r.id} />
              </div>
            ))}
            {!inc.length ? <p className="text-sm text-[#8A8076]">Sin incidentes. Crea uno para adjuntar fotos.</p> : null}
          </div>
        </div>
      )}

      {tab === 'inspecciones' && (
        <div className="grid sm:grid-cols-3 gap-3">
          {INSP.map((f) => (
            <button
              key={f.code}
              type="button"
              onClick={() => nav('/forms')}
              className="text-left rounded-2xl border border-[#E6E2DC] bg-white p-4 hover:border-[#DCA54C]"
            >
              <p className="text-[10px] tracking-wider text-[#DCA54C]">{f.code}</p>
              <p className="font-medium text-sm mt-1">{f.title}</p>
              <p className="text-xs text-[#8A8076] mt-1">{f.hint}</p>
            </button>
          ))}
        </div>
      )}

      {['permisos', 'capacitacion', 'ncr'].includes(tab) && (
        <div className="rounded-2xl border border-[#E6E2DC] bg-white p-4 space-y-3">
          <p className="text-sm font-medium">
            {tab === 'permisos' ? 'Permisos de trabajo' : tab === 'capacitacion' ? 'Capacitaciones' : 'No conformidades'}
          </p>
          <div className="flex gap-2">
            <input className="border rounded-xl px-3 py-2 flex-1 text-sm" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} placeholder="Título" />
            <button type="button" className="rounded-full bg-[#DCA54C] px-4 font-semibold text-sm" onClick={() => saveRec(tab)}>
              Alta
            </button>
          </div>
          {byKind(tab).map((r) => (
            <div key={r.id} className="border-t border-[#EFEAE3] py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{r.title} · {r.status}</span>
                {r.status !== 'cerrado' ? (
                  <button type="button" className="text-xs text-[#8A5A12]" onClick={() => closeRec(r.id)}>Cerrar</button>
                ) : null}
              </div>
              <EhsPhotos kind={tab} id={r.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}