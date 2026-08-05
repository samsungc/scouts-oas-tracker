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
    <tr className={`${styles.row} ${txn.is_reversal ? styles.reversal : ''}`}>
      <td className={styles.dateTitle}>
        {txn.note && <span className={styles.noteText}>{txn.note}</span>}
        <span className={styles.date}>{formatDate(txn.created_at)}</span>
      </td>
      <td className={styles.category}>{formatCategory(txn.category)}</td>
      <td className={styles.user}>{txn.created_by_username}</td>
      <td className={`${styles.amount} ${styles[txn.transaction_type]}`}>
        {txn.transaction_type === 'deposit' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
        {txn.is_reversal && <span className={styles.reversalTag}>reversal</span>}
      </td>
    </tr>
  )
}
