import { api } from './client'

export function getMe() {
  return api.get('/users/me/')
}

export function updateMe(data) {
  return api.patch('/users/me/', data)
}

export function changePassword(currentPassword, newPassword) {
  return api.post('/users/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

/** Returns all scouts (role=scout). Scouter/admin only. */
export function getScouts() {
  return api.get('/users/scouts/')
}

/**
 * Returns per-scout badge stats + aggregate summary counts.
 * Much faster than loading all submissions client-side.
 */
export function getScoutStats() {
  return api.get('/users/scouts/stats/')
}

/** Create a new user. Scouter/admin only. */
export function createUser(data) {
  return api.post('/users/create/', data)
}

/** Deactivate a user (set is_active=False). Scouter/admin only. */
export function deactivateUser(id) {
  return api.patch(`/users/${id}/deactivate/`)
}
