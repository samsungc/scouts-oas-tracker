import { api, ApiError } from './client'

export async function login(username, password) {
  // Use raw fetch so a 401 (bad credentials) is never mistaken for an
  // expired-session and never triggers a token-refresh + page-redirect.
  const res = await fetch('/api/auth/login/', {
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
