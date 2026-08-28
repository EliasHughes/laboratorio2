import { useEffect, useState } from 'react'
import { ClipboardList, FileText, Pencil, Printer, Search, X } from 'lucide-react'
import api from '../services/api'
import CertificadoAnalisisForm from '../forms/CertificadoAnalisisForm'
import InspeccionInsumosForm from '../forms/InspeccionInsumosForm'
import RegistroCatadoForm from '../forms/RegistroCatadoForm'
import AguaOsmotizadaForm from '../forms/AguaOsmotizadaForm'
import PruebaTriangularForm from '../forms/PruebaTriangularForm'
import RecepcionGranelForm from '../forms/RecepcionGranelForm'
import InspeccionIsotanquesForm from '../forms/InspeccionIsotanquesForm'
import ControlElaboracionForm from '../forms/ControlElaboracionForm'
import RecepcionPulpaForm from '../forms/RecepcionPulpaForm'
import ControlEnvasadoForm from '../forms/ControlEnvasadoForm'
import InspeccionInstalacionesForm from '../forms/InspeccionInstalacionesForm'
import ControlEnvejecimientoForm from '../forms/ControlEnvejecimientoForm'
import EspecificacionesMateriaPrimaForm from '../forms/EspecificacionesMateriaPrimaForm'
import InspeccionContenedoresChasisForm from '../forms/InspeccionContenedoresChasisForm'

const CATALOG = [
  { type: 'certificado_analisis', code: 'Y-FO-CC-013', title: 'Certificado de Análisis / Certificate of Analysis' },
  { type: 'inspeccion_recepcion_insumos', code: 'Y-FO-CC-030', title: 'Inspección recepción insumos' },
  { type: 'registro_catado', code: 'Y-FO-CC-008', title: 'Registro secciones de catado' },
  { type: 'analisis_agua', code: 'Y-FO-CC-012', title: 'Análisis de calidad del agua' },
  { type: 'prueba_triangular', code: 'Y-FO-CC-007', title: 'Prueba triangular' },
  { type: 'recepcion_productos_granel', code: 'Y-FO-CC-011', title: 'Recepción productos a granel' },
  { type: 'inspeccion_isotanques', code: 'Y-FO-CC-018', title: 'Inspección isotanques, cisternas y contenedores' },
  { type: 'control_elaboracion', code: 'Y-FO-CC-009', title: 'Control de elaboración envejecidos y destilados' },
  { type: 'recepcion_pulpas', code: 'Y-FO-CC-008', title: 'Certificado de análisis — recepción de pulpas' },
  { type: 'control_envasado', code: 'Y-FO-CC-004', title: 'Control de envasado' },
  { type: 'inspeccion_instalaciones', code: 'Y-FO-SI-010', title: 'Inspección de las instalaciones' },
  { type: 'control_envejecimiento', code: 'Y-FO-CC-ENV', title: 'Control de proceso envejecimiento' },
  { type: 'especificaciones_mp', code: 'Y-FO-CC-056-02', title: 'Especificaciones de materia prima e insumo' },
  { type: 'inspeccion_contenedores_chasis', code: 'Y-FO-SI-004', title: 'Inspección contenedores, isotanque y chasis' },
]

