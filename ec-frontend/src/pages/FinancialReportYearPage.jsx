import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getStatements } from '../api/treasury'
import { fiscalYearForDateStr } from '../utils/fiscalYear'
import StatementListItem from '../components/treasury/StatementListItem'
import CreateStatementModal from '../components/treasury/CreateStatementModal'
import Pagination from '../components/ui/Pagination'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import IconPlus from '../components/icons/IconPlus'
import styles from './FinancialReportYearPage.module.css'

export default function FinancialReportYearPage() {
  const { startYear } = useParams()
  const navigate = useNavigate()
  const fyStart = parseInt(startYear, 10)

  const [statements, setStatements] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (isNaN(fyStart)) return
    setLoading(true)
    setError('')
    getStatements(page, fyStart)
      .then((data) => {
        setStatements(data.results)
        setTotalPages(data.total_pages)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, fyStart])

  function handleNewStatement(statement) {
    const createdStart = fiscalYearForDateStr(statement.period_start)
    if (createdStart !== fyStart) {
      navigate(`/treasurer/reports/${createdStart}`)
      return
    }
    // New statement goes to the top — jump to page 1 to show it
    if (page === 1) {
      setLoading(true)
      getStatements(1, fyStart)
        .then((data) => { setStatements(data.results); setTotalPages(data.total_pages) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setPage(1)
    }
  }

  if (isNaN(fyStart)) {
    return <p className={styles.error}>Invalid fiscal year.</p>
  }

  return (
    <div>
      <Link to="/treasurer/reports" className={styles.backLink}>← Back to reports</Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>{fyStart}-{fyStart + 1}</h1>
        <Button onClick={() => setShowModal(true)}>
          <IconPlus size={14} /> New Report
        </Button>
      </div>

      {loading && <Spinner centered />}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.list}>
            {statements.length === 0 ? (
              <p className={styles.empty}>No reports yet. Create one to get started.</p>
            ) : (
              statements.map((s) => (
                <StatementListItem key={s.id} statement={s} startYear={fyStart} />
              ))
            )}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      )}

      {showModal && (
        <CreateStatementModal
          onClose={() => setShowModal(false)}
          onSuccess={handleNewStatement}
        />
      )}
    </div>
  )
}
