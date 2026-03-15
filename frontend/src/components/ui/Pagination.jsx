import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, onPage, compact = false }) {
  if (totalPages <= 1) return null

  return (
    <div className={`${styles.pagination} ${compact ? styles.compact : ''}`}>
      <button
        className={styles.btn}
        onClick={() => onPage(1)}
        disabled={page <= 1}
      >
        «
      </button>
      <button
        className={styles.btn}
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>
      <span className={styles.info}>
        Page {page} of {totalPages}
      </span>
      <button
        className={styles.btn}
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
      <button
        className={styles.btn}
        onClick={() => onPage(totalPages)}
        disabled={page >= totalPages}
      >
        »
      </button>
    </div>
  )
}
