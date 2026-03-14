import { useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <span className={styles.icon}>⚜</span>
      <h1 className={styles.heading}>Page Not Found</h1>
      <p className={styles.text}>The page you're looking for doesn't exist.</p>
      <button className={styles.btn} onClick={() => navigate('/badges')}>
        Go to Badges
      </button>
    </div>
  )
}
