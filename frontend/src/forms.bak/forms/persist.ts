const KEY = 'yazoo-lab-forms-v1'

function readAll(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function loadForm<T>(id: string, fallback: T): T {
  const all = readAll()
  return (all[id] as T) || fallback
}

export function saveForm(id: string, data: unknown) {
  const all = readAll()
  all[id] = data
  localStorage.setItem(KEY, JSON.stringify(all))
}