import { api } from './client'

export function getHandouts() {
  return api.get('/handouts/')
}

export function markHandedOut(id) {
  return api.patch(`/handouts/${id}/`, { handed_out: true })
}

export function clearHandouts() {
  return api.post('/handouts/clear/')
}
