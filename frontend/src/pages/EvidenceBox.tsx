import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

type Props = {
  formId?: number | null
  listUrl?: string
  uploadUrl?: string
  filePrefix?: string
}

export default function EvidenceBox({ formId, listUrl, uploadUrl, filePrefix }: Props) {
  const list = listUrl || (formId ? `/forms/${formId}/attachments` : '')
  const upload = uploadUrl || (formId ? `/forms/${formId}/attachments` : '')
  const prefix = filePrefix || '/forms/attachments'
  const ready = Boolean(list && upload)

  const [rows, setRows] = useState<any[]>([])
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [err, setErr] = useState('')
  const [camOn, setCamOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const load = async () => {
    if (!ready) return
    setErr('')
    try {
      const { data } = await api.get(list)
      const items = Array.isArray(data) ? data : []
      setRows(items)
      const map: Record<number, string> = {}
      for (const r of items) {
        try {
          const res = await api.get(`${prefix}/${r.id}/file`, { responseType: 'blob' })
          map[r.id] = URL.createObjectURL(res.data)
        } catch {
          /* skip */
        }
      }
      setPreviews(map)
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'No se pudieron leer las fotos')
    }
  }

  useEffect(() => {
    load()
    return () => stopCam()
  }, [list])

  const sendBlob = async (blob: Blob, name: string) => {
    if (!upload) return
    const fd = new FormData()
    fd.append('file', blob, name)
    await api.post(upload, fd)
    await load()
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) sendBlob(f, f.name)
    e.target.value = ''
  }

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamOn(false)
  }

  const openCam = async () => {
    setErr('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr('Este navegador no permite cámara. Use Adjuntar.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      setCamOn(true)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => undefined)
        }
      })
    } catch {
      setErr('No se pudo abrir la cámara. Permita el acceso o use Adjuntar.')
    }
  }

  const snap = async () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await sendBlob(blob, `foto-${Date.now()}.jpg`)
      stopCam()
    }, 'image/jpeg', 0.86)
  }

  const remove = async (id: number) => {
    await api.delete(`${prefix}/${id}`)
    await load()
  }

  if (!ready) {
    return (
      <p className="text-sm text-[#8A5A12] bg-[#F7F0E2] rounded-xl px-3 py-2">
        Guarda el registro una vez para poder adjuntar o tomar fotos.
      </p>
    )
  }

  return (
    <div className="rounded-2xl border border-[#E6E2DC] bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#1A120E]">Evidencia fotográfica</p>
      <p className="text-xs text-[#8A8076]">Disco local. Tomar foto usa la cámara; Adjuntar abre archivos.</p>
      {err ? <p className="text-sm text-rose-700">{err}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="px-3 py-2 rounded-full bg-[#DCA54C] text-sm font-semibold" onClick={openCam}>
          Tomar foto
        </button>
        <label className="px-3 py-2 rounded-full border border-[#C9C2B6] text-sm cursor-pointer">
          Adjuntar
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {camOn ? (
        <div className="rounded-xl overflow-hidden border border-[#E6E2DC] bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-72 object-contain bg-black" />
          <div className="flex gap-2 p-2 bg-white">
            <button type="button" className="px-3 py-1.5 rounded-full bg-[#DCA54C] text-sm font-semibold" onClick={snap}>
              Capturar
            </button>
            <button type="button" className="px-3 py-1.5 rounded-full border text-sm" onClick={stopCam}>
              Cerrar cámara
            </button>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-[#E6E2DC] overflow-hidden">
            <img alt={r.filename} className="h-24 w-full object-cover" src={previews[r.id] || ''} />
            <button type="button" className="text-xs text-[#8A5A12] px-2 py-1" onClick={() => remove(r.id)}>
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}