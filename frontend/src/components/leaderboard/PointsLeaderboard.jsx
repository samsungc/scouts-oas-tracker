import { useState, useEffect } from 'react'
import { getPointsLeaderboard } from '../../api/leaderboard'
import Pagination from '../ui/Pagination'
import Spinner from '../ui/Spinner'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './ActivityLeaderboard.module.css'

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const PAGE_SIZE = 5

export default function PointsLeaderboard({ currentUserId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const result = await getPointsLeaderboard()
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
        <h2 className={styles.title}>All-Time Points</h2>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && data && (
        <>
          <div className={styles.tableWrap}>
            {entries.length === 0 ? (
              <div className={styles.empty}>No points earned yet.</div>
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
                      <span className={styles.count}>
                        {entry.total_approved} req{entry.total_approved !== 1 ? 's' : ''}
                      </span>
                      <span className={styles.count}>
                        {entry.completed_badges} badge{entry.completed_badges !== 1 ? 's' : ''}
                      </span>
                      <span className={styles.pts}>{entry.total_points} pts</span>
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
