import { useRef, useState } from 'react'
import { importBadgeRecords } from '../api/badges'
import Spinner from '../components/ui/Spinner'
import styles from './ImportPage.module.css'

export default function ImportPage() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const selected = e.target.files[0]
    setFile(selected || null)
    setResult(null)
    setError('')
  }

  async function handleImport(dryRun) {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await importBadgeRecords(file, dryRun)
      setResult({ ...res, dryRun })
    } catch (err) {
      const msg = err.raw?.error || err.detail || 'Import failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const warnings = result?.warnings ?? {}
  const hasWarnings =
    warnings.scout_not_found?.length ||
    warnings.requirement_not_found?.length ||
    warnings.badge_prefix_not_found?.length ||
    warnings.reviewer_not_found?.length

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Import Badge Records</h1>
        <p className={styles.subtitle}>
          Upload the annual badge record spreadsheet (.xlsx) to bulk-import approved
          requirements. Existing approved submissions are skipped automatically.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.uploadArea}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className={styles.fileInput}
            onChange={handleFileChange}
            id="xlsx-upload"
          />
          <label htmlFor="xlsx-upload" className={styles.fileLabel}>
            {file ? file.name : 'Choose .xlsx file…'}
          </label>
          {file && (
            <span className={styles.fileSize}>
              {(file.size / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.dryRunBtn}
            disabled={!file || loading}
            onClick={() => handleImport(true)}
          >
            Dry Run
          </button>
          <button
            className={styles.importBtn}
            disabled={!file || loading}
            onClick={() => handleImport(false)}
          >
            Run Import
          </button>
        </div>

        {loading && (
          <div className={styles.loadingRow}>
            <Spinner />
            <span>Processing spreadsheet…</span>
          </div>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      {result && (
        <div className={styles.results}>
          {result.dryRun && (
            <div className={styles.dryRunBanner}>
              Dry run — no records were written to the database.
            </div>
          )}

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.processed}</span>
              <span className={styles.statLabel}>Rows Processed</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.approved_rows}</span>
              <span className={styles.statLabel}>Approved Rows</span>
            </div>
            <div className={`${styles.statCard} ${result.created > 0 ? styles.statCardCreated : ''}`}>
              <span className={styles.statValue}>{result.created}</span>
              <span className={styles.statLabel}>{result.dryRun ? 'Would Create' : 'Created'}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.already_existed}</span>
              <span className={styles.statLabel}>Already Existed</span>
            </div>
          </div>

          {hasWarnings ? (
            <div className={styles.warningsSection}>
              <h3 className={styles.warningsTitle}>Warnings</h3>

              {warnings.scout_not_found?.length > 0 && (
                <div className={styles.warningGroup}>
                  <p className={styles.warningHeading}>
                    Scouts not found in database ({warnings.scout_not_found.length}) — rows skipped:
                  </p>
                  <ul className={styles.warningList}>
                    {warnings.scout_not_found.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              )}

              {warnings.badge_prefix_not_found?.length > 0 && (
                <div className={styles.warningGroup}>
                  <p className={styles.warningHeading}>
                    Unknown badge prefixes ({warnings.badge_prefix_not_found.length}) — rows skipped:
                  </p>
                  <ul className={styles.warningList}>
                    {warnings.badge_prefix_not_found.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              )}

              {warnings.requirement_not_found?.length > 0 && (
                <div className={styles.warningGroup}>
                  <p className={styles.warningHeading}>
                    Requirements not in database ({warnings.requirement_not_found.length}) — rows skipped:
                  </p>
                  <ul className={styles.warningList}>
                    {warnings.requirement_not_found.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              )}

              {warnings.reviewer_not_found?.length > 0 && (
                <div className={styles.warningGroup}>
                  <p className={styles.warningHeading}>
                    Reviewers not found (imported without reviewer, {warnings.reviewer_not_found.length}):
                  </p>
                  <ul className={styles.warningList}>
                    {warnings.reviewer_not_found.map((n) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.noWarnings}>No warnings — all rows matched successfully.</p>
          )}
        </div>
      )}
    </div>
  )
}
