import { useState, useEffect, useRef, startTransition } from 'react'
import { getReviewSubmissions } from '../api/review'
import { getBadges } from '../api/badges'
import { getScouters } from '../api/users'
import { useAuth } from '../context/AuthContext'
import ReviewCard from '../components/review/ReviewCard'
import RejectModal from '../components/review/RejectModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './ReviewPage.module.css'

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

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Returned' },
]

export default function ReviewPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('submitted')
  const [dateRange, setDateRange] = useState(7)
  const [statusFilter, setStatusFilter] = useState('')
  const [mentionedFilter, setMentionedFilter] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submissions, setSubmissions] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [showAllTimeConfirm, setShowAllTimeConfirm] = useState(false)
  const [allBadges, setAllBadges] = useState([])
  const [scouters, setScouters] = useState([])
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    loadSubmissions()
  }, [filter, dateRange, statusFilter, debouncedSearch, page])

  useEffect(() => {
    getBadges().then(setAllBadges).catch(() => {})
    getScouters().then(data => setScouters(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filter) {
        params.status = filter
      } else {
        if (dateRange !== null) params.days = dateRange
        if (statusFilter) params.status = statusFilter
      }
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      params.page = page

      const data = await getReviewSubmissions(params)
      const results = data.results ?? data
      setSubmissions(Array.isArray(results) ? results : [])
      setTotalPages(data.total_pages ?? 1)
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

  function changeFilter(val) {
    startTransition(() => {
      setPage(1)
      setFilter(val)
      setDateRange(7)
      setStatusFilter('')
      setMentionedFilter(false)
    })
  }

  function changeDateRange(val) {
    startTransition(() => {
      setPage(1)
      setDateRange(val)
    })
  }

  function changeStatusFilter(val) {
    startTransition(() => {
      setPage(1)
      setStatusFilter(val)
    })
  }

  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(val)
    }, 300)
  }

  function handleApproved(updated) {
    if (filter === 'submitted') {
      setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
    } else {
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    }
  }

  function handleRejected(updated) {
    setRejectTarget(null)
    if (filter === 'submitted') {
      setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
    } else {
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
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
              onClick={() => changeFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filter === 'submitted' && (
          <div className={styles.dateRangeGroup}>
            <button
              className={`${styles.dateRangeBtn} ${mentionedFilter ? styles.dateRangeBtnActive : ''}`}
              onClick={() => setMentionedFilter(v => !v)}
            >
              @ Mentioned
            </button>
          </div>
        )}
        {filter === '' && (
          <div className={styles.dateRangeGroup}>
            <div className={styles.btnGroup}>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.key}
                  className={`${styles.dateRangeBtn} ${statusFilter === s.key ? styles.dateRangeBtnActive : ''}`}
                  onClick={() => changeStatusFilter(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className={styles.divider} />
            <div className={styles.btnGroup}>
              {DATE_RANGES.map((r) => (
                <button
                  key={r.days}
                  className={`${styles.dateRangeBtn} ${dateRange === r.days ? styles.dateRangeBtnActive : ''}`}
                  onClick={() => r.days === null ? setShowAllTimeConfirm(true) : changeDateRange(r.days)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by scout name…"
          value={search}
          onChange={handleSearchChange}
        />
        <Pagination page={page} totalPages={totalPages} onPage={setPage} compact />
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (() => {
        const displayedSubs = mentionedFilter && user
          ? submissions.filter(sub =>
              (sub.scouter_comments ?? []).some(c =>
                c.body.includes(`@${user.username}`)
              )
            )
          : submissions

        return displayedSubs.length === 0 ? (
          <div className={styles.empty}>
            <p>
              {mentionedFilter
                ? 'No submissions where you are mentioned.'
                : debouncedSearch
                ? `No submissions found for "${debouncedSearch}".`
                : filter === 'submitted'
                ? 'No submissions pending review.'
                : 'No submissions found.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.cards}>
              {displayedSubs.map((sub) => (
                <ReviewCard
                  key={sub.id}
                  submission={sub}
                  requirement={sub.requirement_detail}
                  onApproved={handleApproved}
                  onRejectClick={setRejectTarget}
                  allBadges={allBadges}
                  scouters={scouters}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )
      })()}

      {rejectTarget && (
        <RejectModal
          submission={rejectTarget}
          onRejected={handleRejected}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {showAllTimeConfirm && (
        <Modal title="Load All Time Data?" onClose={() => setShowAllTimeConfirm(false)}>
          <p>This will fetch all submissions across all time and may take a while to load.</p>
          <div className={styles.modalActions}>
            <Button variant="ghost" onClick={() => setShowAllTimeConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { setShowAllTimeConfirm(false); changeDateRange(null) }}>
              Continue
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
