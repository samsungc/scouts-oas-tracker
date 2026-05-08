import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', centered = false }) {
  return (
    <div className={centered ? styles.centered : styles.inline}>
      <div className={`${styles.spinner} ${styles[size]}`} role="status">
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  )
}
