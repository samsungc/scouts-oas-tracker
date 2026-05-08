import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTransactions } from '../../api/treasury'
import styles from './AccountCard.module.css'

function formatAmount(amount) {
  const n = parseFloat(amount)
  return (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AccountCard({ account }) {
  const [recentTxns, setRecentTxns] = useState([])

  useEffect(() => {
    getTransactions(account.id, { page_size: 2 })
      .then((data) => setRecentTxns(data.results || []))
      .catch(() => {})
  }, [account.id])

  const balance = parseFloat(account.balance)

  return (
    <Link to={`/treasurer/accounts/${account.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{account.name}</h3>
        <span className={`${styles.balance} ${balance < 0 ? styles.negative : styles.positive}`}>
          {formatAmount(account.balance)}
        </span>
      </div>

      {recentTxns.length > 0 ? (
        <ul className={styles.txnList}>
          {recentTxns.map((txn) => (
            <li key={txn.id} className={styles.txnRow}>
              <span className={`${styles.typeTag} ${styles[txn.transaction_type]}`}>
                {txn.transaction_type === 'deposit' ? '↑' : '↓'}
              </span>
              <span className={styles.txnNote}>{txn.category.replace(/_/g, ' ')}</span>
              <span className={styles.txnDate}>{formatDate(txn.created_at)}</span>
              <span className={`${styles.txnAmount} ${styles[txn.transaction_type]}`}>
                {txn.transaction_type === 'deposit' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No transactions yet</p>
      )}

      <span className={styles.viewLink}>View ledger →</span>
    </Link>
  )
}
