import styles from './StatusPill.module.css'

const LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function StatusPill({ status }) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
