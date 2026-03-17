import { useState } from 'react'
import { submitForReview, deleteSubmission } from '../../api/submissions'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import EvidenceList from './EvidenceList'
import EvidenceForm from './EvidenceForm'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './SubmissionCard.module.css'

export default function SubmissionCard({ submission, onUpdated, onDeleted }) {
  const [sub, setSub] = useState(submission)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warnNoEvidence, setWarnNoEvidence] = useState(false)

  const isDraft = sub.status === 'draft'

  function handleSubmitClick() {
    if (sub.evidence.length === 0) {
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
          isDraft={isDraft}
          onDeleted={handleEvidenceDeleted}
        />
      </div>

      {isDraft && (
        <EvidenceForm submissionId={sub.id} onAdded={handleEvidenceAdded} />
      )}

      {warnNoEvidence && (
        <div className={styles.noEvidenceWarning}>
          <p>You have no evidence attached. Scouters may reject this submission.</p>
          <div className={styles.noEvidenceActions}>
            <Button variant="primary" size="sm" onClick={doSubmit} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Anyway'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setWarnNoEvidence(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

      {isDraft && !warnNoEvidence && (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitClick}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit for Review'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Draft
          </Button>
        </div>
      )}
    </div>
  )
}
