import { useState } from 'react'

/** Nuevo = objeto vacío + defaults. Editar = initialData del API. Sin localStorage. */
export function useOfficialForm<T extends Record<string, any>>(defaults: T, initialData?: Partial<T> | null) {
  const [f, setF] = useState<T>(() => ({ ...defaults, ...(initialData || {}) } as T))

  const set = (k: keyof T | string, v: any) => setF((p) => ({ ...p, [k]: v }))
  const merge = (patch: Partial<T>) => setF((p) => ({ ...p, ...patch }))
  const reset = () => setF({ ...defaults } as T)

  return { f, setF, set, merge, reset }
}