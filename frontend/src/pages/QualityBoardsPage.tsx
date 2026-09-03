import { FormEvent, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const SHEETS = [
  {
    id: 'desarrollo',
    title: 'Desarrollo',
    excelName: 'DESARROLLO',
    hint: 'Propuestas y códigos MD',
    cols: [
      { key: 'fecha', label: 'FECHA' },
      { key: 'cliente', label: 'CLIENTE' },
      { key: 'caracteristica', label: 'CARACTERISTICA' },
      { key: 'ubicacion', label: 'UBICACIÓN' },
      { key: 'codigo', label: 'CODIGO' },
      { key: 'status', label: 'STATUS' },
      { key: 'observacion', label: 'OBSERVACION' },
    ],
  },
  {
    id: 'granel',
    title: 'Granel',
    excelName: 'GRANEL',
    hint: 'Lotes, vencimiento y tipo',
    cols: [
      { key: 'fecha', label: 'FECHA' },
      { key: 'cliente', label: 'CLIENTE' },
      { key: 'lote', label: 'LOTE' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'ubicacion', label: 'UBICACIÓN' },
      { key: 'fecha_vencimiento', label: 'FECHA VENCIMIENTO' },
      { key: 'status', label: 'STATUS' },
      { key: 'observacion', label: 'OBSERVACION' },
      { key: 'tipo', label: 'TIPO' },
    ],
  },
  {
    id: 'envasado',
    title: 'Producto envasado',
    excelName: 'PRODUCTO ENVASADO',
    hint: 'Volumen, grado, lotes y país',
    cols: [
      { key: 'fecha_envasado', label: 'FECHA ENVASADO' },
      { key: 'nombre', label: 'NOMBRE' },
      { key: 'producto', label: 'PRODUCTO' },
      { key: 'volumen', label: 'VOLUMEN (L)' },
      { key: 'grado', label: 'GRADO ALCOHOLICO' },
      { key: 'lote_elaboracion', label: 'LOTE ELABORACION' },
      { key: 'lote_envasado', label: 'LOTE ENVASADO' },
      { key: 'ubicacion', label: 'UBICACIÓN' },
      { key: 'observacion', label: 'OBSERVACION' },
      { key: 'pais', label: 'PAIS' },
    ],
  },
] as const

type SheetId = (typeof SHEETS)[number]['id']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function parseRow(r: any) {
  let extra: any = {}
  try {
    extra = r.note ? JSON.parse(r.note) : {}
  } catch {
    extra = { observacion: r.note }
  }
  return {
    id: r.id,
    board: r.board,
    fecha: extra.fecha || (r.created_at || '').slice(0, 10),
    cliente: extra.cliente || r.product_name || '',
    caracteristica: extra.caracteristica || '',
    ubicacion: extra.ubicacion || '',
    codigo: extra.codigo || r.lot_number || '',
    status: extra.status || r.color || 'IN STOCK',
    observacion: extra.observacion || '',
    lote: extra.lote || r.lot_number || '',
    producto: extra.producto || '',
    fecha_vencimiento: extra.fecha_vencimiento || '',
    tipo: extra.tipo || '',
    fecha_envasado: extra.fecha_envasado || extra.fecha || '',
    nombre: extra.nombre || extra.cliente || '',
    volumen: extra.volumen || r.qty || '',
    grado: extra.grado || '',
    lote_elaboracion: extra.lote_elaboracion || '',
    lote_envasado: extra.lote_envasado || '',
    pais: extra.pais || '',
  }
}

function emptyForm(id: SheetId) {
  if (id === 'desarrollo') {
    return { fecha: today(), cliente: '', caracteristica: '', ubicacion: '', codigo: '', status: 'IN STOCK', observacion: '' }
  }
  if (id === 'granel') {
    return { fecha: today(), cliente: '', lote: '', producto: '', ubicacion: '', fecha_vencimiento: '', status: 'IN STOCK', observacion: '', tipo: '' }
  }
  return {
    fecha_envasado: today(),
    nombre: '',
    producto: '',
    volumen: '',
    grado: '',
    lote_elaboracion: '',
    lote_envasado: '',
    ubicacion: '',
    observacion: '',
    pais: '',
  }
}

function statusClass(s: string) {
  const t = (s || '').toUpperCase()
  if (t.includes('VENC')) return 'bg-rose-500 text-white'
  if (t.includes('VACI')) return 'bg-amber-200'
  return 'bg-lime-400 text-[#1A120E]'
}

async function xlsxLib() {
  return import('xlsx')
}

export default function QualityBoardsPage() {
  const [sheet, setSheet] = useState<SheetId | ''>('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState<any>(emptyForm('desarrollo'))
  const [err, setErr] = useState('')
  const meta = SHEETS.find((s) => s.id === sheet)

  const load = async () => {
    setErr('')
    try {
      const { data } = await api.get('/wms/boards')
      setRows((Array.isArray(data) ? data : []).map(parseRow))
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se leyeron los tableros')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visible = useMemo(() => rows.filter((r) => r.board === sheet), [rows, sheet])

  const setF = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!sheet) return
    const payload = { ...form }
    await api.post('/wms/boards', {
      board: sheet,
      lot_number: form.codigo || form.lote || form.lote_envasado || null,
      product_name: form.cliente || form.nombre || form.producto || '',
      qty: Number(form.volumen || 0),
      unit: 'L',
      color: form.status || 'IN STOCK',
      note: JSON.stringify(payload),
    })
    setForm(emptyForm(sheet))
    await load()
  }

  const remove = async (id: number) => {
    await api.delete(`/wms/boards/${id}`)
    await load()
  }

  const exportXlsx = async () => {
    if (!meta) return
    const XLSX = await xlsxLib()
    const header = meta.cols.map((c) => c.label)
    const body = visible.map((r) => meta.cols.map((c) => r[c.key] ?? ''))
    const ws = XLSX.utils.aoa_to_sheet([header, ...body])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, meta.excelName.slice(0, 31))
    XLSX.writeFile(wb, `${meta.excelName}.xlsx`)
  }

  const importXlsx = async (file: File) => {
    if (!sheet || !meta) return
    const XLSX = await xlsxLib()
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' })
    const header = (aoa[0] || []).map((h) => String(h).trim().toUpperCase())
    const idx = (label: string) => header.indexOf(label.toUpperCase())
    for (const line of aoa.slice(1)) {
      if (!line || line.every((c) => !String(c).trim())) continue
      const rec: any = {}
      meta.cols.forEach((c) => {
        const i = idx(c.label)
        rec[c.key] = i >= 0 ? String(line[i] ?? '') : ''
      })
      if (!rec.fecha && !rec.fecha_envasado) rec.fecha = today()
      if (!rec.status) rec.status = 'IN STOCK'
      await api.post('/wms/boards', {
        board: sheet,
        lot_number: rec.codigo || rec.lote || rec.lote_envasado || null,
        product_name: rec.cliente || rec.nombre || rec.producto || '',
        qty: Number(rec.volumen || 0),
        color: rec.status || 'IN STOCK',
        note: JSON.stringify(rec),
      })
    }
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">Fase 8b</p>
        <h2 className="text-2xl font-semibold text-[#1A120E] mt-1">Control De Cuarto</h2>
        <p className="text-sm text-[#5C5046]">Las mismas tres hojas del Excel de planta. Importa y exporta .xlsx.</p>
      </div>

      {err ? <p className="text-sm text-rose-700">{err}</p> : null}

      <div className="grid sm:grid-cols-3 gap-3">
        {SHEETS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSheet(s.id)
              setForm(emptyForm(s.id))
            }}
            className={`text-left rounded-2xl border px-4 py-3 ${
              sheet === s.id ? 'border-[#DCA54C] bg-[#F7F0E2]' : 'border-[#E6E2DC] bg-white'
            }`}
          >
            <p className="text-sm font-semibold text-[#1A120E]">{s.title}</p>
            <p className="text-xs text-[#8A8076] mt-1">{s.hint}</p>
          </button>
        ))}
      </div>

      {!sheet ? (
        <p className="text-sm text-[#8A8076]">Elige un tablero para ver la planilla.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-[#1A120E]">{meta?.excelName}</h3>
            <div className="flex gap-2">
              <label className="px-3 py-1.5 rounded-full border border-[#C9C2B6] text-sm cursor-pointer bg-white">
                Importar Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) importXlsx(f)
                    e.target.value = ''
                  }}
                />
              </label>
              <button type="button" className="px-3 py-1.5 rounded-full bg-[#DCA54C] text-sm font-semibold" onClick={exportXlsx}>
                Exportar .xlsx
              </button>
            </div>
          </div>

          <form onSubmit={save} className="rounded-2xl border border-[#E6E2DC] bg-white p-4 grid md:grid-cols-4 gap-2 text-sm">
            {meta?.cols.map((c) => (
              <label key={c.key} className="block">
                <span className="text-[10px] uppercase tracking-wide text-[#8A8076]">{c.label}</span>
                <input
                  className="mt-1 w-full border border-[#C9C2B6] rounded-lg px-2 py-1.5 text-[#1A120E]"
                  value={form[c.key] || ''}
                  onChange={(e) => setF(c.key, e.target.value)}
                />
              </label>
            ))}
            <div className="md:col-span-4">
              <button className="rounded-full bg-[#DCA54C] px-5 py-2 font-semibold text-sm" type="submit">
                Agregar fila
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-[#E6E2DC] bg-white overflow-auto">
            <table className="w-full text-[11px] text-[#1A120E]">
              <thead>
                <tr className="bg-[#F3EFE8] text-left">
                  {meta?.cols.map((c) => (
                    <th key={c.key} className="px-2 py-2 font-semibold whitespace-nowrap border-b border-[#E6E2DC]">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-2 py-2 border-b border-[#E6E2DC]" />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-t border-[#EFEAE3]">
                    {meta?.cols.map((c) => (
                      <td key={c.key} className="px-2 py-1.5 whitespace-nowrap">
                        {c.key === 'status' ? (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold ${statusClass(r[c.key])}`}>{r[c.key]}</span>
                        ) : (
                          r[c.key] || ''
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button type="button" className="text-[#8A5A12]" onClick={() => remove(r.id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {!visible.length ? (
                  <tr>
                    <td className="px-3 py-6 text-[#8A8076]" colSpan={(meta?.cols.length || 0) + 1}>
                      Sin filas. Carga el Excel de planta o agrega la primera.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}