export function printRecord(r: any) {
  const logo = `${window.location.origin}/yazoo.png`
  let payload: any = r.payload ?? r.data ?? {}
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = { raw: payload }
    }
  }
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${r.form_code || ''}</title>
    <style>
      body{font-family:Arial;padding:18px;color:#1A120E}
      .paper{max-width:800px;margin:0 auto;border:1px solid #C9C1B6;padding:20px}
      pre{white-space:pre-wrap;font-size:12px}
      @media print{body{padding:0}.paper{border:none}}
    </style></head><body>
    <div class="paper">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <img src="${logo}" height="48" alt="Yazoo"/>
        <div style="text-align:center"><b>${r.title || ''}</b><br/><small>${r.form_code || ''}</small></div>
        <div style="text-align:right;font-size:11px">Estado: ${r.status || ''}<br/>
          Creado por: ${r.created_by_name || r.created_by || '—'}<br/>
          Modificado por: ${r.updated_by_name || r.updated_by || '—'}</div>
      </div>
      <hr/>
      <pre>${JSON.stringify(payload, null, 2).replace(/[<>]/g, '')}</pre>
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

  const load = async () => {
    try {
      const data = await api.get('/forms')
      setRecords(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch {
      setRecords([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = (type: string) => {
    setSelectedType(type)
    setEditId(null)
    setEditData(null)
    setError('')
    setModal(true)
  }

  const saveForm = async (type: string, code: string, title: string, data: any, st?: string) => {
    setSaving(true)
    setError('')
    try {
      const raw = typeof data === 'string' ? data : data ?? {}
      const body = {
        form_type: type,
        form_code: code,
        title,
        status: st || 'borrador',
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
    const q = search.toLowerCase()
    return (
      String(r.title || '').toLowerCase().includes(q) ||
      String(r.form_code || '').toLowerCase().includes(q) ||
      String(r.form_type || '').toLowerCase().includes(q) ||
      String(r.created_by_name || '').toLowerCase().includes(q)
    )
  })

  const wrapSave = (type: string, code: string, title: string) => (data: any) => saveForm(type, code, title, data)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-yazoo-gold" />
          Formularios / Registros
        </h2>
        <p className="text-sm text-stone-400">Formatos oficiales · un archivo por formulario</p>
      </div>

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

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E6E2DC] text-sm text-[#1A120E]"
          placeholder="Buscar registros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <p className="bg-red-100 text-red-800 text-sm p-2">{error}</p> : null}

      <div className="rounded-xl border border-[#E6E2DC] bg-white overflow-hidden">
        <table className="w-full text-sm text-[#1A120E]">
          <thead className="bg-[#F3EFE8] text-xs uppercase text-[#5C5046]">
            <tr>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Título</th>
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
                <td className="px-3 py-2">{r.status || 'borrador'}</td>
                <td className="px-3 py-2">{r.created_by_name || r.created_by || '—'}</td>
                <td className="px-3 py-2">{r.updated_by_name || r.updated_by || '—'}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button type="button" title="Imprimir" className="p-1 text-[#8A5A12]" onClick={() => printRecord(r)}>
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
          <div className="relative w-full max-w-5xl">
            <button type="button" className="absolute -top-10 right-0 text-white" onClick={() => setModal(false)}>
              <X />
            </button>
            {error ? <p className="bg-red-100 text-red-800 text-sm p-2 mb-2">{error}</p> : null}
            {saving ? <p className="text-white text-sm mb-2">Guardando…</p> : null}

            {selectedType === 'certificado_analisis' ? (
              <CertificadoAnalisisForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('certificado_analisis', 'Y-FO-CC-013', 'Certificado de Análisis / Certificate of Analysis')} />
            ) : selectedType === 'inspeccion_recepcion_insumos' ? (
              <InspeccionInsumosForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_recepcion_insumos', 'Y-FO-CC-030', 'Inspección recepción insumos')} />
            ) : selectedType === 'registro_catado' ? (
              <RegistroCatadoForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('registro_catado', 'Y-FO-CC-008', 'Registro secciones de catado')} />
            ) : selectedType === 'analisis_agua' ? (
              <AguaOsmotizadaForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('analisis_agua', 'Y-FO-CC-012', 'Análisis de calidad del agua')} />
            ) : selectedType === 'prueba_triangular' ? (
              <PruebaTriangularForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('prueba_triangular', 'Y-FO-CC-007', 'Prueba triangular')} />
            ) : selectedType === 'recepcion_productos_granel' ? (
              <RecepcionGranelForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('recepcion_productos_granel', 'Y-FO-CC-011', 'Recepción productos a granel')} />
            ) : selectedType === 'inspeccion_isotanques' ? (
              <InspeccionIsotanquesForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_isotanques', 'Y-FO-CC-018', 'Inspección isotanques, cisternas y contenedores')} />
            ) : selectedType === 'control_elaboracion' ? (
              <ControlElaboracionForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('control_elaboracion', 'Y-FO-CC-009', 'Control de elaboración envejecidos y destilados')} />
            ) : selectedType === 'recepcion_pulpas' ? (
              <RecepcionPulpaForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('recepcion_pulpas', 'Y-FO-CC-008', 'Certificado de análisis — recepción de pulpas')} />
            ) : selectedType === 'control_envasado' ? (
              <ControlEnvasadoForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('control_envasado', 'Y-FO-CC-004', 'Control de envasado')} />
            ) : selectedType === 'inspeccion_instalaciones' ? (
              <InspeccionInstalacionesForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_instalaciones', 'Y-FO-SI-010', 'Inspección de las instalaciones')} />
            ) : selectedType === 'control_envejecimiento' ? (
              <ControlEnvejecimientoForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('control_envejecimiento', 'Y-FO-CC-ENV', 'Control de proceso envejecimiento')} />
            ) : selectedType === 'especificaciones_mp' ? (
              <EspecificacionesMateriaPrimaForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('especificaciones_mp', 'Y-FO-CC-056-02', 'Especificaciones de materia prima e insumo')} />
            ) : selectedType === 'inspeccion_contenedores_chasis' ? (
              <InspeccionContenedoresChasisForm initialData={editData} onCancel={() => setModal(false)} onSave={wrapSave('inspeccion_contenedores_chasis', 'Y-FO-SI-004', 'Inspección contenedores, isotanque y chasis')} />
            ) : (
              <div className="bg-white p-6 rounded-xl text-[#1A120E]">Formulario no implementado</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}