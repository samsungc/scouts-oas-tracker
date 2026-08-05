import Modal from '../ui/Modal'
import DenominationGrid from './DenominationGrid'
import styles from './TransactionDetailModal.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatCategory(cat) {
  return cat.replace(/_/g, ' ')
}

export default function TransactionDetailModal({ txn, onClose }) {
  const isDeposit = txn.transaction_type === 'deposit'

  return (
    <Modal title={txn.note || formatCategory(txn.category)} onClose={onClose}>
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Date</span>
          <span className={styles.metaValue}>{formatDate(txn.created_at)}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Type</span>
          <span className={`${styles.metaValue} ${styles.capitalize}`}>{txn.transaction_type}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Category</span>
          <span className={`${styles.metaValue} ${styles.capitalize}`}>{formatCategory(txn.category)}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Recorded by</span>
          <span className={styles.metaValue}>{txn.created_by_username}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Amount</span>
          <span className={`${styles.metaValue} ${styles.amount} ${isDeposit ? styles.positive : styles.negative}`}>
            {isDeposit ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className={styles.breakdownLabel}>{isDeposit ? 'Bills / Coins Given' : 'Bills / Coins Taken'}</div>
      <DenominationGrid breakdown={txn.denomination_breakdown} />
    </Modal>
  )
}
