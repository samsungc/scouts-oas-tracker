import styles from './TransactionRow.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  // Bare YYYY-MM-DD must be parsed as local to avoid UTC midnight shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatCategory(cat) {
  return cat.replace(/_/g, ' ')
}

export default function TransactionRow({ txn }) {
  return (
    <>
      {txn.note && (
        <tr className={styles.noteRow}>
          <td colSpan={6} className={styles.noteCell}>{txn.note}</td>
        </tr>
      )}
      <tr className={`${styles.row} ${txn.is_reversal ? styles.reversal : ''} ${txn.note ? styles.rowWithNote : ''}`}>
        <td className={styles.date}>{formatDate(txn.created_at)}</td>
        <td>
          <span className={`${styles.pill} ${styles[txn.transaction_type]}`}>
            {txn.transaction_type}
          </span>
        </td>
        <td className={styles.category}>{formatCategory(txn.category)}</td>
        <td className={`${styles.amount} ${styles[txn.transaction_type]}`}>
          {txn.transaction_type === 'deposit' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
          {txn.is_reversal && <span className={styles.reversalTag}>reversal</span>}
        </td>
        <td className={styles.user}>{txn.created_by_username}</td>
        <td />
      </tr>
    </>
  )
}
