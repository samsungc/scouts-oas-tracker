import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAccountDetail } from '../api/treasury'
import DenominationGrid from '../components/treasury/DenominationGrid'
import TransactionTable from '../components/treasury/TransactionTable'
import AddTransactionModal from '../components/treasury/AddTransactionModal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Pagination from '../components/ui/Pagination'
import IconPlus from '../components/icons/IconPlus'
import styles from './AccountDetailPage.module.css'

const DEPOSIT_CATEGORIES = ['registration_fee', 'dues', 'camp_fees', 'program_fees']
const WITHDRAWAL_CATEGORIES = ['camp_expenses', 'program_expenses', 'admin_expenses', 'other']
const ALL_CATEGORIES = [...new Set([...DEPOSIT_CATEGORIES, ...WITHDRAWAL_CATEGORIES])]

function formatCategory(cat) {
  return cat.replace(/_/g, ' ')
}

function CheckChip({ label, checked, onChange, variant }) {
  const checkedClass = variant === 'deposit' ? styles.chipCheckedDeposit
    : variant === 'withdrawal' ? styles.chipCheckedWithdrawal
    : styles.chipChecked
  return (
    <label className={`${styles.chip} ${checked ? checkedClass : ''}`}>
      <input type="checkbox" className={styles.chipInput} checked={checked} onChange={onChange} />
      {label}
    </label>
  )
}

export default function AccountDetailPage() {
  const { id } = useParams()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newTxn, setNewTxn] = useState(null)

  const [selectedTypes, setSelectedTypes] = useState(new Set())
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const visibleCategories =
    selectedTypes.size === 0 || selectedTypes.size === 2
      ? ALL_CATEGORIES
      : selectedTypes.has('deposit')
        ? DEPOSIT_CATEGORIES
        : WITHDRAWAL_CATEGORIES

  useEffect(() => { setPage(1); setTotalPages(1) }, [selectedTypes, selectedCategories])

  useEffect(() => {
    setSelectedCategories((prev) => {
      const next = new Set([...prev].filter((c) => visibleCategories.includes(c)))
      return next.size === prev.size ? prev : next
    })
  }, [selectedTypes]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getAccountDetail(id)
      .then(setAccount)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleTxnSuccess(txn) {
    getAccountDetail(id).then(setAccount).catch(() => {})
    setNewTxn(txn)
  }

  function toggleType(type) {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  function toggleCategory(cat) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  if (loading) return <Spinner centered />
  if (error) return <p className={styles.error}>{error}</p>
  if (!account) return null

  const balance = parseFloat(account.balance)

  return (
    <div>
      <Link to="/treasurer" className={styles.backLink}>← Back to overview</Link>

      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{account.name}</h1>
          <span className={`${styles.balance} ${balance < 0 ? styles.negative : styles.positive}`}>
            {balance < 0 ? '-' : ''}${Math.abs(balance).toFixed(2)}
          </span>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <IconPlus size={14} /> Add Transaction
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <CheckChip label="Deposit" checked={selectedTypes.has('deposit')} onChange={() => toggleType('deposit')} variant="deposit" />
          <div className={styles.divider} />
          {DEPOSIT_CATEGORIES.map((cat) => (
            <CheckChip key={cat} label={formatCategory(cat)} checked={selectedCategories.has(cat)} onChange={() => toggleCategory(cat)} />
          ))}
        </div>
        <div className={styles.filterRow}>
          <CheckChip label="Withdrawal" checked={selectedTypes.has('withdrawal')} onChange={() => toggleType('withdrawal')} variant="withdrawal" />
          <div className={styles.divider} />
          {WITHDRAWAL_CATEGORIES.map((cat) => (
            <CheckChip key={cat} label={formatCategory(cat)} checked={selectedCategories.has(cat)} onChange={() => toggleCategory(cat)} />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.ledgerSection}>
          <p className={styles.sectionTitle}>Ledger</p>
          <TransactionTable
            accountId={parseInt(id)}
            newTxn={newTxn}
            selectedTypes={selectedTypes}
            selectedCategories={selectedCategories}
            page={page}
            onTotalPagesChange={setTotalPages}
          />
        </div>

        <div className={styles.sidebar}>
          <p className={styles.sectionTitle}>Cash on Hand</p>
          <DenominationGrid breakdown={account.denomination_breakdown} />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showModal && (
        <AddTransactionModal
          accounts={[account]}
          defaultAccountId={parseInt(id)}
          onClose={() => setShowModal(false)}
          onSuccess={handleTxnSuccess}
        />
      )}
    </div>
  )
}
