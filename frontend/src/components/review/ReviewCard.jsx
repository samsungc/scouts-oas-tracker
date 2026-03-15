import { useState } from 'react'
import { approveSubmission } from '../../api/review'
import { mediaUrl } from '../../api/client'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './ReviewCard.module.css'

export default function ReviewCard({ submission, requirement, onApproved, onRejectClick }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApprove() {
    setLoading(true)
    setError('')
    try {
      const updated = await approveSubmission(submission.id)
      onApproved(updated)
    } catch (err) {
      setError(err.message || 'Failed to approve.')
    } finally {
      setLoading(false)
    }
  }

  const submittedDate = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleDateString()
    : null

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.scout}>{submission.scout_username}</span>
          {submittedDate && (
            <span className={styles.date}>Submitted {submittedDate}</span>
          )}
        </div>
        <StatusPill status={submission.status} />
      </div>

      <div className={styles.requirementInfo}>
        {requirement ? (
          <>
            <div className={styles.requirementHeader}>
              <span className={styles.badgeName}>{requirement.badge_name}</span>
              <span className={styles.requirementTitle}>{requirement.title}</span>
            </div>
            {requirement.description && (
              <p className={styles.requirementDesc}>{requirement.description}</p>
            )}
            {requirement.hint && (
              <div className={styles.requirementHint}>
                <span className={styles.hintLabel}>Hint:</span> {requirement.hint}
              </div>
            )}
          </>
        ) : (
          <span className={styles.requirementId}>Requirement #{submission.requirement}</span>
        )}
      </div>

      {submission.evidence && submission.evidence.length > 0 && (
        <div className={styles.evidence}>
          <h4 className={styles.evidenceTitle}>Evidence</h4>
          <ul className={styles.evidenceList}>
            {submission.evidence.map((ev) => (
              <li key={ev.id} className={styles.evidenceItem}>
                {ev.text_note && (
                  <p className={styles.textNote}>{ev.text_note}</p>
                )}
                {ev.file && (() => {
                  const url = mediaUrl(ev.file)
                  const filename = ev.file.split('/').pop()
                  const isImage = /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(filename)
                  return isImage ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={filename} className={styles.imagePreview} />
                    </a>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                      📎 {filename}
                    </a>
                  )
                })()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ErrorMessage message={error} />

      {submission.status === 'submitted' && (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? 'Approving…' : '✓ Approve'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRejectClick(submission)}
            disabled={loading}
          >
            ✕ Reject
          </Button>
        </div>
      )}

      {submission.reviewer_notes && (
        <div className={styles.reviewerNotes}>
          <strong>Notes:</strong> {submission.reviewer_notes}
        </div>
      )}
    </div>
  )
}
