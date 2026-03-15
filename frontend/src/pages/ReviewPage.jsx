import { useState, useEffect } from 'react'
import { getReviewSubmissions } from '../api/review'
import ReviewCard from '../components/review/ReviewCard'
import RejectModal from '../components/review/RejectModal'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Pagination from '../components/ui/Pagination'
import styles from './ReviewPage.module.css'

const PAGE_SIZE = 20

const FILTERS = [
  { key: 'submitted', label: 'Pending Review' },
  { key: '', label: 'All Submissions' },
]

const DATE_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last month', days: 30 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
]

export default function ReviewPage() {
  const [filter, setFilter] = useState('submitted')
  const [dateRange, setDateRange] = useState(7)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    loadSubmissions()
  }, [filter, dateRange])

  async function loadSubmissions() {
    setLoading(true)
    setError('')
    try {
      const params = filter ? { status: filter } : { days: dateRange ?? undefined }
      const data = await getReviewSubmissions(params)
      setSubmissions(data)
    } catch (err) {
      if (err.status === 403) {
        setError('You do not have permission to view this page.')
      } else {
        setError('Failed to load submissions. Please try refreshing.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleApproved(updated) {
    if (filter === 'submitted') {
      setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
    } else {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      )
    }
  }

  function handleRejected(updated) {
    setRejectTarget(null)
    if (filter === 'submitted') {
      setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
    } else {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      )
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Review Submissions</h1>
        <p className={styles.subtitle}>
          Review and approve or reject scout badge submissions.
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
              onClick={() => { setFilter(f.key); setDateRange(7) }}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filter === '' && (
          <div className={styles.dateRangeGroup}>
            {DATE_RANGES.map((r) => (
              <button
                key={r.days}
                className={`${styles.dateRangeBtn} ${dateRange === r.days ? styles.dateRangeBtnActive : ''}`}
                onClick={() => setDateRange(r.days)}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
        {!loading && !error && submissions.length > PAGE_SIZE && (
          <Pagination
            compact
            page={page}
            totalPages={Math.ceil(submissions.length / PAGE_SIZE)}
            onPage={setPage}
          />
        )}
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {submissions.length === 0 ? (
            <div className={styles.empty}>
              <p>
                {filter === 'submitted'
                  ? 'No submissions pending review.'
                  : 'No submissions found.'}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.cards}>
                {submissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((sub) => (
                  <ReviewCard
                    key={sub.id}
                    submission={sub}
                    requirement={sub.requirement_detail}
                    onApproved={handleApproved}
                    onRejectClick={setRejectTarget}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={Math.ceil(submissions.length / PAGE_SIZE)}
                onPage={setPage}
              />
            </>
          )}
        </>
      )}

      {rejectTarget && (
        <RejectModal
          submission={rejectTarget}
          onRejected={handleRejected}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
