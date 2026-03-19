import { useState, useEffect, useMemo } from 'react'
import { getStreakLeaderboard } from '../../api/leaderboard'
import Pagination from '../ui/Pagination'
import Spinner from '../ui/Spinner'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './ActivityLeaderboard.module.css'

const TABS = [
  { key: 'current', label: 'Current Streak' },
  { key: 'alltime', label: 'All-Time Streak' },
]

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const PAGE_SIZE = 5

export default function StreakLeaderboard({ currentUserId }) {
  const [tab, setTab] = useState('current')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getStreakLeaderboard()
        setData(result)
      } catch {
        setError('Failed to load streak leaderboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [tab])

  const ranked = useMemo(() => {
    if (!data) return []
    const field = tab === 'current' ? 'current_streak' : 'longest_streak'
    const sorted = [...data.entries].sort((a, b) => b[field] - a[field])
    let rank = 1
    let prevVal = null
    let counter = 0
    return sorted.map((entry) => {
      counter++
      const val = entry[field]
      if (val !== prevVal) rank = counter
      prevVal = val
      return { ...entry, rank, streakDays: val }
    })
  }, [data, tab])

  const totalPages = Math.ceil(ranked.length / PAGE_SIZE)
  const pageEntries = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Streak Leaderboard</h2>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.active : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && data && (
        <>
          <div className={styles.tableWrap}>
          {ranked.length === 0 ? (
            <div className={styles.empty}>
              No streak data yet. Start submitting every day!
            </div>
          ) : (
            <div className={styles.table}>
              {pageEntries.map((entry) => {
                const isMe = entry.scout_id === currentUserId
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
                      {isMe && <span className={styles.youBadge}>you</span>}
                    </span>
                    <span className={styles.pts}>
                      {entry.streakDays === 0
                        ? 'No streak'
                        : `🔥 ${entry.streakDays} day${entry.streakDays !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}
