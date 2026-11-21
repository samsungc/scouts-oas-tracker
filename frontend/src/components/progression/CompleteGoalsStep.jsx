import { useState, useId } from 'react'
import { createSubmission, addEvidence, submitForReview } from '../../api/submissions'
import { useToast } from '../../context/ToastContext'
import StatusPill from '../ui/StatusPill'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import {
  PP_GOAL_CATEGORIES, parseCompletedGoal, serializeCompletedGoal, sameGoal, isApproved, isSent,
  slotGoals,
} from '../../utils/personalProgression'
import { SmartDetails, ProgressRow, Waiting, FilePicker } from './shared'
import { validateFiles, uploadFiles, isEmptyAttempt } from './actions'
import RequirementTask from './RequirementTask'
import styles from './Progression.module.css'

/** Form shown when a scout marks a goal as finished. `goal` is null for older records with no goals on file. */
function FinishGoalForm({ goal, onSubmit, onCancel, busy }) {
  const id = useId()
  const [category, setCategory] = useState('')
  const [statement, setStatement] = useState('')
  const [details, setDetails] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!goal && (!category || !statement.trim())) {
      setError('Pick the area and write down the goal you completed.')
      return
    }
    if (!details.trim()) {
      setError('Tell the Scouter how you completed this goal.')
      return
    }
    const fileError = validateFiles(files)
    if (fileError) { setError(fileError); return }
    setError('')
    onSubmit({
      category: goal?.category ?? category,
      goal: goal?.goal ?? statement.trim(),
      details: details.trim(),
      files,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {!goal && (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-cat`}>
              <span className={styles.labelText}>Area</span>
            </label>
            <select id={`${id}-cat`} className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Choose an area…</option>
              {PP_GOAL_CATEGORIES.map((c) => <option key={c.key} value={c.label}>{c.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-goal`}>
              <span className={styles.labelText}>The goal you completed</span>
            </label>
            <textarea id={`${id}-goal`} className={styles.textarea} rows={2} value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="My goal was to…" />
          </div>
        </>
      )}
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-details`}>
          <span className={styles.labelText}>How did you complete it?</span>
          <span className={styles.prompt}>
            {goal?.m ? `You said you'd measure success by: "${goal.m}". Did you get there? ` : ''}
            Describe what you did and what you learned.
          </span>
        </label>
        <textarea id={`${id}-details`} className={styles.textarea} rows={4} value={details} onChange={(e) => setDetails(e.target.value)} autoFocus={!!goal} />
      </div>
      <FilePicker id={`${id}-files`} files={files} onChange={setFiles} />
      <ErrorMessage message={error} />
      <div className={styles.footerActions}>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" size="sm" loading={busy}>Submit for review</Button>
      </div>
    </form>
  )
}

