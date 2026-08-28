import { useState } from 'react'

type Props = {
  initialData?: Record<string, string>
  initialStatus?: string
  saving?: boolean
  error?: string
  onCancel?: () => void
  onSave?: (data: Record<string, string>, status: string) => void
}

const empty: Record<string, string> = {
  cliente: '',
  destino: '',
  identificacion: '',
  tipoMuestra: '',
  condiciones: '',
  organoleptica: '',
  fechaRecep: '',
  fechaAnalisis: '',
  desviaciones: '',
  observaciones: '',
  muestraNum: '',
  fechaProd: '',
  fechaVenc: '',
  fuerzaMetodo: 'NORDOM 499',
  fuerzaEsp: '75.00 – 76.20',
  fuerzaRes: '',
  phMetodo: 'NTE INEN 349',
  phEsp: '3.50 – 5.50',
  phRes: '',
  acidezMetodo: 'NORDOM 485',
  acidezEsp: '35.00 – 50.00',
  acidezRes: '',
}

const inp =
  'w-full bg-transparent text-[#1A120E] text-sm px-2 py-1.5 outline-none border-b border-[#c8c2ba]'

function v(s: string | undefined) {
  return s && s.trim() ? s : '—'
}

export default function CertificadoAnalisisForm({
  initialData,
  saving,
  error,
  onCancel,
  onSave,
}: Props) {
  const [h, setH] = useState<Record<string, string>>({ ...empty, ...(initialData || {}) })
  const set = (k: string, val: string) => setH({ ...h, [k]: val })
  const today = new Date().toLocaleDateString('es-DO')

  const imprimir = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Certificado de Análisis</title>
<style>
  body{font-family:Arial,sans-serif;color:#000;padding:16px;font-size:12px}
  table{border-collapse:collapse;width:100%;margin-top:8px}
  td,th{border:1px solid #000;padding:5px 6px;vertical-align:top}
  .lbl{background:#f0f0f0;width:40%;font-weight:600}
  .head{display:grid;grid-template-columns:100px 1fr 170px;border:1px solid #000}
  .head>div{padding:8px}
  .head>div+div{border-left:1px solid #000}
  .center{text-align:center}
</style>
</head>
<body>
<div class="head">
  <div class="center"><img src="${window.location.origin}/yazoo.png" height="56" alt="Yazoo"/></div>
  <div class="center"><b>CERTIFICADO DE ANÁLISIS</b><br/>CERTIFICATE OF ANALYSIS</div>
  <div>CÓDIGO: Y-FO-CC-013<br/>REV.: 01<br/>Página 1 de 2</div>
</div>
<table>
<tr><td class="lbl">Fecha de Emisión / Issue Date</td><td>${today}</td><td class="lbl">N° Certificado / Certificate No.</td><td>${v(h.muestraNum)}</td></tr>
<tr><td class="lbl">NOMBRE DEL CLIENTE / Customer name</td><td colspan="3">${v(h.cliente)}</td></tr>
<tr><td class="lbl">DESTINO DE ENVÍO / Shipping destination</td><td colspan="3">${v(h.destino)}</td></tr>
<tr><td class="lbl">IDENTIFICACIÓN DE LA(S) MUESTRA(S) / Sample identification</td><td colspan="3">${v(h.identificacion)}</td></tr>
<tr><td class="lbl">TIPO DE MUESTRA / Type of sample</td><td colspan="3">${v(h.tipoMuestra)}</td></tr>
<tr><td class="lbl">CONDICIONES INICIALES / Initial conditions</td><td colspan="3">${v(h.condiciones)}</td></tr>
<tr><td class="lbl">CARACTERÍSTICAS ORGANOLÉPTICAS / Organoleptic characteristics</td><td colspan="3">${v(h.organoleptica)}</td></tr>
<tr><td class="lbl">FECHA DE RECEPCIÓN / Reception date</td><td colspan="3">${v(h.fechaRecep)}</td></tr>
<tr><td class="lbl">FECHA DE EJECUCIÓN DEL ANÁLISIS / Date of analysis</td><td colspan="3">${v(h.fechaAnalisis)}</td></tr>
<tr><td class="lbl">DESVIACIONES / EXCLUSIONES DE MÉTODOS</td><td colspan="3">${v(h.desviaciones)}</td></tr>
<tr><td class="lbl">OBSERVACIONES / Observations</td><td colspan="3">${v(h.observaciones)}</td></tr>
</table>
<table>
<tr><th>MUESTRA NÚMERO / Sample No.</th><th>FECHA DE PRODUCCIÓN / Production date</th><th>FECHA DE VENCIMIENTO / Expiry date</th></tr>
<tr class="center"><td>${v(h.muestraNum)}</td><td>${v(h.fechaProd)}</td><td>${v(h.fechaVenc)}</td></tr>
</table>
<table>
<tr><th colspan="4">ANÁLISIS FISICOQUÍMICO / Physical and Chemical Analysis</th></tr>
<tr><th>Parámetro / Parameter</th><th>MÉTODO / Method</th><th>ESPECIFICACIONES / Spec.</th><th>RESULTADOS / Results</th></tr>
<tr><td>Fuerza real (°GL) / Real force (°GL)</td><td>${v(h.fuerzaMetodo)}</td><td>${v(h.fuerzaEsp)}</td><td>${v(h.fuerzaRes)}</td></tr>
<tr><td>pH (20 °C)</td><td>${v(h.phMetodo)}</td><td>${v(h.phEsp)}</td><td>${v(h.phRes)}</td></tr>
<tr><td>Acidez total (mgAA/100 ml AA) / Total acidity</td><td>${v(h.acidezMetodo)}</td><td>${v(h.acidezEsp)}</td><td>${v(h.acidezRes)}</td></tr>
</table>
<p style="font-size:10px;margin-top:16px">Yazoo Investments, S.R.L. · San Pedro de Macorís, RD · Y-FO-CC-013 Rev. 01</p>
</body></html>`

    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) {
      window.alert('Permite ventanas emergentes para imprimir')
      return
    }
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="w-full">
      <div className="print:hidden flex items-center justify-end gap-2 mb-4">
        <button type="button" onClick={() => onCancel?.()} className="px-4 py-2 rounded-full text-sm border border-[#D6D0C8] bg-white">
          Cancelar
        </button>
        <button type="button" onClick={imprimir} className="px-4 py-2 rounded-full text-sm border border-[#D6D0C8] bg-white">
          Imprimir
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave?.(h, 'borrador')}
          className="px-5 py-2 rounded-full text-sm font-semibold bg-[#DCA54C] text-[#1A120E] disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
      {error && <p className="text-sm text-rose-700 mb-2">{error}</p>}

      <article className="bg-white rounded-2xl border border-[#E6E2DC] p-8">
        <header className="flex items-center gap-6 pb-6 border-b border-[#E6E2DC]">
          <img src="/yazoo.png" alt="Yazoo" className="h-20 object-contain" />
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold">CERTIFICADO DE ANÁLISIS</p>
            <p className="text-sm italic text-[#5C5046]">CERTIFICATE OF ANALYSIS</p>
            <p className="text-xs text-[#8A8076]">Y-FO-CC-013 · Rev. 01</p>
          </div>
          <div className="text-right text-xs">
            <p>Emisión</p>
            <p>{today}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6">
          {[
            ['Número de certificado / Certificate No.', 'muestraNum'],
            ['Nombre del cliente / Customer name', 'cliente'],
            ['Destino de envío / Shipping destination', 'destino'],
            ['Identificación de la muestra / Sample identification', 'identificacion'],
            ['Tipo de muestra / Type of sample', 'tipoMuestra'],
            ['Condiciones iniciales / Initial conditions', 'condiciones'],
            ['Características organolépticas / Organoleptic characteristics', 'organoleptica'],
            ['Fecha de recepción / Reception date', 'fechaRecep'],
            ['Fecha de análisis / Date of analysis', 'fechaAnalisis'],
            ['Fecha de producción / Production date', 'fechaProd'],
            ['Fecha de vencimiento / Expiry date', 'fechaVenc'],
            ['Desviaciones de método / Method deviations', 'desviaciones'],
          ].map(([lab, key]) => (
            <label key={key} className="block">
              <span className="text-xs text-[#8A8076]">{lab}</span>
              <input className={inp} value={h[key] || ''} onChange={(e) => set(key, e.target.value)} />
            </label>
          ))}
          <label className="md:col-span-2 block">
            <span className="text-xs text-[#8A8076]">Observaciones / Observations</span>
            <input className={inp} value={h.observaciones || ''} onChange={(e) => set('observaciones', e.target.value)} />
          </label>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold">Análisis fisicoquímico / Physical and Chemical Analysis</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1A120E] text-white">
              <th className="px-3 py-2 text-left">Parámetro / Parameter</th>
              <th className="px-3 py-2 text-left">Método / Method</th>
              <th className="px-3 py-2 text-left">Especificación / Spec.</th>
              <th className="px-3 py-2 text-left">Resultado / Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2">Fuerza real (°GL) / Real force (°GL)</td>
              <td><input className={inp} value={h.fuerzaMetodo} onChange={(e) => set('fuerzaMetodo', e.target.value)} /></td>
              <td><input className={inp} value={h.fuerzaEsp} onChange={(e) => set('fuerzaEsp', e.target.value)} /></td>
              <td><input className={inp} value={h.fuerzaRes} onChange={(e) => set('fuerzaRes', e.target.value)} /></td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2">pH (20 °C)</td>
              <td><input className={inp} value={h.phMetodo} onChange={(e) => set('phMetodo', e.target.value)} /></td>
              <td><input className={inp} value={h.phEsp} onChange={(e) => set('phEsp', e.target.value)} /></td>
              <td><input className={inp} value={h.phRes} onChange={(e) => set('phRes', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="px-3 py-2">Acidez total / Total acidity</td>
              <td><input className={inp} value={h.acidezMetodo} onChange={(e) => set('acidezMetodo', e.target.value)} /></td>
              <td><input className={inp} value={h.acidezEsp} onChange={(e) => set('acidezEsp', e.target.value)} /></td>
              <td><input className={inp} value={h.acidezRes} onChange={(e) => set('acidezRes', e.target.value)} /></td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  )
}