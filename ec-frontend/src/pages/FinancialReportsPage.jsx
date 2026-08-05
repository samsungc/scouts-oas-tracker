import { useState, useEffect } from 'react'
import { getFiscalYears } from '../api/treasury'
import YearFolderCard from '../components/treasury/YearFolderCard'
import Spinner from '../components/ui/Spinner'
import styles from './FinancialReportsPage.module.css'

export default function FinancialReportsPage() {
  const [fiscalYears, setFiscalYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getFiscalYears()
      .then(setFiscalYears)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Financial Reports</h1>
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
    </div>
  )
}
