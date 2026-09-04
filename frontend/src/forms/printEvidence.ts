import api from '../services/api'
import { printInApp } from './printInApp'

export async function wantEvidence(): Promise<boolean> {
  return window.confirm(
    '¿Imprimir también las evidencias fotográficas?\n\nAceptar = formulario + fotos\nCancelar = solo el formulario',
  )
}

function blobToData(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result))
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}

export async function evidenceSectionHtml(formId: number | null | undefined): Promise<string> {
  if (!formId) {
    return '<p style="font-size:11px;margin-top:14px">Guarde el formulario para incluir fotos.</p>'
  }
  try {
    const { data } = await api.get(`/forms/${formId}/attachments`)
    const list = Array.isArray(data) ? data : []
    if (!list.length) {
      return '<p style="font-size:11px;margin-top:14px">Este registro no tiene evidencias.</p>'
    }
    const figs: string[] = []
    for (const r of list) {
      const res = await api.get(`/forms/attachments/${r.id}/file`, { responseType: 'blob' })
      const url = await blobToData(res.data)
      const name = String(r.filename || 'foto').replace(/</g, '')
      figs.push(
        `<figure style="break-inside:avoid;margin:10px 0">
          <img src="${url}" style="max-width:100%;max-height:380px;border:1px solid #333"/>
          <figcaption style="font-size:10px">${name}</figcaption>
        </figure>`,
      )
    }
    return `<h3 style="margin-top:18px;border-top:1px solid #000;padding-top:8px">Evidencias fotográficas</h3>${figs.join('')}`
  } catch {
    return '<p style="font-size:11px;margin-top:14px">No se pudieron cargar las evidencias.</p>'
  }
}


export async function finishPrintHtml(html: string, formId: number | null | undefined) {
  const withPhotos = await wantEvidence()
  let out = html
  if (withPhotos) {
    const ev = await evidenceSectionHtml(formId)
    out = html.includes('</body>') ? html.replace('</body>', `${ev}</body>`) : html + ev
  }
  printInApp(out)
}

export function signaturesBlock(r: any) {
  const cell = (title: string, sig?: string) => {
    const img = sig && String(sig).startsWith('data:image')
      ? `<img src="${sig}" style="height:42px"/>`
      : `<div style="min-height:42px;font-size:12px">${sig || '—'}</div>`
    return `<td style="width:33%;border:1px solid #1A120E;padding:8px;vertical-align:top">
      <div style="font-size:10px;text-transform:uppercase">${title}</div>${img}</td>`
  }
  return `<table style="width:100%;border-collapse:collapse;margin-top:16px">
    <tr>
      ${cell('Analista / inspector', r.author_signature || r.created_by_name)}
      ${cell('Supervisor', r.supervisor_signature || (r.supervisor_status === 'pending' ? 'PENDIENTE' : ''))}
      ${cell('Gerente / director', r.manager_signature || (r.manager_status === 'pending' ? 'PENDIENTE' : ''))}
    </tr>
  </table>`
}