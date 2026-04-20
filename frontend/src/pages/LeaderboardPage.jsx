import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategoryChampions, getMyStats, getMyAchievements } from '../api/leaderboard'
import PersonalStatsPanel from '../components/leaderboard/PersonalStatsPanel'
import AchievementsGrid from '../components/leaderboard/AchievementsGrid'
import PointsLeaderboard from '../components/leaderboard/PointsLeaderboard'
import ActivityLeaderboard from '../components/leaderboard/ActivityLeaderboard'
import StreakLeaderboard from '../components/leaderboard/StreakLeaderboard'
import CategoryChampionsGrid from '../components/leaderboard/CategoryChampionsGrid'
import LiveFeed from '../components/leaderboard/LiveFeed'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './LeaderboardPage.module.css'

const NAV_LABELS = ['All-Time Points', 'Most Active', 'Streaks']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const isScout = user?.role === 'scout'

  const [champions, setChampions] = useState(null)
  const [myStats, setMyStats] = useState(null)
  const [achievements, setAchievements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState(1)

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

  function slot(idx) {
    const d = ((idx - activeIdx) % 3 + 3) % 3
    return d === 0 ? 'center' : d === 1 ? 'right' : 'left'
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

      <div className={styles.carouselWrap}>
        <div className={styles.carouselTrack}>
          <div
            className={`${styles.carouselCard} ${styles[slot(0)]}`}
            onClick={() => slot(0) !== 'center' && setActiveIdx(0)}
          >
            <PointsLeaderboard currentUserId={user?.id} />
          </div>
          <div
            className={`${styles.carouselCard} ${styles[slot(1)]}`}
            onClick={() => slot(1) !== 'center' && setActiveIdx(1)}
          >
            <ActivityLeaderboard myStats={myStats} currentUserId={user?.id} />
          </div>
          <div
            className={`${styles.carouselCard} ${styles[slot(2)]}`}
            onClick={() => slot(2) !== 'center' && setActiveIdx(2)}
          >
            <StreakLeaderboard currentUserId={user?.id} />
          </div>
        </div>

        <div className={styles.carouselNav}>
          <button
            className={styles.carouselNavBtn}
            onClick={() => setActiveIdx((activeIdx + 2) % 3)}
          >
            ← Prev
          </button>
          <div className={styles.carouselDots}>
            {NAV_LABELS.map((label, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${idx === activeIdx ? styles.dotActive : ''}`}
                onClick={() => setActiveIdx(idx)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={styles.carouselNavBtn}
            onClick={() => setActiveIdx((activeIdx + 1) % 3)}
          >
            Next →
          </button>
        </div>
      </div>

      <LiveFeed />

      {champions && (
        <CategoryChampionsGrid
          champions={champions}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}
