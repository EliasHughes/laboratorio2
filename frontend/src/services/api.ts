import axios from 'axios'

const API_HOST = window.location.hostname
const API_PORT = 8010

const api = axios.create({
  baseURL: `http://${API_HOST}:${API_PORT}/api/v1`,
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const url = String(config.url || '')
  if (token && !url.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url || '')
      if (!url.includes('/auth/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api