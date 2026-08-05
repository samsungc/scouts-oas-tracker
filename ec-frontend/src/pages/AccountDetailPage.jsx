import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAccountDetail } from '../api/treasury'
import DenominationGrid from '../components/treasury/DenominationGrid'
import TransactionTable from '../components/treasury/TransactionTable'
import AddTransactionModal from '../components/treasury/AddTransactionModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Pagination from '../components/ui/Pagination'
import IconPlus from '../components/icons/IconPlus'
import IconSearch from '../components/icons/IconSearch'
import IconTreasury from '../components/icons/IconTreasury'
import styles from './AccountDetailPage.module.css'

const DEPOSIT_CATEGORIES = ['registration_fee', 'dues', 'camp_fees', 'program_fees']
const WITHDRAWAL_CATEGORIES = ['camp_expenses', 'program_expenses', 'admin_expenses', 'other']
const ALL_CATEGORIES = [...new Set([...DEPOSIT_CATEGORIES, ...WITHDRAWAL_CATEGORIES])]

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: '-amount', label: 'Amount: high to low' },
  { value: 'amount', label: 'Amount: low to high' },
  { value: 'category', label: 'Category: A–Z' },
  { value: '-category', label: 'Category: Z–A' },
]

function formatCategory(cat) {
  return cat.replace(/_/g, ' ')
}

function CheckChip({ label, amount, checked, onChange, variant }) {
  const checkedClass = variant === 'deposit' ? styles.chipCheckedDeposit
    : variant === 'withdrawal' ? styles.chipCheckedWithdrawal
    : styles.chipChecked
  return (
    <label className={`${styles.chip} ${checked ? checkedClass : ''}`}>
      <input type="checkbox" className={styles.chipInput} checked={checked} onChange={onChange} />
      <span className={styles.chipLabel}>{label}</span>
      {amount !== undefined && (
        <span className={`${styles.chipAmount} ${amount < 0 ? styles.negative : amount > 0 ? styles.positive : styles.neutral}`}>
          {amount < 0 ? '-' : amount > 0 ? '+' : ''}${Math.abs(amount).toFixed(2)}
        </span>
      )}
    </label>
  )
}

export default function AccountDetailPage() {
  const { id } = useParams()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [newTxn, setNewTxn] = useState(null)

  const [selectedTypes, setSelectedTypes] = useState(new Set())
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('-created_at')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { setPage(1); setTotalPages(1) }, [selectedTypes, selectedCategories, search, sort])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

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
          <span className={styles.balanceLabel}>Balance</span>
          <span className={`${styles.balance} ${balance < 0 ? styles.negative : styles.positive}`}>
            {balance < 0 ? '-' : ''}${Math.abs(balance).toFixed(2)}
          </span>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={() => setShowCashModal(true)}>
            <IconTreasury size={14} /> Cash on Hand
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <IconPlus size={14} /> Add Transaction
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <IconSearch size={16} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search transactions…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className={styles.sortWrap}>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.filters}>
        <span className={styles.filtersLabel}>YTD / Sort by</span>
        <div className={styles.filterRow}>
          <CheckChip
            label="Deposit"
            amount={parseFloat(account.category_ytd_totals?.deposit ?? 0)}
            checked={selectedTypes.has('deposit')}
            onChange={() => toggleType('deposit')}
            variant="deposit"
          />
          <CheckChip
            label="Withdrawal"
            amount={-parseFloat(account.category_ytd_totals?.withdrawal ?? 0)}
            checked={selectedTypes.has('withdrawal')}
            onChange={() => toggleType('withdrawal')}
            variant="withdrawal"
          />
          <div className={styles.divider} />
          {ALL_CATEGORIES.map((cat) => (
            <CheckChip
              key={cat}
              label={formatCategory(cat)}
              amount={parseFloat(account.category_ytd_totals?.[cat] ?? 0)}
              checked={selectedCategories.has(cat)}
              onChange={() => toggleCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className={styles.ledgerSection}>
        <TransactionTable
          accountId={parseInt(id)}
          newTxn={newTxn}
          selectedTypes={selectedTypes}
          selectedCategories={selectedCategories}
          search={search}
          ordering={sort}
          page={page}
          onTotalPagesChange={setTotalPages}
        />
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

      {showCashModal && (
        <Modal title="Cash on Hand" onClose={() => setShowCashModal(false)}>
          <DenominationGrid breakdown={account.denomination_breakdown} />
        </Modal>
      )}
    </div>
  )
}
