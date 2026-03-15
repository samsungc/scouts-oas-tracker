import { useState } from 'react'
import { rejectSubmission } from '../../api/review'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './RejectModal.module.css'

export default function RejectModal({ submission, onRejected, onClose, onReject }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const rejectAction = onReject ?? ((id, notes) => rejectSubmission(id, notes))

  async function handleConfirm() {
    if (!notes.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const updated = await rejectAction(submission.id, notes.trim())
      onRejected(updated)
    } catch (err) {
      setError(err.message || 'Failed to reject submission.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Reject Submission" onClose={onClose}>
      <div className={styles.info}>
        <span className={styles.scout}>{submission.scout_username}</span>
        <span className={styles.sep}>—</span>
        <span className={styles.req}>
          Submission #{submission.id}
        </span>
      </div>

      <label className={styles.label} htmlFor="reject-notes">
        Reason for rejection <span className={styles.required}>*</span>
      </label>
      <textarea
        id="reject-notes"
        className={styles.textarea}
        placeholder="Explain what needs to be improved or corrected…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />

      <ErrorMessage message={error} />

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Rejecting…' : 'Confirm Rejection'}
        </Button>
      </div>
    </Modal>
  )
}
