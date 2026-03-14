import { api } from './client'

export function getMe() {
  return api.get('/users/me/')
}

/** Returns all scouts (role=scout). Scouter/admin only. */
export function getScouts() {
  return api.get('/users/scouts/')
}
