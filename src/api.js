const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL
const defaultApiBaseUrl = import.meta.env.PROD
  ? 'https://hallbook-backend.onrender.com/api'
  : 'http://localhost:5000/api'

const apiBaseUrl = (configuredApiBaseUrl || defaultApiBaseUrl)
  .trim()
  .replace(/\/+$/, '')

export function apiUrl(path) {
  return `${apiBaseUrl}/${path.replace(/^\/+/, '')}`
}
