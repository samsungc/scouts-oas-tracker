import { useState, useRef } from 'react'
import { submitForReview, deleteSubmission } from '../../api/submissions'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import EvidenceList from './EvidenceList'
import EvidenceForm from './EvidenceForm'
import ErrorMessage from '../ui/ErrorMessage'
import { useToast } from '../../context/ToastContext'
import styles from './SubmissionCard.module.css'

export default function SubmissionCard({ submission, onUpdated, onDeleted }) {
  const addToast = useToast()
  const [sub, setSub] = useState(submission)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warnNoEvidence, setWarnNoEvidence] = useState(false)
  const evidenceFormRef = useRef(null)
  const evidenceListRef = useRef(null)

  const isDraft    = sub.status === 'draft'
  const isEditable = isDraft || sub.status === 'rejected'

  async function handleSubmitClick() {
    await evidenceListRef.current?.saveIfEditing()
    const addedEvidence = await evidenceFormRef.current?.submitIfDirty()
    if (sub.evidence.length === 0 && !addedEvidence) {
      setWarnNoEvidence(true)
    } else {
      doSubmit()
    }
  }

  async function doSubmit() {
    setWarnNoEvidence(false)
    setLoading(true)
    setError('')
    try {
      const updated = await submitForReview(sub.id)
      setSub(updated)
      if (onUpdated) onUpdated(updated)
      addToast({ message: 'Submitted for review', variant: 'success' })
    } catch (err) {
      setError(err.message || 'Failed to submit for review.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this draft submission?')) return
    setLoading(true)
    setError('')
    try {
      await deleteSubmission(sub.id)
      addToast({ message: 'Draft deleted', variant: 'info' })
      if (onDeleted) onDeleted(sub.id)
    } catch (err) {
      setError(err.message || 'Failed to delete submission.')
      setLoading(false)
    }
  }

  function handleEvidenceAdded(ev) {
    setSub((prev) => ({
      ...prev,
      evidence: [...prev.evidence, ev],
    }))
  }

  function handleEvidenceDeleted(evidenceId) {
    setSub((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== evidenceId),
    }))
  }

  function handleEvidenceUpdated(updatedEvidence) {
    setSub((prev) => ({
      ...prev,
      evidence: prev.evidence.map((e) => e.id === updatedEvidence.id ? updatedEvidence : e),
    }))
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>
          Submission #{sub.id}
        </span>
        <StatusPill status={sub.status} />
      </div>

      {sub.reviewer_notes && (
        <div className={styles.reviewerNotes}>
          <strong>Reviewer notes:</strong> {sub.reviewer_notes}
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Evidence</h4>
        <EvidenceList
          evidence={sub.evidence}
          ref={evidenceListRef}
          isDraft={isEditable}
          onDeleted={handleEvidenceDeleted}
          onUpdated={handleEvidenceUpdated}
        />
      </div>

      {isEditable && (
        <EvidenceForm ref={evidenceFormRef} submissionId={sub.id} onAdded={handleEvidenceAdded} />
      )}

      {warnNoEvidence && (
        <div className={styles.noEvidenceWarning}>
          <p>You have no evidence attached. Scouters may reject this submission.</p>
          <div className={styles.noEvidenceActions}>
            <Button variant="primary" size="sm" onClick={doSubmit} loading={loading}>
              Submit Anyway
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWarnNoEvidence(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

      {isEditable && !warnNoEvidence && (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitClick}
            loading={loading}
          >
            {isDraft ? 'Submit for Review' : 'Re-submit for Review'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={loading}
          >
            {isDraft ? 'Delete Draft' : 'Delete Submission'}
          </Button>
        </div>
      )}
    </div>
  )
}
