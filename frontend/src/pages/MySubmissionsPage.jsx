import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubmissions } from '../api/submissions'
import StatusPill from '../components/ui/StatusPill'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './MySubmissionsPage.module.css'

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
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getSubmissions()
        setSubmissions(data.filter((s) => s.status === 'submitted'))
      } catch {
        setError('Failed to load submissions. Please try refreshing.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Active Submissions</h1>
        <p className={styles.subtitle}>
          Submissions currently awaiting review by a scouter.
        </p>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && submissions.length === 0 && (
        <div className={styles.empty}>
          <p>No submissions currently pending review.</p>
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className={styles.list}>
          {submissions.map((sub) => {
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
      )}
    </div>
  )
}
