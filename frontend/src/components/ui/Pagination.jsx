import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  return (
    <div className={styles.pagination}>
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
    </div>
  )
}
