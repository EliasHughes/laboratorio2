import { useEffect, useState } from 'react'
import { FileText, Pencil, Printer, Search, X } from 'lucide-react'
import api from '../services/api'
import CertificadoAnalisisForm from '../forms/CertificadoAnalisisForm'
import InspeccionInsumosForm from '../forms/InspeccionInsumosForm'
import RegistroCatadoForm, { printRegistroCatado } from '../forms/RegistroCatadoForm'
import AguaOsmotizadaForm, { printAguaOsmotizada } from '../forms/AguaOsmotizadaForm'
import PruebaTriangularForm from '../forms/PruebaTriangularForm'
import RecepcionGranelForm from '../forms/RecepcionGranelForm'
import InspeccionIsotanquesForm from '../forms/InspeccionIsotanquesForm'
import ControlElaboracionForm, { printControlElaboracion } from '../forms/ControlElaboracionForm'
import RecepcionPulpaForm from '../forms/RecepcionPulpaForm'
import ControlEnvasadoForm, { printControlEnvasado } from '../forms/ControlEnvasadoForm'
import InspeccionInstalacionesForm from '../forms/InspeccionInstalacionesForm'
import ControlEnvejecimientoForm from '../forms/ControlEnvejecimientoForm'
import EspecificacionesMateriaPrimaForm from '../forms/EspecificacionesMateriaPrimaForm'
import InspeccionContenedoresChasisForm from '../forms/InspeccionContenedoresChasisForm'
import EvidenceBox from './EvidenceBox'


const CATALOG = [
  { type: 'certificado_analisis', code: 'Y-FO-CC-013', title: 'Certificado de Análisis / Certificate of Analysis' },
  { type: 'inspeccion_recepcion_insumos', code: 'Y-FO-CC-030', title: 'Inspección recepción insumos' },
  { type: 'registro_catado', code: 'Y-FO-CC-008', title: 'Registro secciones de catado' },
  { type: 'analisis_agua', code: 'Y-FO-CC-012', title: 'Análisis de calidad del agua' },
  { type: 'prueba_triangular', code: 'Y-FO-CC-007', title: 'Prueba triangular' },
  { type: 'recepcion_productos_granel', code: 'Y-FO-CC-011', title: 'Recepción productos a granel' },
  { type: 'inspeccion_isotanques', code: 'Y-FO-CC-038', title: 'Inspección isotanques, cisternas y contenedores' },
  { type: 'control_elaboracion', code: 'Y-FO-CC-009', title: 'Control de elaboración envejecidos y destilados' },
  { type: 'recepcion_pulpas', code: 'Y-FO-CC-058', title: 'Certificado de análisis — recepción de pulpas' },
  { type: 'control_envasado', code: 'Y-FO-CC-004', title: 'Control de envasado' },
  { type: 'inspeccion_instalaciones', code: 'Y-FO-BI-018', title: 'Inspección de las instalaciones' },
  { type: 'control_envejecimiento', code: 'Y-FO-CO-001', title: 'Control de proceso envejecimiento' },
  { type: 'especificaciones_mp', code: 'Y-FO-CC-056-02', title: 'Especificaciones de materia prima e insumo' },
  { type: 'inspeccion_contenedores_chasis', code: 'Y-FO-SI-004', title: 'Inspección contenedores, isotanque y chasis' },
]

const PHOTO_TYPES = [
  'inspeccion_instalaciones',
  'inspeccion_isotanques',
  'inspeccion_contenedores_chasis',
]

function catalogOf(type: string) {
  return CATALOG.find((c) => c.type === type)
}

function escapeHtml(v: unknown) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function flattenPayload(obj: any, prefix = ''): { k: string; v: string }[] {
  if (obj == null || obj === '') return []
  if (Array.isArray(obj)) {
    if (!obj.length) return prefix ? [{ k: prefix, v: '—' }] : []
    if (obj.every((x) => x == null || ['string', 'number', 'boolean'].includes(typeof x))) {
      return [{ k: prefix || 'lista', v: obj.map((x) => String(x)).join(', ') }]
    }
    return obj.flatMap((item, i) => flattenPayload(item, prefix ? `${prefix} [${i + 1}]` : `#${i + 1}`))
  }
  if (typeof obj === 'object') {
    return Object.entries(obj).flatMap(([key, val]) =>
      flattenPayload(val, prefix ? `${prefix} / ${key}` : key),
    )
  }
  return [{ k: prefix || 'valor', v: String(obj) }]
}

