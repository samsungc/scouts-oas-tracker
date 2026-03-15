import { api } from './client'

export function getBadges() {
  return api.get('/badges/')
}

export function getBadgeDetail(id) {
  return api.get(`/badges/${id}/`)
}

export function getRequirement(id) {
  return api.get(`/badges/requirements/${id}/`)
}

export function importBadgeRecords(file, dryRun = false) {
  const form = new FormData()
  form.append('file', file)
  if (dryRun) form.append('dry_run', 'true')
  return api.post('/badges/import/', form)
}
