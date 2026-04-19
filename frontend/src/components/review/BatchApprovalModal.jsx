import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { getScouts } from '../../api/users'
import { getReviewSubmissions, batchDirectApprove } from '../../api/review'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import ErrorMessage from '../ui/ErrorMessage'
import { useToast } from '../../context/ToastContext'
import styles from './BatchApprovalModal.module.css'

export default function BatchApprovalModal({ requirement, onClose }) {
  const addToast = useToast()
  const [scouts, setScouts] = useState([])
  const [alreadyApprovedIds, setAlreadyApprovedIds] = useState(new Set())
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lastSelection, setLastSelection] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [scoutList, approvedSubs] = await Promise.all([
          getScouts(),
          getReviewSubmissions({ requirement_id: requirement.id, status: 'approved' }),
        ])
        setScouts(scoutList)
        const approvedSet = new Set(approvedSubs.map((s) => s.scout_id).filter(Boolean))
        setAlreadyApprovedIds(approvedSet)
        try {
          const saved = localStorage.getItem('batch_approve_last_selection')
          if (saved) setLastSelection(JSON.parse(saved))
        } catch {
          // ignore malformed storage
        }
      } catch {
        setError('Failed to load scouts.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [requirement.id])

  function toggleAll() {
    const allEligible = scouts.filter((s) => !alreadyApprovedIds.has(s.id))
    if (selected.size === allEligible.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allEligible.map((s) => s.id)))
    }
  }

  function toggleScout(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleApprove() {
    if (selected.size === 0) return
    setSubmitting(true)
    setError('')
    try {
      const approvedIds = [...selected]
      localStorage.setItem('batch_approve_last_selection', JSON.stringify(approvedIds))
      setLastSelection(approvedIds)
      const result = await batchDirectApprove(requirement.id, approvedIds, notes.trim())
      addToast({ message: `${result.approved_count} scout${result.approved_count !== 1 ? 's' : ''} approved`, variant: 'success' })
      setSelected(new Set())
      // Refresh approved set
      const approvedSubs = await getReviewSubmissions({ requirement_id: requirement.id, status: 'approved' })
      setAlreadyApprovedIds(new Set(approvedSubs.map((s) => s.scout_id).filter(Boolean)))
    } catch (err) {
      setError(err.message || 'Failed to approve submissions.')
    } finally {
      setSubmitting(false)
    }
  }

  const debouncedSearch = useDebounce(search, 200)
  const lowerSearch = debouncedSearch.toLowerCase()
  const visibleScouts = debouncedSearch
    ? scouts.filter((s) => {
        const name = [s.first_name, s.last_name].filter(Boolean).join(' ') || s.username
        return name.toLowerCase().includes(lowerSearch) || s.username.toLowerCase().includes(lowerSearch)
      })
    : scouts
  const eligible = scouts.filter((s) => !alreadyApprovedIds.has(s.id))
  const allSelected = eligible.length > 0 && selected.size === eligible.length
  const reselectEligible = lastSelection
    ? lastSelection.filter((id) => !alreadyApprovedIds.has(id) && scouts.some((s) => s.id === id))
    : []

  return (
    <Modal title={`Batch Approve: ${requirement.title}`} onClose={onClose}>
      {loading && <Spinner centered />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {scouts.length === 0 ? (
            <p className={styles.empty}>No scouts found.</p>
          ) : (
            <>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search scouts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className={styles.selectAllRow}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={eligible.length === 0}
                  />
                  <span>Select all eligible ({eligible.length})</span>
                </label>
                {reselectEligible.length > 0 && (
                  <button
                    type="button"
                    className={styles.reselectBtn}
                    onClick={() => setSelected(new Set(reselectEligible))}
                  >
                    Reselect most recent ({reselectEligible.length})
                  </button>
                )}
              </div>

              <div className={styles.scoutList}>
                {visibleScouts.length === 0 ? (
                  <p className={styles.noMatch}>No scouts match &ldquo;{debouncedSearch}&rdquo;.</p>
                ) : visibleScouts.map((scout) => {
                  const approved = alreadyApprovedIds.has(scout.id)
                  const name = [scout.first_name, scout.last_name].filter(Boolean).join(' ') || scout.username
                  return (
                    <label
                      key={scout.id}
                      className={`${styles.scoutRow} ${approved ? styles.scoutRowApproved : ''} ${!approved && selected.has(scout.id) ? styles.scoutRowSelected : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={approved || selected.has(scout.id)}
                        disabled={approved}
                        onChange={() => !approved && toggleScout(scout.id)}
                      />
                      <span className={styles.scoutName}>{name}</span>
                      {approved && <span className={styles.approvedTag}>Already approved</span>}
                    </label>
                  )
                })}

              </div>

              <div className={styles.notesRow}>
                <label className={styles.label} htmlFor="batch-notes">
                  Reviewer notes <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="batch-notes"
                  className={styles.textarea}
                  placeholder="e.g. Completed during group badge session on March 15…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose} disabled={submitting}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={selected.size === 0}
                  loading={submitting}
                >
                  {`Approve Selected (${selected.size})`}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  )
}
