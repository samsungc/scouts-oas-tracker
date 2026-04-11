import { api, ApiError } from './client'

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api'

export async function requestPasswordReset(email) {
  const res = await fetch(`${BASE}/users/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) {
    const detail = json?.detail || `HTTP ${res.status}`
    throw new ApiError(res.status, detail, json)
  }
  return json
}

export async function confirmPasswordReset(token, newPassword) {
  const res = await fetch(`${BASE}/users/password-reset/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) {
    const detail = json?.detail || json?.new_password?.[0] || `HTTP ${res.status}`
    throw new ApiError(res.status, detail, json)
  }
  return json
}

export async function login(username, password) {
  // Use raw fetch so a 401 (bad credentials) is never mistaken for an
  // expired-session and never triggers a token-refresh + page-redirect.
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    const detail = json?.detail || json?.non_field_errors?.[0] || `HTTP ${res.status}`
    throw new ApiError(res.status, detail, json)
  }

  api.setTokens(json.access, json.refresh)
  return json
}
