import { useState, useId } from 'react'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { SMART_FIELDS } from '../../utils/personalProgression'
import styles from './Progression.module.css'

const EMPTY = { s: '', m: '', a: '', r: '', t: '', goal: '' }

/** SMART goal editor. The category is fixed by the card it sits in. */
export default function SmartGoalForm({ initial, onSave, onCancel, saving }) {
  const id = useId()
  const [values, setValues] = useState(() => ({ ...EMPTY, ...(initial ?? {}) }))
  const [error, setError] = useState('')

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!values.goal.trim() || SMART_FIELDS.some((f) => !values[f.key]?.trim())) {
      setError('Please fill in every box. Each one helps a Scouter understand your goal.')
      return
    }
    setError('')
    onSave(values)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-goal`}>
          <span className={styles.labelText}>My goal</span>
          <span className={styles.prompt}>Write your goal in one clear sentence.</span>
        </label>
        <textarea
          id={`${id}-goal`}
          className={styles.textarea}
          rows={2}
          value={values.goal}
          onChange={(e) => set('goal', e.target.value)}
          placeholder="My goal is to…"
          autoFocus
        />
      </div>
      {SMART_FIELDS.map((f) => (
        <div key={f.key} className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-${f.key}`}>
            <span className={styles.labelText}>{f.label}</span>
            <span className={styles.prompt}>{f.prompt}</span>
          </label>
          <textarea
            id={`${id}-${f.key}`}
            className={styles.textarea}
            rows={2}
            value={values[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        </div>
      ))}
      <ErrorMessage message={error} />
      <div className={styles.footerActions}>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" size="sm" loading={saving}>Save goal</Button>
      </div>
    </form>
  )
}
