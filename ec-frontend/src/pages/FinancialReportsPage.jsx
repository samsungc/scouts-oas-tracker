import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFiscalYears } from '../api/treasury'
import { fiscalYearForDateStr } from '../utils/fiscalYear'
import YearFolderCard from '../components/treasury/YearFolderCard'
import CreateStatementModal from '../components/treasury/CreateStatementModal'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import IconPlus from '../components/icons/IconPlus'
import styles from './FinancialReportsPage.module.css'

export default function FinancialReportsPage() {
  const navigate = useNavigate()
  const [fiscalYears, setFiscalYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getFiscalYears()
      .then(setFiscalYears)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleNewStatement(statement) {
    const fyStart = fiscalYearForDateStr(statement.period_start)
    navigate(`/treasurer/reports/${fyStart}`)
  }

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
        fiscalYears.length === 0 ? (
          <p className={styles.empty}>No financial reports yet.</p>
        ) : (
          <div className={styles.folderGrid}>
            {fiscalYears.map((fy) => (
              <YearFolderCard key={fy.start_year} fiscalYear={fy} />
            ))}
          </div>
        )
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
