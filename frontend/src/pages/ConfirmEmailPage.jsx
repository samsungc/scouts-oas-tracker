import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { confirmEmailChange } from '../api/users'
import styles from './LoginPage.module.css'

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid confirmation link. Please request a new one from your profile.')
      return
    }

    confirmEmailChange(token)
      .then((data) => {
        setStatus('success')
        setMessage(data?.detail || 'Your email has been confirmed.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.detail || 'This confirmation link is invalid or has expired.')
      })
  }, [token])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <span className={styles.logoIcon}>&#x269C;</span>
          <h1 className={styles.heading}>Email Confirmation</h1>
        </div>

        {status === 'loading' && (
          <p className={styles.hint}>Confirming your email address...</p>
        )}

        {status === 'success' && (
          <>
            <p className={styles.hint}>{message}</p>
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
