import { useState } from 'react'
import { rejectSubmission } from '../../api/review'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { useToast } from '../../context/ToastContext'
import styles from './RejectModal.module.css'

export default function RejectModal({ submission, onRejected, onClose, onReject }) {
  const addToast = useToast()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const rejectAction = onReject ?? ((id, notes) => rejectSubmission(id, notes))

  async function handleConfirm() {
    if (!notes.trim()) {
      setError('Please provide a reason for returning.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const updated = await rejectAction(submission.id, notes.trim())
      addToast({ message: 'Submission returned', variant: 'info' })
      onRejected(updated)
    } catch (err) {
      setError(err.message || 'Failed to return submission.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Return Submission" onClose={onClose}>
      <div className={styles.info}>
        <span className={styles.scout}>{submission.scout_username}</span>
        <span className={styles.sep}>—</span>
        <span className={styles.req}>
          Submission #{submission.id}
        </span>
      </div>

      <label className={styles.label} htmlFor="reject-notes">
        Reason for returning <span className={styles.required}>*</span>
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
        <Button variant="danger" onClick={handleConfirm} loading={loading}>
          Confirm Return
        </Button>
      </div>
    </Modal>
  )
}
