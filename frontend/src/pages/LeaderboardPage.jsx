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
  const [bannerDismissed, setBannerDismissed] = useState(
    () => sessionStorage.getItem('leaderboard_banner_dismissed') === '1'
  )

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

  function dismissBanner() {
    sessionStorage.setItem('leaderboard_banner_dismissed', '1')
    setBannerDismissed(true)
  }

  if (loading) return <Spinner centered />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.subtitle}>See how your venturer is progressing through badge requirements.</p>
      </div>

      {!bannerDismissed && champions && (
        <GroupMilestoneBanner champions={champions} onDismiss={dismissBanner} />
      )}

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

function GroupMilestoneBanner({ champions, onDismiss }) {
  const totalChampions = champions.filter((c) => c.champion !== null).length
  if (totalChampions === 0) return null

  return (
    <div className={styles.banner}>
      <span>
        🏕️ Your venturer has claimed {totalChampions} out of 10 category champion{totalChampions !== 1 ? 's' : ''}! Keep going!
      </span>
      <button className={styles.bannerClose} onClick={onDismiss}>✕</button>
    </div>
  )
}
