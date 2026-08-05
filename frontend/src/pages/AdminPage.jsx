import { useRef, useState, useEffect, useCallback } from 'react'
import { importBadgeRecords } from '../api/badges'
import { getScouts, assignECRole, exportVenturers } from '../api/users'
import Spinner from '../components/ui/Spinner'
import styles from './AdminPage.module.css'

const EC_ROLES = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'quartermaster', label: 'Quartermaster' },
  { value: 'historian', label: 'Historian' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'first_year_rep', label: 'First Year Rep' },
]

function ImportSection() {
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
      setError(err.raw?.error || err.detail || 'Import failed. Please try again.')
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
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Import Badge Records</h2>
      <p className={styles.sectionSubtitle}>
        Upload the annual badge record spreadsheet (.xlsx) to bulk-import approved
        requirements. Existing approved submissions are skipped automatically.
      </p>

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
    </section>
  )
}

function ExportSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExport() {
    setLoading(true)
    setError('')
    try {
      await exportVenturers()
    } catch (err) {
      setError(err.detail || 'Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Export Active Venturers</h2>
      <p className={styles.sectionSubtitle}>
        Download an Excel spreadsheet of all currently active venturers and the badges
        each has fully achieved.
      </p>

      <div className={styles.card}>
        <button className={styles.importBtn} disabled={loading} onClick={handleExport}>
          {loading ? 'Preparing…' : 'Export to Excel'}
        </button>
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>
    </section>
  )
}

function ECMembersSection() {
  const [scouts, setScouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [feedback, setFeedback] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getScouts()
      setScouts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // roleValue: the EC_ROLES value being changed; newScoutId: scout id string or '' for unassigned
  async function handleScoutChange(roleValue, newScoutId) {
    setSaving(s => ({ ...s, [roleValue]: true }))
    setFeedback(f => ({ ...f, [roleValue]: null }))

    const prevHolder = scouts.find(s => s.ec_role === roleValue)

    try {
      if (newScoutId === '') {
        // unassign: clear the current holder
        if (prevHolder) await assignECRole(prevHolder.id, null)
        setScouts(prev => prev.map(s => s.ec_role === roleValue ? { ...s, ec_role: null } : s))
      } else {
        const scoutId = Number(newScoutId)
        await assignECRole(scoutId, roleValue)
        setScouts(prev => prev.map(s => {
          if (s.id === scoutId) return { ...s, ec_role: roleValue }
          // clear previous holder of this role, and clear scout's old role if they had one
          if (s.ec_role === roleValue || s.id === scoutId) return { ...s, ec_role: null }
          return s
        }))
      }
      setFeedback(f => ({ ...f, [roleValue]: 'saved' }))
      setTimeout(() => setFeedback(f => ({ ...f, [roleValue]: null })), 2000)
    } catch {
      setFeedback(f => ({ ...f, [roleValue]: 'error' }))
    } finally {
      setSaving(s => ({ ...s, [roleValue]: false }))
    }
  }

  const sortedScouts = [...scouts].sort((a, b) => {
    const nameA = [a.first_name, a.last_name].filter(Boolean).join(' ') || a.username
    const nameB = [b.first_name, b.last_name].filter(Boolean).join(' ') || b.username
    return nameA.localeCompare(nameB)
  })

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>EC Members</h2>
      <p className={styles.sectionSubtitle}>
        Assign Executive Committee roles to scouts. Only scouts can hold EC roles.
        Scouters and admins always have EC site access.
      </p>

      {loading ? (
        <div className={styles.loadingRow}><Spinner /></div>
      ) : (
        <div className={styles.ecCard}>
          {EC_ROLES.map((role, i) => {
            const holder = scouts.find(s => s.ec_role === role.value)
            return (
              <div key={role.value}>
                {i > 0 && <hr className={styles.ecDivider} />}
                <div className={styles.ecRow}>
                  <span className={styles.ecRoleLabel}>{role.label}</span>
                  <div className={styles.ecRoleCell}>
                    <select
                      className={styles.ecSelect}
                      value={holder?.id ?? ''}
                      disabled={saving[role.value]}
                      onChange={e => handleScoutChange(role.value, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {sortedScouts.map(s => {
                        const name = [s.first_name, s.last_name].filter(Boolean).join(' ') || s.username
                        return <option key={s.id} value={s.id}>{name}</option>
                      })}
                    </select>
                    {saving[role.value] && <Spinner size="sm" />}
                    {feedback[role.value] === 'saved' && <span className={styles.feedbackSaved}>Saved</span>}
                    {feedback[role.value] === 'error' && <span className={styles.feedbackError}>Failed</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function AdminPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Admin</h1>
      </div>
      <ImportSection />
      <ExportSection />
      <ECMembersSection />
    </div>
  )
}
