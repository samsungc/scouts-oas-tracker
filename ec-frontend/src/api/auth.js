import { api, ApiError } from './client'

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api'

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })

  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    const detail = json?.detail || json?.non_field_errors?.[0] || `HTTP ${res.status}`
    throw new ApiError(res.status, detail, json)
  }

  return json
}

export function getMe() {
  return api.get('/users/me/')
}

export function logout() {
  return api.post('/auth/logout/')
}
