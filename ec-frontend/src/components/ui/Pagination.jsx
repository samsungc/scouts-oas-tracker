import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Prev
      </button>
      <span className={styles.info}>
        {page} / {totalPages}
      </span>
      <button
        className={styles.btn}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </div>
  )
}
