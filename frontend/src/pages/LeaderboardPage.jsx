import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategoryChampions, getMyStats } from '../api/leaderboard'
import PersonalStatsPanel from '../components/leaderboard/PersonalStatsPanel'
import ActivityLeaderboard from '../components/leaderboard/ActivityLeaderboard'
import CategoryChampionsGrid from '../components/leaderboard/CategoryChampionsGrid'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const isScout = user?.role === 'scout'

  const [champions, setChampions] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const calls = [getCategoryChampions()]
      if (isScout) calls.push(getMyStats())
      const results = await Promise.all(calls)
      setChampions(results[0].champions)
      if (isScout) setMyStats(results[1])
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
        <p className={styles.subtitle}>See how your venturer is progressing through badge requirements.</p>
      </div>

      {isScout && myStats && <PersonalStatsPanel stats={myStats} />}

      <ActivityLeaderboard myStats={myStats} currentUserId={user?.id} />

      {champions && (
        <CategoryChampionsGrid
          champions={champions}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}
