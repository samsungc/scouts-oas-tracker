import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import DatePicker from '../ui/DatePicker'
import { getAccounts, createStatement } from '../../api/treasury'
import { ApiError } from '../../api/client'
import styles from './CreateStatementModal.module.css'

export default function CreateStatementModal({ onClose, onSuccess }) {
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [accounts, setAccounts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAccounts().then((data) => {
      setAccounts(data)
      if (data.length > 0) setSelectedId(String(data[0].id))
    }).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedId) { setError('Select an account.'); return }
    setError('')
    setLoading(true)
    try {
      const statement = await createStatement({
        period_start: periodStart,
        period_end: periodEnd,
        account_ids: [parseInt(selectedId)],
      })
      onSuccess(statement)
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.raw) {
        const msgs = Object.values(err.raw).flat().join(' ')
        setError(msgs || err.message)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Financial Report" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>

        <div className={styles.field}>
          <label className={styles.label}>Account</label>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Period Start</label>
            <DatePicker
              value={periodStart}
              onChange={setPeriodStart}
              placeholder="Start date"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Period End</label>
            <DatePicker
              value={periodEnd}
              onChange={setPeriodEnd}
              placeholder="End date"
              required
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading} disabled={!selectedId}>
            Create Report
          </Button>
        </div>
      </form>
    </Modal>
  )
}
