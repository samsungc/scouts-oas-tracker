import { api } from './client'

export function getBadges() {
  return api.get('/badges/')
}

export function getBadgeDetail(id) {
  return api.get(`/badges/${id}/`)
}
