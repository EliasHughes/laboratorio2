import { useEffect, useState, FormEvent } from 'react'
import api from '../services/api'
import { ShoppingCart, Plus, FileText, Users } from 'lucide-react'

const field =
  'w-full px-3 py-2.5 rounded-md border border-[#D6D0C8] bg-white text-[#1A120E] text-sm placeholder:text-[#9A9188] focus:outline-none focus:ring-2 focus:ring-[#DCA54C]/50'
const label = 'block text-[11px] font-semibold uppercase tracking-wide text-[#5C5046] mb-1.5'

const STATUS: Record<string, string> = {
  draft: 'bg-[#F7F4EF] text-[#5C5046]',
  sent: 'bg-[#E8F1F8] text-[#2B5C8A]',
  partial: 'bg-[#FDF4E7] text-[#E28B14]',
  received: 'bg-[#E9EFDF] text-[#4A5D23]',
  cancelled: 'bg-[#F9EAEA] text-[#8B1E1E]',
}

export default function PurchasesPage() {
  const [tab, setTab] = useState<'po' | 'sup'>('po')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [sup, setSup] = useState({ code: '', name: '', rnc: '', phone: '', email: '', notes: '' })
  const [po, setPo] = useState({
    supplier_id: '',
    currency: 'DOP',
    notes: '',
    product_id: '',
    qty: '',
    unit_price: '',
  })

  const load = async () => {
    const [s, o, p] = await Promise.all([
      api.get('/purchases/suppliers').catch(() => ({ data: [] })),
      api.get('/purchases/orders').catch(() => ({ data: [] })),
      api.get('/products').catch(() => ({ data: [] })),
    ])
    setSuppliers(Array.isArray(s.data) ? s.data : [])
    setOrders(Array.isArray(o.data) ? o.data : [])
    setProducts(Array.isArray(p.data) ? p.data : p.data?.items || [])
  }

  useEffect(() => {
    load()
  }, [])

  const addSupplier = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    setOk('')
    try {
      await api.post('/purchases/suppliers', sup)
      setSup({ code: '', name: '', rnc: '', phone: '', email: '', notes: '' })
      setOk('Proveedor guardado')
      await load()
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail || 'No se guardó el proveedor')
    }
  }

  const addPo = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    setOk('')
    try {
      const { data } = await api.post('/purchases/orders', {
        supplier_id: Number(po.supplier_id),
        currency: po.currency,
        notes: po.notes,
        lines: [{ product_id: Number(po.product_id), qty: Number(po.qty), unit_price: Number(po.unit_price || 0) }],
      })
      setPo({ ...po, product_id: '', qty: '', unit_price: '', notes: '' })
      setOk(`Orden ${data.number} creada`)
      await load()
    } catch (ex: any) {
      setErr(ex?.response?.data?.detail || 'No se creó la OC')
    }
  }

   const receivePo = async (id: number) => {
    setErr('')
    setOk('')
    try {
      const { data } = await api.post(`/purchases/orders/${id}/receive`, {})
      setOk(`Recibida. Lotes: ${data.lots?.length ?? 0}`)
      await load()
    } catch (ex: any) {
      const d = ex?.response?.data?.detail
      setErr(typeof d === 'string' ? d : JSON.stringify(d || 'No se pudo recibir'))
    }
  }

  const totalOpen = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'received').length

  return (
    <div className="space-y-6">
      <div className="yazoo-hero relative overflow-hidden rounded-lg border border-[#3D2E24] bg-[#1A120E] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="kicker text-[10px] tracking-[0.2em] uppercase">Compras · Yazoo</p>
          <h2 className="yazoo-hero-title text-2xl font-semibold mt-1 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#DCA54C]" /> Órdenes y proveedores
          </h2>
          <p className="text-sm mt-1">Primero el proveedor, luego la orden de compra.</p>
        </div>
        <img src="/yazoo.png" alt="" className="h-14 w-14 object-contain shrink-0" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: 'Órdenes', v: orders.length },
          { l: 'Abiertas', v: totalOpen },
          { l: 'Proveedores', v: suppliers.length },
          { l: 'Productos', v: products.length },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-[#E6E2DC] bg-white p-4">
            <p className="text-2xl font-bold text-[#1A120E]">{k.v}</p>
            <p className="text-[11px] uppercase text-[#8A8076]">{k.l}</p>
          </div>
        ))}
      </div>

      <div className="flex rounded-md border border-[#E6E2DC] overflow-hidden w-fit">
        <button type="button" onClick={() => setTab('po')} className={`px-4 py-2 text-sm font-medium ${tab === 'po' ? 'bg-[#DCA54C] text-[#1A120E]' : 'bg-white text-[#5C5046]'}`}>
          Órdenes de compra
        </button>
        <button type="button" onClick={() => setTab('sup')} className={`px-4 py-2 text-sm font-medium border-l border-[#E6E2DC] ${tab === 'sup' ? 'bg-[#DCA54C] text-[#1A120E]' : 'bg-white text-[#5C5046]'}`}>
          Proveedores
        </button>
      </div>

      {err && <div className="text-sm text-[#8B1E1E] bg-[#F9EAEA] border border-[#E8CACA] rounded-md px-3 py-2">{err}</div>}
      {ok && <div className="text-sm text-[#4A5D23] bg-[#E9EFDF] border border-[#C9D6B3] rounded-md px-3 py-2">{ok}</div>}

      {tab === 'sup' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <form onSubmit={addSupplier} className="lg:col-span-2 bg-white border border-[#E6E2DC] rounded-lg p-5 space-y-3">
            <p className="text-sm font-semibold text-[#1A120E]">Nuevo proveedor</p>
            <div>
              <label className={label}>Código</label>
              <input className={field} value={sup.code} onChange={(e) => setSup({ ...sup, code: e.target.value })} />
            </div>
            <div>
              <label className={label}>Razón social *</label>
              <input required className={field} value={sup.name} onChange={(e) => setSup({ ...sup, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>RNC</label>
                <input className={field} value={sup.rnc} onChange={(e) => setSup({ ...sup, rnc: e.target.value })} />
              </div>
              <div>
                <label className={label}>Teléfono</label>
                <input className={field} value={sup.phone} onChange={(e) => setSup({ ...sup, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Correo</label>
              <input type="email" className={field} value={sup.email} onChange={(e) => setSup({ ...sup, email: e.target.value })} />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-md bg-[#DCA54C] text-[#1A120E] text-sm font-semibold flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Guardar
            </button>
          </form>
          <div className="lg:col-span-3 bg-white border border-[#E6E2DC] rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[11px] uppercase text-[#8A8076] bg-[#F7F4EF] border-b border-[#E6E2DC]">
              <span>Código</span><span>Nombre</span><span>RNC</span><span>Teléfono</span>
            </div>
            {suppliers.map((s) => (
              <div key={s.id} className="grid grid-cols-4 gap-2 px-4 py-2.5 text-sm border-b border-[#E6E2DC] text-[#1A120E]">
                <span className="font-medium text-[#C69038]">{s.code}</span>
                <span>{s.name}</span>
                <span>{s.rnc || '—'}</span>
                <span>{s.phone || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'po' && (
        <div className="space-y-4">
          <form onSubmit={addPo} className="bg-white border border-[#E6E2DC] rounded-lg overflow-hidden">
            <div className="h-1 bg-[#DCA54C]" />
            <div className="p-5 space-y-5">
              <p className="text-sm font-semibold text-[#1A120E]">Nueva orden</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={label}>Proveedor *</label>
                  <select required className={field} value={po.supplier_id} onChange={(e) => setPo({ ...po, supplier_id: e.target.value })}>
                    <option value="">Seleccionar…</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Moneda</label>
                  <select className={field} value={po.currency} onChange={(e) => setPo({ ...po, currency: e.target.value })}>
                    <option>DOP</option><option>USD</option><option>EUR</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Condiciones</label>
                  <input className={field} value={po.notes} onChange={(e) => setPo({ ...po, notes: e.target.value })} />
                </div>
              </div>
              <div className="border-t border-[#E6E2DC] pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className={label}>Producto *</label>
                  <select required className={field} value={po.product_id} onChange={(e) => setPo({ ...po, product_id: e.target.value })}>
                    <option value="">Seleccionar…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Cantidad *</label>
                  <input required type="number" step="any" min="0.0001" className={field} value={po.qty} onChange={(e) => setPo({ ...po, qty: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Precio unitario</label>
                  <input type="number" step="any" min="0" className={field} value={po.unit_price} onChange={(e) => setPo({ ...po, unit_price: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2.5 rounded-md bg-[#DCA54C] text-[#1A120E] text-sm font-semibold">
                  Crear orden
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white border border-[#E6E2DC] rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-4 py-2 text-[11px] uppercase text-[#8A8076] bg-[#F7F4EF] border-b border-[#E6E2DC]">
              <span>Número</span><span>Proveedor</span><span>Estado</span><span>Moneda</span><span></span>
            </div>
            {orders.map((o) => (
              <div key={o.id} className="grid grid-cols-5 gap-2 px-4 py-2.5 text-sm border-b border-[#E6E2DC] items-center">
                <span className="font-semibold text-[#1A120E]">{o.number}</span>
                <span className="text-[#1A120E]">{o.supplier_name || '—'}</span>
                <span className={`justify-self-start px-2 py-0.5 rounded text-[11px] uppercase ${STATUS[o.status] || STATUS.draft}`}>
                  {o.status}
                </span>
                <span className="text-[#1A120E]">{o.currency}</span>
                {o.status !== 'received' && o.status !== 'cancelled' ? (
                  <button type="button" className="text-xs text-[#C69038] hover:underline text-left" onClick={() => receivePo(o.id)}>
                    Marcar recibida
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
            {orders.length === 0 && <p className="p-6 text-sm text-[#8A8076]">Aún no hay órdenes.</p>}
          </div>
        </div>
      )}
    </div>
  )
}