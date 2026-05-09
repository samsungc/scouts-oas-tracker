import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { treasurerSign, presidentSign, deleteStatement } from '../../api/treasury'
import { ApiError } from '../../api/client'
import IconDownload from '../icons/IconDownload'
import Button from '../ui/Button'
import styles from './StatementCard.module.css'

const REVENUE_LABELS = {
  registration_fee: 'Registration Fees',
  dues: 'Dues',
  camp_fees: 'Camp Fees',
  program_fees: 'Program Fees',
  other: 'Other Revenue',
}
const EXPENSE_LABELS = {
  camp_expenses: 'Camp Expenses',
  program_expenses: 'Program Expenses',
  admin_expenses: 'Admin Expenses',
  other: 'Other Expenses',
}

function fmt(val) {
  return `$${parseFloat(val || 0).toFixed(2)}`
}

function parseDate(iso) {
  if (!iso) return null
  // Bare date strings (YYYY-MM-DD) must be parsed as local, not UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(iso)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateLong(iso) {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusPill({ statement }) {
  if (statement.treasurer_signed_at && statement.president_signed_at)
    return <span className={`${styles.pill} ${styles.fullySigned}`}>Fully Signed</span>
  if (statement.treasurer_signed_at)
    return <span className={`${styles.pill} ${styles.awaitingPresident}`}>Awaiting President</span>
  return <span className={`${styles.pill} ${styles.awaitingTreasurer}`}>Awaiting Treasurer</span>
}

