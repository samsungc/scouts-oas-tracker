import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import DatePicker from '../ui/DatePicker'
import { createTransaction } from '../../api/treasury'
import { ApiError } from '../../api/client'
import styles from './AddTransactionModal.module.css'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DENOMINATIONS = [10000, 5000, 2000, 1000, 500, 200, 100, 25, 10, 5]
const DENOM_LABELS = {
  10000: '$100', 5000: '$50', 2000: '$20', 1000: '$10',
  500: '$5', 200: '$2', 100: '$1', 25: '25¢', 10: '10¢', 5: '5¢',
}
const DEPOSIT_CATEGORIES = ['registration_fee', 'dues', 'camp_fees', 'program_fees', 'other']
const WITHDRAWAL_CATEGORIES = ['camp_expenses', 'program_expenses', 'admin_expenses', 'other']

function formatCategory(cat) {
  return cat.replace(/_/g, ' ')
}

function emptyBreakdown() {
  return Object.fromEntries(DENOMINATIONS.map((d) => [String(d), '']))
}

function breakdownTotal(breakdown) {
  return DENOMINATIONS.reduce((sum, d) => sum + d * (parseInt(breakdown[String(d)]) || 0), 0)
}

export default function AddTransactionModal({ accounts, defaultAccountId, onClose, onSuccess }) {
  const [accountId, setAccountId] = useState(defaultAccountId ?? (accounts?.[0]?.id ?? ''))
  const [txnType, setTxnType] = useState('deposit')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [breakdown, setBreakdown] = useState(emptyBreakdown())
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayStr())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categoryOptions = txnType === 'deposit' ? DEPOSIT_CATEGORIES : WITHDRAWAL_CATEGORIES

  useEffect(() => { setCategory('') }, [txnType])
  useEffect(() => { setBreakdown(emptyBreakdown()); setAmount('') }, [accountId])

  const selectedAccount = accounts?.find((a) => a.id === accountId)
  const denominationBreakdown = selectedAccount?.denomination_breakdown ?? null
  const balanceCents = selectedAccount ? Math.round(parseFloat(selectedAccount.balance) * 100) : null

  const amountCents = Math.round(parseFloat(amount || 0) * 100)
  const breakdownCents = breakdownTotal(breakdown)
  const anyDenomFilled = DENOMINATIONS.some((d) => breakdown[String(d)] !== '')
  const sumMismatch = amount !== '' && anyDenomFilled && breakdownCents !== amountCents
  const sumMatch = amount !== '' && anyDenomFilled && breakdownCents === amountCents
  const wouldOverdraft = txnType === 'withdrawal' && balanceCents !== null && amountCents > 0 && amountCents > balanceCents

  // Negative counts represent change: on a deposit, bills handed back out of
  // the float; on a withdrawal, bills received back. A denomination is
  // overdrawn when the transaction would leave fewer than zero on hand.
  const sign = txnType === 'deposit' ? 1 : -1
  const overdrawnDenoms = denominationBreakdown
    ? new Set(DENOMINATIONS.filter((d) => {
        const entered = parseInt(breakdown[String(d)]) || 0
        const available = denominationBreakdown[String(d)] ?? 0
        return available + sign * entered < 0
      }))
    : new Set()
  const hasOverdraw = overdrawnDenoms.size > 0
  const hasChange = DENOMINATIONS.some((d) => (parseInt(breakdown[String(d)]) || 0) < 0)

  function setDenom(cents, val) {
    const num = parseInt(val)
    setBreakdown((prev) => ({
      ...prev,
      [String(cents)]: val === '' ? '' : String(isNaN(num) ? 0 : num),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (sumMismatch || hasOverdraw || wouldOverdraft) return
    setError('')
    setLoading(true)
    try {
      const body = {
        transaction_type: txnType,
        category,
        amount: parseFloat(amount),
        denomination_breakdown: Object.fromEntries(
          DENOMINATIONS.map((d) => [String(d), parseInt(breakdown[String(d)]) || 0])
        ),
        note,
        is_reversal: false,
        created_at: date,
      }
      const newTxn = await createTransaction(accountId, body)
      onSuccess(newTxn, accountId)
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
    <Modal title="Add Transaction" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>

        {/* Type toggle */}
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${txnType === 'deposit' ? styles.typeBtnDeposit : ''}`}
            onClick={() => setTxnType('deposit')}
          >
            ↑ Deposit
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${txnType === 'withdrawal' ? styles.typeBtnWithdrawal : ''}`}
            onClick={() => setTxnType('withdrawal')}
          >
            ↓ Withdrawal
          </button>
        </div>

        {/* Date */}
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <DatePicker value={date} onChange={setDate} required />
        </div>

        {/* Account selector (overview modal only) */}
        {!defaultAccountId && accounts && (
          <div className={styles.field}>
            <label className={styles.label}>Account</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={accountId}
                onChange={(e) => setAccountId(parseInt(e.target.value))}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Category + Amount */}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">— Select —</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{formatCategory(cat)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Amount</label>
            <div className={styles.amountWrap}>
              <span className={styles.currencySign}>$</span>
              <input
                className={styles.amountInput}
                type="number"
                min="0.05"
                step="0.05"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Denomination breakdown */}
        <div className={styles.field}>
          <div className={styles.denomHeader}>
            <span className={styles.label}>Denomination Breakdown</span>
            {anyDenomFilled && (
              <span className={sumMatch ? styles.sumOk : sumMismatch ? styles.sumError : styles.sumNeutral}>
                ${(breakdownCents / 100).toFixed(2)}
                {amount !== '' && ` / $${parseFloat(amount || 0).toFixed(2)}`}
                {sumMatch && ' ✓'}
              </span>
            )}
          </div>
          <div className={styles.denomGrid}>
            {DENOMINATIONS.map((d) => {
              const available = denominationBreakdown ? (denominationBreakdown[String(d)] ?? 0) : null
              const isOverdrawn = overdrawnDenoms.has(d)
              return (
                <label key={d} className={`${styles.denomCell} ${breakdown[String(d)] && breakdown[String(d)] !== '0' ? styles.denomFilled : ''} ${isOverdrawn ? styles.denomOverdrawn : ''}`}>
                  <span className={styles.denomLabel}>{DENOM_LABELS[d]}</span>
                  <input
                    className={styles.denomInput}
                    type="number"
                    min={txnType === 'deposit' && available !== null ? -available : undefined}
                    max={txnType === 'withdrawal' && available !== null ? available : undefined}
                    step="1"
                    value={breakdown[String(d)]}
                    onChange={(e) => setDenom(d, e.target.value)}
                    placeholder={txnType === 'withdrawal' && available !== null ? String(available) : '0'}
                  />
                </label>
              )
            })}
          </div>
          <p className={styles.denomHint}>
            {txnType === 'deposit'
              ? 'Enter a negative count for change given back (e.g. received a $20, gave back a $5 → $20: 1, $5: -1).'
              : 'Enter a negative count for change received back (e.g. paid with a $20, got back a $5 → $20: 1, $5: -1).'}
          </p>
          {hasOverdraw && (
            <p className={styles.mismatchMsg}>
              Not enough bills on hand for the highlighted denominations
              {hasChange && txnType === 'deposit' ? ' — you can’t give change you don’t have' : ''}.
            </p>
          )}
          {wouldOverdraft && !hasOverdraw && (
            <p className={styles.mismatchMsg}>
              Withdrawal of ${parseFloat(amount || 0).toFixed(2)} exceeds account balance of ${(balanceCents / 100).toFixed(2)}.
            </p>
          )}
          {sumMismatch && !hasOverdraw && (
            <p className={styles.mismatchMsg}>
              Breakdown sums to ${(breakdownCents / 100).toFixed(2)} but amount is ${parseFloat(amount || 0).toFixed(2)}.
            </p>
          )}
        </div>

        {/* Note */}
        <div className={styles.field}>
          <label className={styles.label}>Note</label>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Brief description…"
            required
          />
        </div>

        {error && <p className={styles.mismatchMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button
            type="submit"
            loading={loading}
            disabled={sumMismatch || hasOverdraw || wouldOverdraft || !category || !note.trim()}
            variant={txnType === 'withdrawal' ? 'danger' : 'primary'}
          >
            {txnType === 'deposit' ? '↑ Add Deposit' : '↓ Add Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
