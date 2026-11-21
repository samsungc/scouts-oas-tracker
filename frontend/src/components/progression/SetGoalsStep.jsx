import { useState } from 'react'
import { addEvidence, updateEvidence, deleteEvidence, submitForReview } from '../../api/submissions'
import { useToast } from '../../context/ToastContext'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import Modal from '../ui/Modal'
import { serializeSmartGoal, slotGoals } from '../../utils/personalProgression'
import { ReviewerNotes, SmartDetails, Waiting } from './shared'
import { ensureSubmission, useConfirm } from './actions'
import SmartGoalForm from './SmartGoalForm'
import styles from './Progression.module.css'

function GoalCard({ slot, editable, onEdit, onRemove }) {
  const { cat, data } = slot
  const [confirmRemove, setConfirmRemove] = useState(false)
  return (
    <div className={`${styles.card} ${data ? styles.cardDone : ''}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <span className={styles.cardTitle}>{cat.label}</span>
          <span className={styles.cardSub}>{cat.blurb}</span>
        </div>
        {data && <span className={styles.doneMark}>✓ Set</span>}
      </div>

      {data ? (
        <>
          <span className={styles.goalStatement}>{data.goal}</span>
          <SmartDetails goal={data} />
          {editable && (
            <div className={`${styles.actions} ${styles.actionsBottom}`}>
              <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
              {confirmRemove ? (
                <>
                  <Button variant="danger" size="sm" onClick={onRemove}>Remove goal</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(false)}>Keep</Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(true)}>Remove</Button>
              )}
            </div>
          )}
        </>
      ) : (
        editable && (
          <div className={`${styles.actions} ${styles.actionsBottom}`}>
            <Button size="sm" onClick={onEdit}>Set this goal</Button>
          </div>
        )
      )}
    </div>
  )
}

export default function SetGoalsStep({ level, onChanged }) {
  const addToast = useToast()
  const task = level.setGoals
  const sub = task.sub
  const status = sub?.status ?? null
  const editable = !status || status === 'draft' || status === 'rejected'
  const { slots } = slotGoals(sub?.evidence)
  const filled = slots.filter((s) => s.data).length
  const [editingKey, setEditingKey] = useState(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const confirm = useConfirm()
  const editingSlot = slots.find((s) => s.cat.key === editingKey) ?? null

  function closeModal() {
    if (saving) return
    setEditingKey(null)
    setError('')
  }

  async function handleSave(slot, values) {
    setSaving(true)
    setError('')
    try {
      const s = await ensureSubmission(task)
      const text = serializeSmartGoal({ ...values, category: slot.cat.label })
      if (slot.ev) await updateEvidence(slot.ev.id, text)
      else await addEvidence(s.id, { textNote: text })
      setEditingKey(null)
      addToast({ message: `${slot.cat.label} goal saved`, variant: 'success' })
      await onChanged()
    } catch (err) {
      setError(err.message || 'Could not save that goal.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(slot) {
    setError('')
    try {
      await deleteEvidence(slot.ev.id)
      await onChanged()
    } catch (err) {
      setError(err.message || 'Could not remove that goal.')
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      await submitForReview(sub.id)
      addToast({ message: 'Goals sent to a Scouter for approval', variant: 'success' })
      confirm.disarm()
      await onChanged()
    } catch (err) {
      setError(err.message || 'Could not submit your goals.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Set your {level.name} goals</h2>
        <p className={styles.stepLead}>
          Write one <strong>SMART</strong> goal for each of the six areas: Specific, Measurable,
          Attainable, Relevant and Time-bound. Your progress saves as you go.
          When all six are set, send them to a Scouter for approval.
        </p>
      </div>

      {status === 'submitted' && (
        <Waiting title="Your goals are with a Scouter for approval">
          Once they're approved you'll be able to start completing them. Here's what you sent.
        </Waiting>
      )}

      <ReviewerNotes sub={sub} />

      <div className={styles.grid}>
        {slots.map((slot) => (
          <GoalCard
            key={slot.cat.key}
            slot={slot}
            editable={editable}
            onEdit={() => { setError(''); setEditingKey(slot.cat.key) }}
            onRemove={() => handleRemove(slot)}
          />
        ))}
      </div>

      {!editingSlot && <ErrorMessage message={error} />}

      {editingSlot && (
        <Modal
          title={`${editingSlot.data ? 'Edit' : 'Set'} your ${editingSlot.cat.label} goal`}
          onClose={closeModal}
        >
          <p className={styles.cardSub}>{editingSlot.cat.blurb}</p>
          <SmartGoalForm
            initial={editingSlot.data}
            onSave={(values) => handleSave(editingSlot, values)}
            onCancel={closeModal}
            saving={saving}
          />
          <ErrorMessage message={error} />
        </Modal>
      )}

      {editable && (
        <div className={styles.footerActions}>
          <span className={styles.footerHint}>
            {filled < slots.length
              ? `${filled} of ${slots.length} goals set. Set the rest to continue.`
              : 'All goals set! After you submit, only a Scouter can change them.'}
          </span>
          {confirm.armed ? (
            <>
              <span className={styles.confirmText}>Submit? Your goals will be locked.</span>
              <Button variant="ghost" onClick={confirm.disarm} disabled={submitting}>Not yet</Button>
              <Button onClick={handleSubmit} loading={submitting}>Yes, submit goals</Button>
            </>
          ) : (
            <Button onClick={confirm.arm} disabled={filled < slots.length}>
              Submit goals for approval
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
