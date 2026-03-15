import { api } from './client'

export function getActivityLeaderboard(window = '7d') {
  return api.get(`/leaderboard/activity/?window=${window}`)
}

export function getCategoryChampions() {
  return api.get('/leaderboard/category-champions/')
}

export function getMyStats() {
  return api.get('/leaderboard/my-stats/')
}
