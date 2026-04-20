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

export function getStreakLeaderboard() {
  return api.get('/leaderboard/streaks/')
}

export function getPointsLeaderboard() {
  return api.get('/leaderboard/points/')
}

export function getMyAchievements() {
  return api.get('/leaderboard/my-achievements/')
}

export function getAchievementScouts(achievementId) {
  return api.get(`/leaderboard/achievements/${achievementId}/scouts/`)
}

export function getActivityFeed() {
  return api.get('/leaderboard/activity-feed/')
}
