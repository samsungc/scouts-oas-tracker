import { useState, useEffect } from 'react'
import { getAccounts, createAccount, createTransaction } from '../api/treasury'
import { useAuth } from '../context/AuthContext'
import AccountCard from '../components/treasury/AccountCard'
import AddTransactionModal from '../components/treasury/AddTransactionModal'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import IconPlus from '../components/icons/IconPlus'
import styles from './TreasurerOverviewPage.module.css'

const DENOMINATIONS = [10000, 5000, 2000, 1000, 500, 200, 100, 25, 10, 5]
const DENOM_LABELS = {
  10000: '$100', 5000: '$50', 2000: '$20', 1000: '$10',
  500: '$5', 200: '$2', 100: '$1', 25: '25¢', 10: '10¢', 5: '5¢',
}

function emptyBreakdown() {
  return Object.fromEntries(DENOMINATIONS.map((d) => [String(d), '']))
}

function breakdownTotal(breakdown) {
  return DENOMINATIONS.reduce((sum, d) => sum + d * (parseInt(breakdown[String(d)]) || 0), 0)
}

function NewAccountModal({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [breakdown, setBreakdown] = useState(emptyBreakdown())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const amountCents = Math.round(parseFloat(amount || 0) * 100)
  const breakdownCents = breakdownTotal(breakdown)
  const anyDenomFilled = DENOMINATIONS.some((d) => breakdown[String(d)] !== '')
  const sumMismatch = amount !== '' && anyDenomFilled && breakdownCents !== amountCents
  const sumMatch = amount !== '' && anyDenomFilled && breakdownCents === amountCents

  function setDenom(cents, val) {
    const num = parseInt(val)
    setBreakdown((prev) => ({
      ...prev,
      [String(cents)]: val === '' ? '' : String(Math.max(0, isNaN(num) ? 0 : num)),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || sumMismatch) return
    setSaving(true)
    setError('')
    try {
      const account = await createAccount({ name: name.trim() })
      if (parseFloat(amount) > 0) {
        await createTransaction(account.id, {
          transaction_type: 'deposit',
          category: 'other',
          amount: parseFloat(amount),
          denomination_breakdown: Object.fromEntries(
            DENOMINATIONS.map((d) => [String(d), parseInt(breakdown[String(d)]) || 0])
          ),
          note: 'Opening Balance',
          is_reversal: false,
          is_opening_balance: true,
        })
      }
      onSuccess(account)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="New Account" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.newAccountForm}>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Account Name</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Regular Account 2025–26"
            autoFocus
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Opening Balance <span className={styles.fieldOptional}>(optional)</span></label>
          <div className={styles.amountWrap}>
            <span className={styles.currencySign}>$</span>
            <input
              className={styles.amountInput}
              type="number"
              min="0.05"
              step="0.05"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.denomHeader}>
            <label className={styles.fieldLabel}>Bill Breakdown <span className={styles.fieldOptional}>(optional)</span></label>
            {anyDenomFilled && (
              <span className={sumMatch ? styles.sumOk : sumMismatch ? styles.sumError : styles.sumNeutral}>
                ${(breakdownCents / 100).toFixed(2)}
                {amount !== '' && ` / $${parseFloat(amount || 0).toFixed(2)}`}
                {sumMatch && ' ✓'}
              </span>
            )}
          </div>
          <div className={styles.denomGrid}>
            {DENOMINATIONS.map((d) => (
              <label
                key={d}
                className={`${styles.denomCell} ${breakdown[String(d)] && breakdown[String(d)] !== '0' ? styles.denomFilled : ''}`}
              >
                <span className={styles.denomLabel}>{DENOM_LABELS[d]}</span>
                <input
                  className={styles.denomInput}
                  type="number"
                  min="0"
                  step="1"
                  value={breakdown[String(d)]}
                  onChange={(e) => setDenom(d, e.target.value)}
                  placeholder="0"
                />
              </label>
            ))}
          </div>
          {sumMismatch && (
            <p className={styles.sumErrorMsg}>
              Breakdown sums to ${(breakdownCents / 100).toFixed(2)} but amount is ${parseFloat(amount || 0).toFixed(2)}.
            </p>
          )}
        </div>

        {error && <p className={styles.fieldError}>{error}</p>}

        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !name.trim() || sumMismatch}>
            {saving ? 'Creating…' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TreasurerOverviewPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'scouter'
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTxnModal, setShowTxnModal] = useState(false)
  const [showNewAccount, setShowNewAccount] = useState(false)

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleTxnSuccess() {
    getAccounts().then(setAccounts).catch(() => {})
  }

  function handleAccountCreated() {
    setShowNewAccount(false)
    getAccounts().then(setAccounts).catch(() => {})
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Treasury Overview</h1>
        <div className={styles.headerActions}>
          {isAdmin && (
            <Button variant="secondary" onClick={() => setShowNewAccount(true)}>
              <IconPlus size={14} /> New Account
            </Button>
          )}
          <Button onClick={() => setShowTxnModal(true)}>
            <IconPlus size={14} /> Add Transaction
          </Button>
        </div>
      </div>

      {loading && <Spinner centered />}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {showTxnModal && (
        <AddTransactionModal
          accounts={accounts}
          onClose={() => setShowTxnModal(false)}
          onSuccess={handleTxnSuccess}
        />
      )}

      {showNewAccount && (
        <NewAccountModal
          onClose={() => setShowNewAccount(false)}
          onSuccess={handleAccountCreated}
        />
      )}
    </div>
  )
}
