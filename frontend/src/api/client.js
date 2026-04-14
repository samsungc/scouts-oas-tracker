const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const BASE = API_ORIGIN + '/api'

export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return API_ORIGIN + path
}

let refreshPromise = null

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const res = await fetch(`${BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Refresh failed')
    // Server sets a new access cookie; nothing to store client-side
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
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
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' })

  if (res.status === 401 && retry) {
    try {
      await refreshAccessToken()
      return request(path, options, false)
    } catch {
      window.dispatchEvent(new CustomEvent('oas:session-expired'))
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
}
