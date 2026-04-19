import { useState } from 'react'
import { Link } from 'react-router-dom'
import { approveSubmission, getReviewSubmissions } from '../../api/review'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import EvidenceList from '../submissions/EvidenceList'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import CommentSection from './CommentSection'
import { useToast } from '../../context/ToastContext'
import styles from './ReviewCard.module.css'

export default function ReviewCard({ submission, requirement, onApproved, onRejectClick, onApprove, allBadges = [], scouters = [], showScoterNotes = true }) {
  const addToast = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGoals, setShowGoals] = useState(false)
  const [goalsSubmission, setGoalsSubmission] = useState(null)
  const [goalsLoading, setGoalsLoading] = useState(false)
  const [goalsError, setGoalsError] = useState('')
  const [showComments, setShowComments] = useState(false)
  const hasComments = (submission.scouter_comments ?? []).length > 0

  const approveAction = onApprove ?? ((id) => approveSubmission(id))

  const isCompletedGoal = /completed goal/i.test(requirement?.title ?? '')

  async function handleApprove() {
    setLoading(true)
    setError('')
    try {
      const updated = await approveAction(submission.id)
      addToast({ message: 'Submission approved', variant: 'success' })
      onApproved(updated)
    } catch (err) {
      setError(err.message || 'Failed to approve.')
    } finally {
      setLoading(false)
    }
  }

  async function handleShowGoals() {
    setGoalsSubmission(null)
    setGoalsError('')
    setShowGoals(true)

    const badge = allBadges.find(b => b.name === requirement?.badge_name)
    if (!badge) {
      setGoalsError('Could not find badge data for this submission.')
      return
    }

    const setGoalsReq = badge.requirements?.find(r => /set.*goals/i.test(r.title))
    if (!setGoalsReq) {
      setGoalsError('This badge does not have a Set Goals requirement.')
      return
    }

    setGoalsLoading(true)
    try {
      const data = await getReviewSubmissions({ requirement_id: setGoalsReq.id, scout_id: submission.scout_id })
      const results = data.results ?? data
      setGoalsSubmission(Array.isArray(results) && results.length > 0 ? results[0] : null)
    } catch {
      setGoalsError('Failed to load Set Goals submission.')
    } finally {
      setGoalsLoading(false)
    }
  }

  function closeGoalsModal() {
    setShowGoals(false)
    setGoalsSubmission(null)
    setGoalsError('')
  }

  const submittedDate = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleDateString()
    : null

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <Link
            className={styles.scout}
            to={`/scouts?username=${encodeURIComponent(submission.scout_username)}`}
            state={{ from: 'review' }}
          >
            {submission.scout_username}
          </Link>
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

      {submission.evidence && (
        <div className={styles.evidence}>
          <h4 className={styles.evidenceTitle}>Evidence</h4>
          <EvidenceList
            evidence={submission.evidence}
            isDraft={false}
            onDeleted={() => {}}
          />
        </div>
      )}

      <ErrorMessage message={error} />

      <div className={styles.actions}>
        {submission.status === 'submitted' && (
          <Button variant="primary" size="sm" onClick={handleApprove} loading={loading}>
            ✓ Approve
          </Button>
        )}
        {submission.status === 'submitted' && (
          <Button variant="danger" size="sm" onClick={() => onRejectClick(submission)} disabled={loading}>
            ✕ Return
          </Button>
        )}
        {isCompletedGoal && (
          <Button variant="secondary" size="sm" onClick={handleShowGoals}>
            Show Goals
          </Button>
        )}
        {showScoterNotes && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowComments(v => !v)}
          >
            {hasComments ? `Notes (${(submission.scouter_comments ?? []).length})` : 'Comment'}
          </Button>
        )}
      </div>

      {showScoterNotes && (showComments || hasComments) && (
        <CommentSection
          submissionId={submission.id}
          initialComments={submission.scouter_comments ?? []}
          scouters={scouters}
          open={showComments}
          onOpen={() => setShowComments(true)}
        />
      )}

      {(submission.reviewed_by_username || submission.reviewer_notes) && (
        <div className={styles.reviewerNotes}>
          {submission.reviewed_by_username && (
            <span className={styles.reviewedBy}>Reviewed by {submission.reviewed_by_username}</span>
          )}
          {submission.reviewer_notes && (
            <span><strong>Notes:</strong> {submission.reviewer_notes}</span>
          )}
        </div>
      )}

      {showGoals && (
        <Modal
          title={`Set Goals — ${requirement?.badge_name ?? 'Badge'}`}
          onClose={closeGoalsModal}
        >
          {goalsLoading && <Spinner centered />}
          {goalsError && <p>{goalsError}</p>}
          {!goalsLoading && !goalsError && !goalsSubmission && (
            <p>No &ldquo;Set Goals&rdquo; submission found for this scout.</p>
          )}
          {!goalsLoading && goalsSubmission && (
            <EvidenceList evidence={goalsSubmission.evidence} isDraft={false} onDeleted={() => {}} />
          )}
        </Modal>
      )}
    </div>
  )
}
