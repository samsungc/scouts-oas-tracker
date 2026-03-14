import { useState, useEffect, useRef } from 'react'
import { getReviewSubmissions } from '../api/review'
import { getBadges, getBadgeDetail } from '../api/badges'
import ReviewCard from '../components/review/ReviewCard'
import RejectModal from '../components/review/RejectModal'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './ReviewPage.module.css'

const FILTERS = [
  { key: 'submitted', label: 'Pending Review' },
  { key: '', label: 'All Submissions' },
]

export default function ReviewPage() {
  const [filter, setFilter] = useState('submitted')
  const [submissions, setSubmissions] = useState([])
  const [requirementMap, setRequirementMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  // Cache badge details so we don't re-fetch on filter change
  const reqMapRef = useRef(null)

  useEffect(() => {
    loadSubmissions()
  }, [filter])

  async function buildRequirementMap() {
    if (reqMapRef.current) return reqMapRef.current
    const badges = await getBadges()
    const details = await Promise.all(badges.map((b) => getBadgeDetail(b.id)))
    const map = {}
    details.forEach((badge) => {
      badge.requirements.forEach((req) => {
        map[req.id] = { ...req, badgeName: badge.name }
      })
    })
    reqMapRef.current = map
    return map
  }

  async function loadSubmissions() {
    setLoading(true)
    setError('')
    try {
      const [data, map] = await Promise.all([
        getReviewSubmissions(filter || undefined),
        buildRequirementMap(),
      ])
      setSubmissions(data)
      setRequirementMap(map)
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
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
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
            <div className={styles.cards}>
              {submissions.map((sub) => (
                <ReviewCard
                  key={sub.id}
                  submission={sub}
                  requirement={requirementMap[sub.requirement]}
                  onApproved={handleApproved}
                  onRejectClick={setRejectTarget}
                />
              ))}
            </div>
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
