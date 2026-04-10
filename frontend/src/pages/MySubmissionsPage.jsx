import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSubmissions } from '../api/submissions'
import StatusPill from '../components/ui/StatusPill'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Pagination from '../components/ui/Pagination'
import styles from './MySubmissionsPage.module.css'

const PAGE_SIZE = 20

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function timeSince(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function MySubmissionsPage() {
  const navigate = useNavigate()
  const [allSubmissions, setAllSubmissions] = useState([])
  const [tab, setTab] = useState('active')
  const [pastPage, setPastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getSubmissions()
        setAllSubmissions(data)
      } catch {
        setError('Failed to load submissions. Please try refreshing.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeSubs = useMemo(
    () => allSubmissions.filter((s) => s.status === 'submitted' || s.status === 'rejected'),
    [allSubmissions],
  )

  const pastSubs = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_MS
    return allSubmissions.filter(
      (s) =>
        (s.status === 'approved' || s.status === 'rejected') &&
        new Date(s.submitted_at).getTime() >= cutoff,
    )
  }, [allSubmissions])

  const displayed = tab === 'active' ? activeSubs : pastSubs

  const pastTotalPages = Math.ceil(pastSubs.length / PAGE_SIZE)
  const paginatedPast = pastSubs.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE)
  const displayedList = tab === 'active' ? activeSubs : paginatedPast

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Submissions</h1>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterBtn} ${tab === 'active' ? styles.active : ''}`}
            onClick={() => setTab('active')}
          >
            Active
          </button>
          <button
            className={`${styles.filterBtn} ${tab === 'past' ? styles.active : ''}`}
            onClick={() => { setTab('past'); setPastPage(1) }}
          >
            Past 30 Days
          </button>
        </div>
        {tab === 'past' && (
          <Pagination compact page={pastPage} totalPages={pastTotalPages} onPage={setPastPage} />
        )}
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && displayed.length === 0 && (
        <div className={styles.empty}>
          <p>
            {tab === 'active'
              ? <><Link to="/badges">Browse badges</Link> to start a submission.</>
              : 'No reviewed submissions in the past 30 days.'}
          </p>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <>
          <div className={styles.list}>
            {displayedList.map((sub) => {
              const req = sub.requirement_detail
              return (
                <button
                  key={sub.id}
                  className={styles.card}
                  onClick={() => navigate(`/submit?requirementId=${sub.requirement}`)}
                >
                  <div className={styles.cardMain}>
                    <span className={styles.badgeName}>{req?.badge_name}</span>
                    <span className={styles.reqTitle}>{req?.title}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.submittedAt}>{timeSince(sub.submitted_at)}</span>
                    <StatusPill status={sub.status} />
                  </div>
                </button>
              )
            })}
          </div>
          {tab === 'past' && (
            <Pagination page={pastPage} totalPages={pastTotalPages} onPage={setPastPage} />
          )}
        </>
      )}
    </div>
  )
}
