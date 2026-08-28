import { useEffect, useMemo, useState, FormEvent } from 'react'
import PageHeader from '../components/PageHeader'
import api from '../services/api'
import {
  Package,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react'


const CATEGORIES = [
  'reactivo',
  'insumo',
  'material',
  'consumible',
  'solucion',
  'muestra',
  'licor',
  'otro',
]

type Product = {
  id: number
  code: string
  name: string
  category?: string
  unit?: string
  min_stock?: number
  description?: string
  is_active?: boolean
  current_stock?: number
}

type Lot = {
  id: number
  product_id: number
  lot_number?: string
  lot_code?: string
  initial_qty?: number
  current_qty?: number
  quantity?: number
  expiry_date?: string
  arrival_date?: string
  location?: string
  status?: string
  supplier?: string
  coa_number?: string
  notes?: string
}

export default function InventoryPage() {
  const [tab, setTab] = useState<'products' | 'lots'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('reactivo')
  const [unit, setUnit] = useState('ml')
  const [minStock, setMinStock] = useState('0')
  const [description, setDescription] = useState('')

  

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, l] = await Promise.all([
        api.get('/products'),
        api.get('/lots').catch(() => ({ data: [] })),
      ])
      setProducts(Array.isArray(p.data) ? p.data : p.data?.items || [])
      setLots(Array.isArray(l.data) ? l.data : l.data?.items || [])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error cargando inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const productMap = useMemo(() => {
    const m = new Map<number, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter((p) => {
      if (catFilter && (p.category || '') !== catFilter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    })
  }, [products, search, catFilter])

  const filteredLots = useMemo(() => {
    const q = search.toLowerCase()
    return lots.filter((l) => {
      const prod = productMap.get(l.product_id)
      const st = (l.status || '').toLowerCase()
      if (statusFilter && st !== statusFilter) return false
      if (catFilter && (prod?.category || '') !== catFilter) return false
      if (!q) return true
      const lotNo = (l.lot_number || l.lot_code || '').toLowerCase()
      return (
        lotNo.includes(q) ||
        (prod?.name || '').toLowerCase().includes(q) ||
        (prod?.code || '').toLowerCase().includes(q) ||
        (l.location || '').toLowerCase().includes(q)
      )
    })
  }, [lots, productMap, search, catFilter, statusFilter])

  const openNew = () => {
    setCode('')
    setName('')
    setCategory('reactivo')
    setUnit('ml')
    setMinStock('0')
    setDescription('')
    setError('')
    setModal(true)
  }

  const saveProduct = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setOk('')
    try {
      await api.post('/products', {
        code: code.trim(),
        name: name.trim(),
        category,
        unit: unit.trim() || 'und',
        min_stock: parseFloat(minStock) || 0,
        description: description || null,
      })
      setModal(false)
      setOk('Producto creado')
      await load()
      setTimeout(() => setOk(''), 3000)
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : 'Error al guardar producto')
    } finally {
      setSaving(false)
    }
  }

  const statusClass = (s?: string) => {
    const v = (s || '').toLowerCase()
    if (v === 'vencido') return 'text-rose-400'
    if (v === 'por_vencer') return 'text-amber-400'
    if (v === 'cuarentena') return 'text-sky-400'
    if (v === 'agotado') return 'text-stone-500'
    return 'text-emerald-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-stone-50 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Inventario y Lotes
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            Maestro de productos · lotes FEFO · categorías de laboratorio
          </p>
        </div>
        {tab === 'products' && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-[#1a120c] text-sm font-semibold hover:bg-amber-400"
          >
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        )}
      </div>

      {ok && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {ok}
        </div>
      )}
      {error && !modal && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-caribe-border pb-2">
        <button
          type="button"
          onClick={() => setTab('products')}
          className={`px-4 py-2 text-sm rounded-lg ${
            tab === 'products' ? 'bg-amber-500 text-[#1a120c] font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Productos
        </button>
        <button
          type="button"
          onClick={() => setTab('lots')}
          className={`px-4 py-2 text-sm rounded-lg flex items-center gap-1.5 ${
            tab === 'lots' ? 'bg-amber-500 text-[#1a120c] font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Lotes
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código, nombre, lote..."
            className="w-full pl-10 pr-3 py-2.5 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2.5 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {tab === 'lots' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-caribe-card border border-caribe-border rounded-lg text-sm text-stone-100"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">disponible</option>
            <option value="por_vencer">por_vencer</option>
            <option value="vencido">vencido</option>
            <option value="cuarentena">cuarentena</option>
            <option value="agotado">agotado</option>
          </select>
        )}
      </div>

      <div className="rounded-xl border border-caribe-border bg-caribe-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Cargando...
          </div>
        ) : tab === 'products' ? (
          filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-sm">
              No hay productos. Crea el primero para poder registrar recepciones.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500 uppercase border-b border-caribe-border">
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Unidad</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const low =
                      p.min_stock != null &&
                      p.current_stock != null &&
                      p.current_stock <= p.min_stock
                    return (
                      <tr key={p.id} className="border-b border-caribe-border/40 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-xs text-amber-400">{p.code}</td>
                        <td className="px-4 py-2.5 text-stone-100">{p.name}</td>
                        <td className="px-4 py-2.5 text-stone-400 text-xs">{p.category || '—'}</td>
                        <td className="px-4 py-2.5 text-stone-400">{p.unit || '—'}</td>
                        <td className={`px-4 py-2.5 ${low ? 'text-rose-400 font-medium' : 'text-stone-200'}`}>
                          {p.current_stock ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-stone-500">{p.min_stock ?? 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : filteredLots.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            No hay lotes. Regístralos en Recepción / Ingresos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 uppercase border-b border-caribe-border">
                  <th className="px-4 py-3">Lote</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Vence</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {filteredLots.map((l) => {
                  const prod = productMap.get(l.product_id)
                  const qty = l.current_qty ?? l.quantity ?? 0
                  return (
                    <tr key={l.id} className="border-b border-caribe-border/40 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-xs text-amber-400">
                        {l.lot_number || l.lot_code || `LOT-${l.id}`}
                      </td>
                      <td className="px-4 py-2.5 text-stone-200">
                        {prod ? `${prod.code} — ${prod.name}` : l.product_id}
                      </td>
                      <td className="px-4 py-2.5 text-stone-300">
                        {qty} {prod?.unit || ''}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-stone-500">{l.expiry_date || '—'}</td>
                      <td className={`px-4 py-2.5 text-xs font-medium ${statusClass(l.status)}`}>
                        {l.status || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-stone-400">{l.location || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal nuevo producto */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={saveProduct}
            className="w-full max-w-md bg-caribe-card border border-caribe-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-100">Nuevo producto</h3>
              <button type="button" onClick={() => setModal(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Código *</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                placeholder="P-001 / REA-HCl-01"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Nombre *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1 uppercase">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1 uppercase">Unidad</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
                  placeholder="ml, g, und..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Stock mínimo</label>
              <input
                type="number"
                step="any"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1 uppercase">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-caribe-dark border border-caribe-border rounded-lg text-sm text-stone-100 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-stone-400">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-[#1a120c] text-sm font-semibold disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

