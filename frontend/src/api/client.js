const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const BASE = API_ORIGIN + '/api'

export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return API_ORIGIN + path
}

console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("MODE:", import.meta.env.MODE);
console.log("PROD:", import.meta.env.PROD);

function getAccessToken() {
  return localStorage.getItem('access')
}

function getRefreshToken() {
  return localStorage.getItem('refresh')
}

function setTokens(access, refresh) {
  localStorage.setItem('access', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No refresh token')
  const res = await fetch(`${BASE}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) throw new Error('Refresh failed')
  const data = await res.json()
  setTokens(data.access)
  return data.access
}

export class ApiError extends Error {
  constructor(status, detail, raw) {
    super(detail || `HTTP ${status}`)
    this.status = status
    this.detail = detail
    this.raw = raw
  }
}

async function request(path, options = {}, retry = true) {
  const accessToken = getAccessToken()
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && retry) {
    try {
      await refreshAccessToken()
      return request(path, options, false)
    } catch {
      clearTokens()
      window.location.href = '/'
      throw new ApiError(401, 'Session expired')
    }
  }

  if (res.status === 204) return null

  const text = await res.text()

  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // Server returned non-JSON (e.g. Django HTML error page on a 500 crash).
    throw new ApiError(
      res.status,
      `Server error (${res.status}) — check the Django console for details.`,
      null,
    )
  }

  if (!res.ok) {
    const detail = json?.detail || json?.non_field_errors?.[0] || `HTTP ${res.status}`
    throw new ApiError(res.status, detail, json)
  }

  return json
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
}
