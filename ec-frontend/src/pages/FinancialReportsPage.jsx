import { useState, useEffect, useRef } from 'react'
import { getStatements } from '../api/treasury'
import StatementCard from '../components/treasury/StatementCard'
import CreateStatementModal from '../components/treasury/CreateStatementModal'
import Pagination from '../components/ui/Pagination'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import IconPlus from '../components/icons/IconPlus'
import styles from './FinancialReportsPage.module.css'

export default function FinancialReportsPage() {
  const [statements, setStatements] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [printingId, setPrintingId] = useState(null)
  const printRafRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    getStatements(page)
      .then((data) => {
        setStatements(data.results)
        setTotalPages(data.total_pages)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page])

  function handleNewStatement() {
    // New statement goes to the top — jump to page 1 to show it
    if (page === 1) {
      setLoading(true)
      getStatements(1)
        .then((data) => { setStatements(data.results); setTotalPages(data.total_pages) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setPage(1)
    }
  }

  function handleDelete(id) {
    const remaining = statements.filter((s) => s.id !== id)
    if (remaining.length === 0 && page > 1) {
      setPage((p) => p - 1)
    } else {
      setStatements(remaining)
      // Refresh to pick up correct totalPages
      getStatements(page)
        .then((data) => { setStatements(data.results); setTotalPages(data.total_pages) })
        .catch(() => {})
    }
  }

  function handlePrint(id) {
    setPrintingId(id)
    printRafRef.current = requestAnimationFrame(() => {
      window.print()
      setPrintingId(null)
    })
  }

  useEffect(() => {
    return () => { if (printRafRef.current) cancelAnimationFrame(printRafRef.current) }
  }, [])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Financial Reports</h1>
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
                <div
                  key={s.id}
                  {...(printingId === s.id ? { 'data-print-active': true } : {})}
                >
                  <StatementCard statement={s} onPrint={handlePrint} onDelete={handleDelete} />
                </div>
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