function AccountFinancialTable({ account }) {
  const revenues = account.revenues || {}
  const expenses = account.expenses || {}
  const totalRevenues = account.total_revenues || {}
  const totalExpenses = account.total_expenses || {}
  const revTotal = parseFloat(account.period_revenue_total || 0)
  const expTotal = parseFloat(account.period_expenses_total || 0)
  const totalRevTotal = parseFloat(account.total_revenue_total || 0)
  const totalExpTotal = parseFloat(account.total_expenses_total || 0)
  const opening = parseFloat(account.opening_balance || 0)
  const closing = parseFloat(account.closing_balance || 0)
  const accountOB = parseFloat(account.account_opening_balance || 0)
  const accountTotal = accountOB + totalRevTotal - totalExpTotal

  const periodTxns = account.period_transactions || []

  return (
    <div className={styles.accountBlock}>
      <h4 className={styles.accountName}>{account.account_name}</h4>
      <table className={styles.finTable}>
        <thead>
          <tr>
            <th />
            <th className={styles.colHeader}>Period</th>
            <th className={styles.colHeader}>YTD</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.openingRow}>
            <td>Opening Balance</td>
            <td className={styles.amount}>{fmt(opening)}</td>
            <td className={styles.amount}>{fmt(accountOB)}</td>
          </tr>

          <tr className={styles.sectionHeader}>
            <td colSpan={3}>Revenue</td>
          </tr>
          {Object.entries(REVENUE_LABELS).map(([cat, label]) => (
            <tr key={cat} className={styles.dataRow}>
              <td className={styles.indent}>{label}</td>
              <td className={styles.amount}>{fmt(revenues[cat])}</td>
              <td className={styles.amount}>{fmt(totalRevenues[cat])}</td>
            </tr>
          ))}
          <tr className={styles.subtotal}>
            <td>Revenue Sub-total</td>
            <td className={styles.amount}>{fmt(revTotal)}</td>
            <td className={styles.amount}>{fmt(totalRevTotal)}</td>
          </tr>

          <tr className={styles.sectionHeader}>
            <td colSpan={3}>Expenses</td>
          </tr>
          {Object.entries(EXPENSE_LABELS).map(([cat, label]) => (
            <tr key={cat} className={styles.dataRow}>
              <td className={styles.indent}>{label}</td>
              <td className={styles.amount}>{fmt(expenses[cat])}</td>
              <td className={styles.amount}>{fmt(totalExpenses[cat])}</td>
            </tr>
          ))}
          <tr className={styles.subtotal}>
            <td>Expenses Sub-total</td>
            <td className={styles.amount}>{fmt(expTotal)}</td>
            <td className={styles.amount}>{fmt(totalExpTotal)}</td>
          </tr>

          <tr className={styles.balanceRow}>
            <td>Closing Balance</td>
            <td className={`${styles.amount} ${closing < 0 ? styles.negative : ''}`}>{fmt(closing)}</td>
            <td className={`${styles.amount} ${accountTotal < 0 ? styles.negative : ''}`}>{fmt(accountTotal)}</td>
          </tr>
        </tbody>
      </table>

      {periodTxns.length > 0 && (
        <div className={styles.txnDetail}>
          <div className={styles.txnDetailTitle}>Transaction Detail</div>
          <table className={styles.txnTable}>
            <thead>
              <tr>
                <th className={styles.txnColHeader}>Date</th>
                <th className={styles.txnColHeader}>Category</th>
                <th className={styles.txnColHeader}>Note</th>
                <th className={`${styles.txnColHeader} ${styles.txnRight}`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {periodTxns.map((t, i) => (
                <tr key={i} className={styles.txnRow}>
                  <td className={styles.txnCell}>{fmtDate(t.date)}</td>
                  <td className={styles.txnCell}>{t.category}</td>
                  <td className={styles.txnCell}>{t.note}</td>
                  <td className={`${styles.txnCell} ${styles.txnRight} ${t.type === 'withdrawal' ? styles.negative : ''}`}>
                    {t.type === 'withdrawal' ? '-' : '+'}{fmt(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function StatementCard({ statement: initialStatement, onPrint, onDelete }) {
  const { user } = useAuth()
  const [statement, setStatement] = useState(initialStatement)
  const [loadingTreasurer, setLoadingTreasurer] = useState(false)
  const [loadingPresident, setLoadingPresident] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState('')

  const canSignAsTreasurer =
    user?.ec_role === 'treasurer' || user?.role === 'scouter' || user?.role === 'admin'
  const canSignAsPresident =
    user?.ec_role === 'president' || user?.role === 'scouter' || user?.role === 'admin'
  const canDelete =
    user?.ec_role === 'treasurer' || user?.role === 'scouter' || user?.role === 'admin'

  async function handleTreasurerSign() {
    setLoadingTreasurer(true); setError('')
    try { setStatement(await treasurerSign(statement.id)) }
    catch (err) { setError(err instanceof ApiError ? err.detail : err.message) }
    finally { setLoadingTreasurer(false) }
  }

  async function handlePresidentSign() {
    setLoadingPresident(true); setError('')
    try { setStatement(await presidentSign(statement.id)) }
    catch (err) { setError(err instanceof ApiError ? err.detail : err.message) }
    finally { setLoadingPresident(false) }
  }

  async function handleDelete() {
    setLoadingDelete(true); setError('')
    try {
      await deleteStatement(statement.id)
      onDelete?.(statement.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : err.message)
      setConfirmDelete(false)
    } finally {
      setLoadingDelete(false)
    }
  }

  const financialData = statement.financial_data || []

  return (
    <div className={styles.card}>

      {/* Screen header */}
      <div className={`${styles.header} ${styles.screenOnly}`}>
        <div>
          <h3 className={styles.period}>
            {fmtDate(statement.period_start)} — {fmtDate(statement.period_end)}
          </h3>
          <p className={styles.meta}>
            Generated {fmtDate(statement.generated_at)} by {statement.generated_by_username}
          </p>
        </div>
        <div className={styles.headerRight}>
          <StatusPill statement={statement} />
          <button className={styles.printBtn} onClick={() => onPrint(statement.id)} title="Save as PDF">
            <IconDownload size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className={`${styles.printHeader} ${styles.printOnly}`}>
        <div className={styles.printGroupName}>6th Richmond Hill Venturer Company</div>
        <div className={styles.printDocTitle}>Statement of Account</div>
        <div className={styles.printAsAt}>
          as at &nbsp;<strong>{fmtDateLong(statement.period_end)}</strong>
        </div>
        <div className={styles.printPeriod}>
          Period: {fmtDateLong(statement.period_start)} — {fmtDateLong(statement.period_end)}
        </div>
      </div>

      {/* Financial data */}
      {financialData.length > 0 ? (
        <div className={styles.financialSection}>
          {financialData.map((acct) => (
            <AccountFinancialTable key={acct.account_id} account={acct} />
          ))}
        </div>
      ) : (
        <p className={styles.noData}>No financial data available.</p>
      )}

      {/* Signatures — screen */}
      <div className={`${styles.sigRow} ${styles.screenOnly}`}>
        <div className={styles.sigItem}>
          <span className={styles.sigLabel}>Treasurer</span>
          {statement.treasurer_signed_at ? (
            <span className={styles.sigSigned}>
              ✓ {statement.treasurer_signed_by_username} · {fmtDate(statement.treasurer_signed_at)}
            </span>
          ) : (
            <span className={styles.sigPending}>Not yet signed</span>
          )}
        </div>
        <div className={styles.sigItem}>
          <span className={styles.sigLabel}>President</span>
          {statement.president_signed_at ? (
            <span className={styles.sigSigned}>
              ✓ {statement.president_signed_by_username} · {fmtDate(statement.president_signed_at)}
            </span>
          ) : (
            <span className={styles.sigPending}>Not yet signed</span>
          )}
        </div>
      </div>

      {/* Signature lines — print */}
      <div className={`${styles.printSigSection} ${styles.printOnly}`}>
        <div className={styles.printSigRow}>
          <div className={styles.printSigBlock}>
            <div className={styles.printSigLine} />
            <div className={styles.printSigName}>
              {statement.treasurer_signed_by_username || ''}
            </div>
            <div className={styles.printSigTitle}>Treasurer</div>
          </div>
          <div className={styles.printSigBlock}>
            <div className={styles.printSigLine} />
            <div className={styles.printSigName}>
              {statement.president_signed_by_username || ''}
            </div>
            <div className={styles.printSigTitle}>President</div>
          </div>
        </div>
      </div>

      {error && <p className={`${styles.error} ${styles.screenOnly}`}>{error}</p>}

      <div className={`${styles.actions} ${styles.screenOnly}`}>
        {!statement.treasurer_signed_at && canSignAsTreasurer && (
          <Button size="sm" variant="ghost" loading={loadingTreasurer} onClick={handleTreasurerSign}>
            Sign as Treasurer
          </Button>
        )}
        {!statement.president_signed_at && canSignAsPresident && (
          <Button
            size="sm"
            variant="ghost"
            loading={loadingPresident}
            disabled={!statement.treasurer_signed_at}
            onClick={handlePresidentSign}
            title={!statement.treasurer_signed_at ? 'Treasurer must sign first' : undefined}
          >
            Sign as President
          </Button>
        )}

        {canDelete && (
          <div className={styles.deleteWrap}>
            {confirmDelete ? (
              <>
                <span className={styles.confirmMsg}>Delete this report?</span>
                <Button size="sm" variant="danger" loading={loadingDelete} onClick={handleDelete}>
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
