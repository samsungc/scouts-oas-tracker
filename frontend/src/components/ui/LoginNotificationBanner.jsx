import { useState, useEffect } from 'react'
import { getSubmissions } from '../../api/submissions'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginNotificationBanner.module.css'

export default function LoginNotificationBanner() {
  const { user } = useAuth()
  const [counts, setCounts] = useState(null) // { approved, rejected }
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const since = sessionStorage.getItem('oas_notify_since')
    if (!since || user?.role !== 'scout') return

    async function fetchCounts() {
      try {
        const subs = await getSubmissions()
        const sinceMs = new Date(since).getTime()
        let approved = 0
        let rejected = 0
        for (const sub of subs) {
          if (!sub.reviewed_at) continue
          if (new Date(sub.reviewed_at).getTime() < sinceMs) continue
          if (sub.status === 'approved') approved++
          else if (sub.status === 'rejected') rejected++
        }
        if (approved > 0 || rejected > 0) {
          setCounts({ approved, rejected })
        }
      } finally {
        sessionStorage.removeItem('oas_notify_since')
      }
    }
    fetchCounts()
  }, [user])

  if (dismissed || !counts) return null

  const parts = []
  if (counts.approved > 0)
    parts.push(
      <span key="approved" className={styles.approved}>
        {counts.approved} approved
      </span>,
    )
  if (counts.rejected > 0)
    parts.push(
      <span key="rejected" className={styles.rejected}>
        {counts.rejected} rejected
      </span>,
    )

  return (
    <div className={styles.banner} role="status">
      <span className={styles.text}>
        Since your last login:{' '}
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span className={styles.sep}> and </span>}
            {part}
          </span>
        ))}{' '}
        submission{counts.approved + counts.rejected !== 1 ? 's' : ''} reviewed.
      </span>
      <button
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
