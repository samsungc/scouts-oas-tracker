import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getStatementDetail } from '../api/treasury'
import StatementCard from '../components/treasury/StatementCard'
import Spinner from '../components/ui/Spinner'
import styles from './FinancialReportDetailPage.module.css'

export default function FinancialReportDetailPage() {
  const { startYear, id } = useParams()
  const navigate = useNavigate()
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    getStatementDetail(id)
      .then(setStatement)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!printing) return
    window.print()
    setPrinting(false)
  }, [printing])

  function handleDelete() {
    navigate(`/treasurer/reports/${startYear}`)
  }

  return (
    <div>
      <Link to={`/treasurer/reports/${startYear}`} className={styles.backLink}>← Back to {startYear}-{parseInt(startYear, 10) + 1}</Link>

      {loading && <Spinner centered />}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && statement && (
        <div {...(printing ? { 'data-print-active': true } : {})}>
          <StatementCard statement={statement} onPrint={() => setPrinting(true)} onDelete={handleDelete} />
        </div>
      )}
    </div>
  )
}
