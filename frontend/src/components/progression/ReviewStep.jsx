import { useState, useId } from 'react'
import { addEvidence, updateEvidence, submitForReview } from '../../api/submissions'
import { useToast } from '../../context/ToastContext'
import EvidenceList from '../submissions/EvidenceList'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { SPICES_FIELDS, parseSpicesReview, serializeSpicesReview } from '../../utils/personalProgression'
import { ReviewerNotes, Waiting } from './shared'
import { ensureSubmission } from './actions'
import styles from './Progression.module.css'

const EMPTY = Object.fromEntries([...SPICES_FIELDS.map((f) => [f.key, '']), ['reflection', '']])

function SpicesTask({ task, levelName, onChanged }) {
  const addToast = useToast()
  const id = useId()
  const { req, sub } = task
  const status = sub?.status ?? null
  const evidence = sub?.evidence ?? []
  const existing = evidence.find((e) => parseSpicesReview(e.text_note))
  const [values, setValues] = useState(() => ({ ...EMPTY, ...(existing ? parseSpicesReview(existing.text_note) : {}) }))
  const [busy, setBusy] = useState(null) // 'save' | 'submit'
  const [error, setError] = useState('')

  if (status === 'approved') {
    return <div className={`${styles.card} ${styles.cardDone}`}><span className={styles.cardTitle}>✓ {req.title}</span></div>
  }

  if (status === 'submitted') {
    return (
      <div className={styles.step}>
        <Waiting title={`Your ${levelName} review is with a Scouter`}>
          Have your SPICES chat with a Scouter if you haven't yet. They'll approve it after that.
        </Waiting>
        {existing && (
          <div className={styles.card}>
            <EvidenceList evidence={[existing]} isDraft={false} onDeleted={() => {}} />
          </div>
        )}
      </div>
    )
  }

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  async function save(andSubmit) {
    setError('')
    const missing = [...SPICES_FIELDS.map((f) => f.key), 'reflection'].some((k) => !values[k]?.trim())
    if (andSubmit && missing) {
      setError('Please answer every question before submitting.')
      return
    }
    setBusy(andSubmit ? 'submit' : 'save')
    try {
      const s = await ensureSubmission(task)
      const text = serializeSpicesReview(values)
      if (existing) await updateEvidence(existing.id, text)
      else await addEvidence(s.id, { textNote: text })
      if (andSubmit) {
        await submitForReview(s.id)
        addToast({ message: 'SPICES review submitted', variant: 'success' })
      } else {
        addToast({ message: 'Draft saved', variant: 'success' })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(null)
      await onChanged()
    }
  }

  return (
    <div className={`${styles.card} ${status === 'rejected' ? styles.cardAttention : ''}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <span className={styles.cardTitle}>{req.title}</span>
          {req.description && <span className={styles.cardSub}>{req.description}</span>}
        </div>
      </div>

      <ReviewerNotes sub={sub} />

      <div className={styles.form}>
        {SPICES_FIELDS.map((f) => (
          <div key={f.key} className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-${f.key}`}>
              <span className={styles.labelText}>{f.label}</span>
              <span className={styles.prompt}>{f.prompt}</span>
            </label>
            <textarea id={`${id}-${f.key}`} className={styles.textarea} rows={3} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          </div>
        ))}
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-reflection`}>
            <span className={styles.labelText}>Overall reflection</span>
            <span className={styles.prompt}>What are you most proud of from your time in Venturers, and what will you carry forward?</span>
          </label>
          <textarea id={`${id}-reflection`} className={styles.textarea} rows={3} value={values.reflection} onChange={(e) => set('reflection', e.target.value)} />
        </div>
      </div>


      <ErrorMessage message={error} />
      <div className={styles.footerActions}>
        <Button variant="secondary" onClick={() => save(false)} loading={busy === 'save'} disabled={!!busy}>Save draft</Button>
        <Button onClick={() => save(true)} loading={busy === 'submit'} disabled={!!busy}>Submit review</Button>
      </div>
    </div>
  )
}

export default function ReviewStep({ level, onChanged }) {
  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Your {level.name} SPICES review</h2>
        <p className={styles.stepLead}>
          Last step for {level.name}! Think back on your time in Venturers across the six SPICES areas.
          After you submit, have a quick chat with a Scouter about it.
        </p>
      </div>
      {level.reviews.map((task) => (
        <SpicesTask key={task.req.id} task={task} levelName={level.name} onChanged={onChanged} />
      ))}
    </div>
  )
}
