import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import styles from './LoginPage.module.css'

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link. Please contact your group admin.')
      return
    }

    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

    fetch(`${apiBase}/api/users/unsubscribe/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setStatus('success')
          setMessage(data.detail || 'You have been unsubscribed.')
        } else {
          setStatus('error')
          setMessage(data.detail || 'This unsubscribe link is invalid or has already been used.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Could not connect to the server. Please try again later.')
      })
  }, [token])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>&#x269C;</span>
          <h1 className={styles.heading}>Email Preferences</h1>
        </div>

        {status === 'loading' && (
          <p className={styles.hint}>Processing your request...</p>
        )}

        {status === 'success' && (
          <>
            <p className={styles.hint}>{message}</p>
            <p className={styles.hint}>
              You will no longer receive email notifications from OAS Badge Tracker.
              You can re-enable them at any time by signing in and updating your profile.
            </p>
            <p className={styles.hint}>
              <Link to="/">Back to sign in</Link>
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <p className={styles.error}>{message}</p>
            <p className={styles.hint}>
              <Link to="/">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