export default function CompleteGoalsStep({ level, onChanged }) {
  const addToast = useToast()
  const [finishing, setFinishing] = useState(null) // goal index, or 'free' for goals not on file
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const slotsReq = level.completedGoals
  const required = slotsReq.length
  const approvedCount = slotsReq.filter(isApproved).length
  // A slot is free if it was never used, or an old attempt in it was deleted (emptied)
  const freeSlots = slotsReq.filter((t) => !t.sub || isEmptyAttempt(t))
  const allSent = slotsReq.every(isSent)

  // Goals the scout set (and a Scouter approved) for this level
  const goals = slotGoals(level.setGoals?.sub?.evidence).slots.filter((s) => s.data).map((s) => ({ ...s.data, cat: s.cat }))

  // Link each "Completed Goal #N" submission back to the goal it's for
  const linked = new Map() // goal index → task
  const unlinked = []
  for (const task of slotsReq) {
    if (!task.sub || isEmptyAttempt(task)) continue
    const record = (task.sub.evidence ?? []).map((e) => parseCompletedGoal(e.text_note)).find(Boolean)
    const idx = record ? goals.findIndex((g, i) => !linked.has(i) && sameGoal(g, record)) : -1
    if (idx >= 0) linked.set(idx, task)
    else unlinked.push({ task, record })
  }

  async function handleFinish({ category, goal, details, files }) {
    const slot = freeSlots[0]
    if (!slot) return
    setBusy(true)
    setError('')
    try {
      const s = slot.sub ?? await createSubmission(slot.req.id)
      await addEvidence(s.id, { textNote: serializeCompletedGoal({ category, goal, details }) })
      await uploadFiles(s.id, files)
      await submitForReview(s.id)
      setFinishing(null)
      addToast({ message: 'Goal sent to a Scouter for review', variant: 'success' })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
      await onChanged()
    }
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Complete your {level.name} goals</h2>
        <p className={styles.stepLead}>
          Pick any <strong>{required}</strong> of your goals to complete. When you finish one, mark it
          as finished and tell a Scouter how you did it.
        </p>
      </div>

      <ProgressRow done={approvedCount} total={required} />

      {allSent && approvedCount < required && (
        <Waiting title={`All ${required} goals are with a Scouter`}>
          You'll move on to expeditions once they're approved.
        </Waiting>
      )}

      <ErrorMessage message={error} />

      {goals.length > 0 ? (
        <div className={styles.list}>
          {goals.map((goal, i) => {
            const task = linked.get(i)
            const status = task?.sub?.status
            if (task && (status === 'draft' || status === 'rejected')) {
              return (
                <RequirementTask
                  key={i}
                  task={task}
                  title={`${goal.cat.label}: ${goal.goal}`}
                  notePrompt="Add anything the Scouter asked for, then submit again."
                  onChanged={onChanged}
                  discardable
                />
              )
            }
            return (
              <div
                key={i}
                className={`${styles.card} ${status === 'approved' ? styles.cardDone : ''} ${status === 'submitted' ? styles.cardWaiting : ''}`}
              >
                <div className={styles.cardHead}>
                  <div className={styles.cardTitleWrap}>
                    <span className={styles.cardTitle}>{goal.cat.label}</span>
                  </div>
                  {status && <StatusPill status={status} />}
                </div>
                <span className={styles.goalStatement}>{goal.goal}</span>
                <SmartDetails goal={goal} />
                {!task && finishing === i && (
                  <FinishGoalForm goal={goal} busy={busy} onSubmit={handleFinish} onCancel={() => setFinishing(null)} />
                )}
                {!task && finishing !== i && freeSlots.length > 0 && (
                  <div className={`${styles.actions} ${styles.actionsBottom}`}>
                    <Button size="sm" onClick={() => setFinishing(i)} disabled={finishing !== null}>
                      Mark as finished
                    </Button>
                  </div>
                )}
                {status === 'submitted' && <span className={styles.cardSub}>Waiting for a Scouter to review.</span>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.notice}>
          <span className={styles.noticeTitle}>Your goals aren't saved in the tracker</span>
          They were probably approved before the tracker stored goals. Use the button below to tell a
          Scouter which goal you finished.
        </div>
      )}

      {goals.length === 0 && freeSlots.length > 0 && (
        finishing === 'free' ? (
          <div className={styles.card}>
            <FinishGoalForm goal={null} busy={busy} onSubmit={handleFinish} onCancel={() => setFinishing(null)} />
          </div>
        ) : (
          <div className={styles.actions}>
            <Button onClick={() => setFinishing('free')} disabled={finishing !== null}>Mark a goal as finished</Button>
          </div>
        )
      )}

      {unlinked.length > 0 && (
        <>
          <h3 className={styles.sectionLabel}>Completed goals already on record</h3>
          <div className={styles.list}>
            {unlinked.map(({ task, record }) => (
              <RequirementTask
                key={task.req.id}
                task={task}
                title={record?.goal ? `${record.category}: ${record.goal}` : task.req.title}
                onChanged={onChanged}
                discardable
              />
            ))}
          </div>
        </>
      )}

    </div>
  )
}