function payloadOf(r: any) {
  let payload: any = r.payload ?? r.data ?? {}
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = { raw: payload }
    }
  }
  return payload && typeof payload === 'object' ? payload : {}
}

const OFFICIAL_PRINTERS: Record<string, (data: any) => void> = {
  control_envasado: printControlEnvasado,
  analisis_agua: printAguaOsmotizada,
  registro_catado: printRegistroCatado,
  control_elaboracion: printControlElaboracion,
}

export function printRecord(r: any) {
  const payload = payloadOf(r)
  const official =
    OFFICIAL_PRINTERS[r.form_type] ||
    (String(r.form_code || '').toUpperCase() === 'Y-FO-CC-004' ? printControlEnvasado : null) ||
    (String(r.form_code || '').toUpperCase() === 'Y-FO-CC-034' ? printControlEnvasado : null)
  if (official) {
    official(payload)
    return
  }

  const logo = `${window.location.origin}/yazoo.png`
  const rows = flattenPayload(payload)
  const bodyRows = rows.length
    ? rows
        .map(
          (row) =>
            `<tr><td style="border:1px solid #C9C1B6;padding:4px 6px;width:38%;font-size:11px">${escapeHtml(row.k)}</td><td style="border:1px solid #C9C1B6;padding:4px 6px;font-size:12px">${escapeHtml(row.v)}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="2" style="padding:12px;text-align:center">Sin datos capturados</td></tr>'

  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(r.form_code || '')}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#1A120E}
      .paper{max-width:800px;margin:0 auto;border:1px solid #C9C1B6;padding:16px}
      table{width:100%;border-collapse:collapse}
      @media print{body{padding:0}.paper{border:none}}
    </style></head><body>
    <div class="paper">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <img src="${logo}" height="48" alt="Yazoo"/>
        <div style="text-align:center;flex:1">
          <div style="font-size:11px;letter-spacing:.12em">RONES Y BEBIDAS DEL CARIBE YAZOO</div>
          <b>${escapeHtml(r.title || '')}</b><br/>
          <small>${escapeHtml(r.form_code || '')}</small>
        </div>
        <div style="text-align:right;font-size:11px">
          Estado: ${escapeHtml(r.status || '')}<br/>
          Creado por: ${escapeHtml(r.created_by_name || r.created_by || '—')}<br/>
          Modificado por: ${escapeHtml(r.updated_by_name || r.updated_by || '—')}
        </div>
      </div>
      <hr/>
      <table>${bodyRows}</table>
      <p style="font-size:10px;color:#5C5046;margin-top:16px">Impresión de registro · Fase 0. La plantilla idéntica al papel se cierra en Fase 1.</p>
    </div></body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

export default function FormsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [editId, setEditId] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)
  const [lots, setLots] = useState<any[]>([])
  const [lotId, setLotId] = useState('')
  const [lotFilter, setLotFilter] = useState('')
  

  const load = async () => {
    try {
      const { data } = await api.get('/forms')
      setRecords(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch {
      setRecords([])
    }
  }

   useEffect(() => {
    load()
    api
      .get('/lots')
      .then((r) => setLots(Array.isArray(r.data) ? r.data : []))
      .catch(() => setLots([]))
  }, [])

  useEffect(() => {
    if (!modal || !autoPrint) return
    const t = window.setTimeout(() => {
      const btn = document.querySelector('[data-yazoo-print]') as HTMLButtonElement | null
      btn?.click()
      setAutoPrint(false)
    }, 350)
    return () => window.clearTimeout(t)
  }, [modal, autoPrint, selectedType, editId])

   const printFromList = (r: any) => {
    const raw = r.payload ?? r.data
    setEditId(r.id)
    setEditData(typeof raw === 'string' ? JSON.parse(raw || '{}') : raw)
    setSelectedType(r.form_type)
    setLotId(r.lot_id ? String(r.lot_id) : '')
    setAutoPrint(true)
    setModal(true)
  }

  const openNew = (type: string) => {
    setSelectedType(type)
    setEditId(null)
    setEditData(null)
    setError('')
    setAutoPrint(false)
    setLotId('')
    setModal(true)
  }

  const saveForm = async (type: string, data: any, st?: string) => {
    const meta = catalogOf(type)
    if (!meta) {
      setError('Tipo de formulario desconocido')
      return
    }
    setSaving(true)
    setError('')
    try {
      const raw = typeof data === 'string' ? data : data ?? {}
      const body = {
        form_type: type,
        form_code: meta.code,
        title: meta.title,
        status: st || 'borrador',
                lot_id: lotId ? Number(lotId) : null,
                lot_number: lots.find((l) => String(l.id) === String(lotId))?.lot_number || null,
                data: raw,
                payload: raw,
      }
      if (editId) await api.put(`/forms/${editId}`, body)
      else await api.post('/forms', body)
      setModal(false)
      await load()
    } catch (e: any) {
      const d = e?.response?.data?.detail
      const msg =
        typeof d === 'string'
          ? d
          : Array.isArray(d)
            ? d.map((x: any) => x?.msg || x?.message || JSON.stringify(x)).join(' · ')
            : e?.message || 'No se pudo guardar'
      setError(String(msg))
    } finally {
      setSaving(false)
    }
  }

  const filtered = records.filter((r) => {
    if (lotFilter && String(r.lot_id || '') !== String(lotFilter) && String(r.lot_number || '') !== lotFilter) return false
    const q = search.toLowerCase()
    return (
      String(r.title || '').toLowerCase().includes(q) ||
      String(r.form_code || '').toLowerCase().includes(q) ||
      String(r.form_type || '').toLowerCase().includes(q) ||
      String(r.created_by_name || '').toLowerCase().includes(q)
    )
  })

  const selectedLot = lots.find((l) => String(l.id) === String(lotId))
  const formData = {
    ...(editData || {}),
    lote: selectedLot?.lot_number || editData?.lote || '',
    lot_number: selectedLot?.lot_number || editData?.lot_number || '',
    producto: selectedLot?.product_name || editData?.producto || '',
  }
  const wrapSave = (type: string) => (data: any) => saveForm(type, data)

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#5C5046]">Formatos oficiales · un archivo por formulario</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {CATALOG.map((c) => (
          <button
            key={c.type}
            type="button"
            onClick={() => openNew(c.type)}
            className="text-left rounded-xl border border-[#E6E2DC] bg-white px-4 py-3 hover:border-[#DCA54C]"
          >
            <p className="text-xs text-[#8A8076] flex items-center gap-1">
              <FileText className="w-3 h-3" /> {c.code}
            </p>
            <p className="text-sm font-medium text-[#1A120E]">{c.title}</p>
          </button>
        ))}
      </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E6E2DC] text-sm text-[#1A120E] bg-white"
            placeholder="Buscar registros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="sm:w-64 border border-[#E6E2DC] rounded-lg px-3 py-2 text-sm text-[#1A120E] bg-white"
          value={lotFilter}
          onChange={(e) => setLotFilter(e.target.value)}
        >
          <option value="">Todos los lotes</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.lot_number}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="bg-red-100 text-red-800 text-sm p-2">{error}</p> : null}

      <div className="rounded-xl border border-[#E6E2DC] bg-white overflow-hidden">
        <table className="w-full text-sm text-[#1A120E]">
          <thead className="bg-[#F3EFE8] text-xs uppercase text-[#5C5046]">
            <tr>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Título</th>
              <th className="px-3 py-2 text-left">Lote</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Creado por</th>
              <th className="px-3 py-2 text-left">Modificado por</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-[#E6E2DC]">
                <td className="px-3 py-2">{r.form_code}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.lot_number || '—'}</td>
                <td className="px-3 py-2">{r.status || 'borrador'}</td>
                <td className="px-3 py-2">{r.created_by_name || r.created_by || '—'}</td>
                <td className="px-3 py-2">{r.updated_by_name || r.updated_by || '—'}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button type="button" title="Imprimir" className="p-1 text-[#8A5A12]" onClick={() => printFromList(r)}>
                    <Printer className="w-4 h-4 inline" />
                  </button>
                  <button
                    type="button"
                    title="Editar"
                    className="p-1"
                    onClick={() => {
                      const raw = r.payload ?? r.data
                      setEditId(r.id)
                      setEditData(typeof raw === 'string' ? JSON.parse(raw || '{}') : raw)
                      setSelectedType(r.form_type)
                      setLotId(r.lot_id ? String(r.lot_id) : '')
                      setModal(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            
          </tbody>
        </table>
      </div>
      

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto">
            <button type="button" className="absolute -top-10 right-0 text-white" onClick={() => setModal(false)}>
              <X />
            </button>
            {error ? <p className="bg-red-100 text-red-800 text-sm p-2 mb-2">{error}</p> : null}
            {saving ? <p className="text-white text-sm mb-2">Guardando…</p> : null}

                        <div className="bg-white border border-[#E6E2DC] rounded-xl px-4 py-3 mb-3">
              <label className="block text-xs text-[#5C5046]">
                Lote vinculado (trazabilidad)
                <select
                  className="mt-1 w-full border border-[#C9C2B6] rounded-xl px-3 py-2 text-sm text-[#1A120E] bg-white"
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                >
                  <option value="">Sin lote / no aplica</option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lot_number} · {l.product_name || ''} · {l.location || ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedType === 'certificado_analisis' ? (
              <CertificadoAnalisisForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('certificado_analisis')} />
            ) : selectedType === 'inspeccion_recepcion_insumos' ? (
              <InspeccionInsumosForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_recepcion_insumos')} />
            ) : selectedType === 'registro_catado' ? (
              <RegistroCatadoForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('registro_catado')} />
            ) : selectedType === 'analisis_agua' ? (
              <AguaOsmotizadaForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('analisis_agua')} />
            ) : selectedType === 'prueba_triangular' ? (
              <PruebaTriangularForm key={`${selectedType}-${editId ?? 'new'}`} iinitialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('prueba_triangular')} />
            ) : selectedType === 'recepcion_productos_granel' ? (
              <RecepcionGranelForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('recepcion_productos_granel')} />
            ) : selectedType === 'inspeccion_isotanques' ? (
             <InspeccionIsotanquesForm key={`${selectedType}-${editId ?? 'new'}`} formId={editId} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_isotanques')} />
            ) : selectedType === 'control_elaboracion' ? (
              <ControlElaboracionForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('control_elaboracion')} />
            ) : selectedType === 'recepcion_pulpas' ? (
              <RecepcionPulpaForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('recepcion_pulpas')} />
            ) : selectedType === 'control_envasado' ? (
              <ControlEnvasadoForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('control_envasado')} />
            ) : selectedType === 'inspeccion_instalaciones' ? (
              <InspeccionInstalacionesForm key={`${selectedType}-${editId ?? 'new'}`} formId={editId} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_instalaciones')} />
            ) : selectedType === 'control_envejecimiento' ? (
              <ControlEnvejecimientoForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('control_envejecimiento')} />
            ) : selectedType === 'especificaciones_mp' ? (
              <EspecificacionesMateriaPrimaForm key={`${selectedType}-${editId ?? 'new'}`} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('especificaciones_mp')} />
            ) : selectedType === 'inspeccion_contenedores_chasis' ? (
              <InspeccionContenedoresChasisForm key={`${selectedType}-${editId ?? 'new'}`} formId={editId} initialData={formData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_contenedores_chasis')} />
            ) : (
              <div className="bg-white p-6 rounded-xl text-[#1A120E]">Formulario no implementado</div>
            )} 
            {PHOTO_TYPES.includes(selectedType) && (
              <div className="mt-3">
                <EvidenceBox formId={editId} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
