import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategoryChampions, getMyStats, getMyAchievements } from '../api/leaderboard'
import PersonalStatsPanel from '../components/leaderboard/PersonalStatsPanel'
import AchievementsGrid from '../components/leaderboard/AchievementsGrid'
import PointsLeaderboard from '../components/leaderboard/PointsLeaderboard'
import ActivityLeaderboard from '../components/leaderboard/ActivityLeaderboard'
import StreakLeaderboard from '../components/leaderboard/StreakLeaderboard'
import CategoryChampionsGrid from '../components/leaderboard/CategoryChampionsGrid'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const isScout = user?.role === 'scout'

  const [champions, setChampions] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [achievements, setAchievements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const calls = [getCategoryChampions(), getMyAchievements()]
      if (isScout) calls.push(getMyStats())
      const results = await Promise.all(calls)
      setChampions(results[0].champions)
      setAchievements(results[1].achievements)
      if (isScout) setMyStats(results[2])
    } catch {
      setError('Failed to load leaderboard. Please try refreshing.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner centered />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.subtitle}>See how you stack up against other Venturers!</p>
      </div>

      {isScout && myStats && <PersonalStatsPanel stats={myStats} />}

      {!isScout && achievements && achievements.length > 0 && (
        <div className={styles.achievementsSection}>
          <h2 className={styles.achievementsTitle}>Scout Achievements</h2>
          <AchievementsGrid achievements={achievements} />
        </div>
      )}

      <PointsLeaderboard currentUserId={user?.id} />

      <ActivityLeaderboard myStats={myStats} currentUserId={user?.id} />

      <StreakLeaderboard currentUserId={user?.id} />

      {champions && (
        <CategoryChampionsGrid
          champions={champions}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}
