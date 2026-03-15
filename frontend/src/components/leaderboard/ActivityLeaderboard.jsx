import { useState, useEffect } from 'react'
import { getActivityLeaderboard } from '../../api/leaderboard'
import Pagination from '../ui/Pagination'
import Spinner from '../ui/Spinner'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './ActivityLeaderboard.module.css'

const WINDOWS = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
]

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const PAGE_SIZE = 5

export default function ActivityLeaderboard({ myStats, currentUserId }) {
  const [window, setWindow] = useState('7d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    load(window)
  }, [window])

  async function load(w) {
    setLoading(true)
    setError('')
    try {
      const result = await getActivityLeaderboard(w)
      setData(result)
    } catch {
      setError('Failed to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  const entries = data?.entries ?? []
  const totalPages = Math.ceil(entries.length / PAGE_SIZE)
  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Most Active Scouts</h2>
        <div className={styles.tabs}>
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              className={`${styles.tab} ${window === w.key ? styles.active : ''}`}
              onClick={() => setWindow(w.key)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && data && (
        <>
          {entries.length === 0 ? (
            <div className={styles.empty}>
              No activity in this period yet. Start submitting to climb the board!
            </div>
          ) : (
            <div className={styles.table}>
              {pageEntries.map((entry) => {
                const isMe = entry.scout_id === currentUserId
                const streakDays = myStats?.current_streak_days || 0
                const showFlame = isMe && streakDays >= 3

                return (
                  <div
                    key={entry.scout_id}
                    className={`${styles.row} ${isMe ? styles.myRow : ''}`}
                  >
                    <span className={`${styles.rank} ${styles[`rank${Math.min(entry.rank, 4)}`]}`}>
                      {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                    </span>
                    <span className={styles.name}>
                      {entry.scout_display_name}
                      {showFlame && <span className={styles.flame}>🔥</span>}
                      {isMe && <span className={styles.youBadge}>you</span>}
                    </span>
                    <span className={styles.count}>
                      {entry.approved_count} req{entry.approved_count !== 1 ? 's' : ''}
                    </span>
                    <span className={styles.pts}>{entry.points} pts</span>
                  </div>
                )
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}
