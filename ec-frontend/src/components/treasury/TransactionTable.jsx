import { useState, useEffect } from 'react'
import { getTransactions } from '../../api/treasury'
import TransactionRow from './TransactionRow'
import Spinner from '../ui/Spinner'
import styles from './TransactionTable.module.css'

export default function TransactionTable({
  accountId, newTxn,
  selectedTypes, selectedCategories,
  search, ordering,
  page, onTotalPagesChange,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getTransactions(accountId, {
      page,
      transaction_type: [...selectedTypes],
      category: [...selectedCategories],
      search,
      ordering,
    })
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
          onTotalPagesChange?.(Math.ceil(d.count / (d.results?.length || 1)))
        }
      })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [accountId, page, selectedTypes, selectedCategories, search, ordering]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!newTxn || !data) return
    setData((prev) => ({
      ...prev,
      count: prev.count + 1,
      results: [newTxn, ...prev.results],
    }))
  }, [newTxn]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner centered />
  if (error) return <p className={styles.error}>{error}</p>

  return (
    <div className={styles.wrap}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>By</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {!data || data.results.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No transactions found</td>
              </tr>
            ) : (
              data.results.map((txn) => <TransactionRow key={txn.id} txn={txn} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
