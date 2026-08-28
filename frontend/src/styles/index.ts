export type  = 'analista' | 'almacen' | 'admin'

export interface User {
  id: number
  username: string
  full_name: string
  email?: string
  role: 
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  code: string
  name: string
  category: string
  unit: string
  min_stock: number
  storage_default?: string
  cas_number?: string
  msds_url?: string
  description?: string
  is_active: boolean
  current_stock?: number
  created_at: string
  updated_at: string
}

export interface Lot {
  id: number
  product_id: number
  lot_number: string
  arrival_date: string
  expiry_date: string
  initial_qty: number
  current_qty: number
  location: string
  status: 'disponible' | 'cuarentena' | 'vencido' | 'agotado' | 'rechazado'
  coa_number?: string
  notes?: string
  product_code?: string
  product_name?: string
  product_unit?: string
  days_to_expiry?: number
  is_near_expiry?: boolean
  is_expired?: boolean
  created_at: string
  updated_at: string
}

export interface Movement {
  id: number
  lot_id: number
  user_id: number
  type: string
  qty: number
  destination?: string
  notes?: string
  lot_number?: string
  product_name?: string
  user_full_name?: string
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}