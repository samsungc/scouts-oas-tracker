import { useState, useId } from 'react'
import { addEvidence, submitForReview } from '../../api/submissions'
import { useToast } from '../../context/ToastContext'
import EvidenceList from '../submissions/EvidenceList'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { ReviewerNotes, FilePicker } from './shared'
import { ensureSubmission, validateFiles, uploadFiles, discardAttempt } from './actions'
import styles from './Progression.module.css'

/**
 * One requirement, with everything needed to finish it in place:
 * the description, any returned notes, existing evidence, a note box, file upload and "Submit for review".
 */
export default function RequirementTask({ task, onChanged, title, notePrompt, discardable = false }) {
  const addToast = useToast()
  const inputId = useId()
  const { req, sub } = task
  const status = sub?.status ?? null
  const editable = !status || status === 'draft' || status === 'rejected'
  const [open, setOpen] = useState(status === 'draft' || status === 'rejected')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const canDiscard = discardable && (status === 'draft' || status === 'rejected')

  const evidence = sub?.evidence ?? []
  const cardClass = [
    styles.card,
    status === 'approved' ? styles.cardDone : '',
    status === 'rejected' ? styles.cardAttention : '',
    status === 'submitted' ? styles.cardWaiting : '',
  ].join(' ')

  async function handleSubmit() {
    setError('')
    if (!note.trim() && files.length === 0 && evidence.length === 0) {
      setError('Add a short note or a photo so a Scouter can see what you did.')
      return
    }
    const fileError = validateFiles(files)
    if (fileError) { setError(fileError); return }

    setBusy(true)
    try {
      const s = await ensureSubmission(task)
      if (note.trim()) await addEvidence(s.id, { textNote: note.trim() })
      await uploadFiles(s.id, files)
      await submitForReview(s.id)
      setNote('')
      setFiles([])
      addToast({ message: `${req.title} sent for review`, variant: 'success' })
      await onChanged()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      await onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function handleDiscard() {
    setBusy(true)
    setError('')
    try {
      await discardAttempt(sub)
      addToast({ message: 'Attempt deleted', variant: 'info' })
    } catch (err) {
      setError(err.message || 'Could not delete this attempt.')
    } finally {
      setBusy(false)
      setConfirmDiscard(false)
      await onChanged()
    }
  }

  const discardControls = canDiscard && (
    confirmDiscard ? (
      <>
        <span className={styles.confirmText}>Delete this attempt and its evidence?</span>
        <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(false)} disabled={busy}>Keep</Button>
        <Button variant="danger" size="sm" onClick={handleDiscard} loading={busy}>Delete</Button>
      </>
    ) : (
      <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(true)} disabled={busy}>
        Delete this attempt
      </Button>
    )
  )

  return (
    <div className={cardClass}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <span className={styles.cardTitle}>{title ?? req.title}</span>
          {req.description && <span className={styles.cardSub}>{req.description}</span>}
        </div>
        {status && <StatusPill status={status} />}
      </div>

      {req.hint && editable && (
        <div className={styles.notice}>
          <span className={styles.noticeTitle}>Tip</span>
          {req.hint}
        </div>
      )}

      <ReviewerNotes sub={sub} />

      {status === 'submitted' && (
        <span className={styles.cardSub}>Sent for review. A Scouter will take a look soon.</span>
      )}

      {evidence.length > 0 && (status !== 'approved' || open) && (
        <EvidenceList
          evidence={evidence}
          isDraft={editable}
          onDeleted={onChanged}
          onUpdated={onChanged}
        />
      )}

      {editable && !open && (
        <div className={styles.actions}>
          <Button size="sm" onClick={() => setOpen(true)}>
            {status ? 'Continue' : 'Add evidence'}
          </Button>
          {discardControls}
        </div>
      )}

      {editable && open && (
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${inputId}-note`}>
              <span className={styles.labelText}>What did you do?</span>
              <span className={styles.prompt}>
                {notePrompt ?? 'Describe the activity: when it was, what you did and what you learned.'}
              </span>
            </label>
            <textarea
              id={`${inputId}-note`}
              className={styles.textarea}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. On March 3rd I co-led our winter camp…"
            />
          </div>
          <FilePicker id={`${inputId}-files`} files={files} onChange={setFiles} />
          <ErrorMessage message={error} />
          <div className={styles.footerActions}>
            {!status && (
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
            )}
            {discardControls}
            {!confirmDiscard && (
              <Button size="sm" onClick={handleSubmit} loading={busy}>
                Submit for review
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
