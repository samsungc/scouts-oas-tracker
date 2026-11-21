import { SMART_FIELDS } from '../../utils/personalProgression'
import styles from './Progression.module.css'

export function Waiting({ title, children }) {
  return (
    <div className={styles.waiting} role="status">
      <div className={styles.waitingText}>
        <strong>{title}</strong>
        {children && <span>{children}</span>}
      </div>
    </div>
  )
}

export function ReviewerNotes({ sub }) {
  if (sub?.status !== 'rejected') return null
  return (
    <div className={`${styles.notice} ${styles.noticeRejected}`}>
      <span className={styles.noticeTitle}>This was returned for changes</span>
      {sub.reviewer_notes || 'Talk to a Scouter about what needs updating, then submit it again.'}
    </div>
  )
}

export function ProgressRow({ done, total, label = 'approved' }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className={styles.progressRow}>
      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <span>{done} / {total} {label}</span>
    </div>
  )
}

export function SmartDetails({ goal, summary = 'Show SMART details' }) {
  const rows = SMART_FIELDS.filter((f) => goal?.[f.key])
  if (rows.length === 0) return null
  return (
    <details className={styles.details}>
      <summary>{summary}</summary>
      <ul className={styles.smartList}>
        {rows.map((f) => (
          <li key={f.key} className={styles.smartItem}>
            <span className={styles.smartText}>
              <span className={styles.smartLabel}>{f.label}</span>
              {goal[f.key]}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function FilePicker({ files, onChange, id }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        <span className={styles.labelText}>Photos, videos or PDFs</span>
        <span className={styles.prompt}>Optional, up to 10 MB each.</span>
      </label>
      <input
        id={id}
        className={styles.fileInput}
        type="file"
        multiple
        accept="image/*,video/*,.pdf"
        onChange={(e) => onChange([...e.target.files])}
      />
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((f) => <li key={f.name + f.size}>{f.name}</li>)}
        </ul>
      )}
    </div>
  )
}

