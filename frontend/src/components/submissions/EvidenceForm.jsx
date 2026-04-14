import { useState, forwardRef, useImperativeHandle } from 'react'
import { addEvidence } from '../../api/submissions'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { useToast } from '../../context/ToastContext'
import styles from './EvidenceForm.module.css'

const SMART_FIELDS = [
  { key: 's', letter: 'S', label: 'Specific',    prompt: 'What am I going to do? Why is this important to me?' },
  { key: 'm', letter: 'M', label: 'Measurable',  prompt: 'How will I measure my success? How will I know when I have achieved my goal?' },
  { key: 'a', letter: 'A', label: 'Attainable',  prompt: 'What will I do to achieve this goal? How will I accomplish this goal?' },
  { key: 'r', letter: 'R', label: 'Relevant',    prompt: 'Is this goal worthwhile? How will achieving it help me? Does this goal fit my values?' },
  { key: 't', letter: 'T', label: 'Time-Bound',  prompt: 'When will I accomplish my goal? How long will I give myself?' },
]

const EMPTY_SMART = { category: '', s: '', m: '', a: '', r: '', t: '', goal: '' }

const SPICES_FIELDS = [
  { key: 'social',       letter: 'S', label: 'Social',       prompt: 'What have you learned about working with others and being part of a team through your time in Venturers?' },
  { key: 'physical',     letter: 'P', label: 'Physical',     prompt: 'What have you learned about physical activity, your health, or taking care of your body through Venturers?' },
  { key: 'intellectual', letter: 'I', label: 'Intellectual', prompt: 'What new skills, knowledge, or ways of thinking have you developed through Venturers?' },
  { key: 'character',    letter: 'C', label: 'Character',    prompt: 'How has Venturers shaped your values, sense of responsibility, or who you are as a person?' },
  { key: 'emotional',    letter: 'E', label: 'Emotional',    prompt: 'What emotional growth have you experienced through your time in Venturers? How have you learned to handle your feelings or support others?' },
  { key: 'spiritual',    letter: 'S', label: 'Spiritual',    prompt: 'How has Venturers connected you to something larger — whether that\'s nature, your community, your beliefs, or a sense of purpose?' },
]

const EMPTY_SPICES = { social: '', physical: '', intellectual: '', character: '', emotional: '', spiritual: '', reflection: '' }

const EvidenceForm = forwardRef(function EvidenceForm({ submissionId, onAdded }, ref) {
  const addToast = useToast()
  const [mode, setMode] = useState('text') // 'text' | 'file' | 'goal' | 'spices'
  const [textNote, setTextNote] = useState('')
  const [file, setFile] = useState(null)
  const [smart, setSmart] = useState(EMPTY_SMART)
  const [spices, setSpices] = useState(EMPTY_SPICES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf']
  const MAX_SIZE = 10 * 1024 * 1024

  function handleSmartChange(key, value) {
    setSmart((prev) => ({ ...prev, [key]: value }))
  }

  function handleSpicesChange(key, value) {
    setSpices((prev) => ({ ...prev, [key]: value }))
  }

  async function doAddEvidence() {
    if (mode === 'text' && !textNote.trim()) return false
    if (mode === 'file' && !file) return false
    if (mode === 'goal') {
      const missing = SMART_FIELDS.some((f) => !smart[f.key].trim())
      if (!smart.category.trim() || missing || !smart.goal.trim()) {
        setError('Please fill in all SMART goal fields.')
        return false
      }
    }
    if (mode === 'spices') {
      const missing = SPICES_FIELDS.some((f) => !spices[f.key].trim())
      if (missing || !spices.reflection.trim()) {
        setError('Please fill in all SPICES review fields.')
        return false
      }
    }
    if (mode === 'file') {
      if (file.size > MAX_SIZE) { setError('File must be 10 MB or smaller.'); return false }
      if (!ALLOWED_TYPES.some((t) => file.type.startsWith(t))) {
        setError('Only photos, videos, and PDFs are allowed.')
        return false
      }
    }

    setLoading(true)
    setError('')
    try {
      const payload =
        mode === 'goal'
          ? { textNote: JSON.stringify({ __type: 'smart_goal', ...smart }) }
          : mode === 'spices'
          ? { textNote: JSON.stringify({ __type: 'spices_review', ...spices }) }
          : mode === 'text'
          ? { textNote: textNote.trim() }
          : { file }

      const ev = await addEvidence(submissionId, payload)
      if (mode === 'text') setTextNote('')
      if (mode === 'file') setFile(null)
      if (mode === 'goal') setSmart(EMPTY_SMART)
      if (mode === 'spices') setSpices(EMPTY_SPICES)
      onAdded(ev)
      addToast({ message: 'Evidence added', variant: 'success' })
      return true
    } catch (err) {
      setError(err.message || 'Failed to add evidence.')
      return false
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    submitIfDirty: async () => {
      const isDirty =
        (mode === 'text' && textNote.trim() !== '') ||
        (mode === 'file' && file !== null) ||
        (mode === 'goal' && (smart.category.trim() !== '' || SMART_FIELDS.some((f) => smart[f.key].trim()) || smart.goal.trim() !== '')) ||
        (mode === 'spices' && (SPICES_FIELDS.some((f) => spices[f.key].trim()) || spices.reflection.trim() !== ''))
      if (!isDirty) return false
      return doAddEvidence()
    },
  }))

  async function handleSubmit(e) {
    e.preventDefault()
    await doAddEvidence()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h4 className={styles.formTitle}>Add Evidence</h4>
      <div className={styles.toggle}>
        {['text', 'file', 'goal', 'spices'].map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.toggleBtn} ${mode === m ? styles.active : ''}`}
            onClick={() => { setMode(m); setError('') }}
          >
            {m === 'text' ? 'Text Note' : m === 'file' ? 'File Upload' : m === 'goal' ? 'SMART Goal' : 'SPICES Review'}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <textarea
          className={styles.textarea}
          placeholder="Describe what you did to complete this requirement…"
          value={textNote}
          onChange={(e) => setTextNote(e.target.value)}
          rows={4}
          required
        />
      )}

      {mode === 'file' && (
        <input
          className={styles.fileInput}
          type="file"
          accept="image/*,video/*,.pdf"
          onChange={(e) => setFile(e.target.files[0] || null)}
          required
        />
      )}

      {mode === 'goal' && (
        <div className={styles.goalForm}>
          <div className={styles.goalField}>
            <label className={styles.goalLabel}>
              <span className={styles.goalLabelText}>Category</span>
              <span className={styles.goalPrompt}>What area does this goal relate to?</span>
            </label>
            <textarea
              className={styles.goalTextarea}
              value={smart.category}
              onChange={(e) => handleSmartChange('category', e.target.value)}
              rows={1}
              placeholder="e.g. Outdoor & Environment, Creative Expression, Citizenship, Active & Healthy Living, Leadership, Belief & Values…"
            />
          </div>
          {SMART_FIELDS.map(({ key, letter, label, prompt }) => (
            <div key={key} className={styles.goalField}>
              <label className={styles.goalLabel}>
                <span className={styles.goalLetter}>{letter}</span>
                <span className={styles.goalLabelText}>{label}</span>
                <span className={styles.goalPrompt}>{prompt}</span>
              </label>
              <textarea
                className={styles.goalTextarea}
                value={smart[key]}
                onChange={(e) => handleSmartChange(key, e.target.value)}
                rows={2}
                placeholder={`Your ${label.toLowerCase()} goal…`}
              />
            </div>
          ))}
          <div className={styles.goalField}>
            <label className={styles.goalLabel}>
              <span className={styles.goalLabelText}>Complete Goal Statement</span>
              <span className={styles.goalPrompt}>Write your full goal in one clear sentence.</span>
            </label>
            <textarea
              className={styles.goalTextarea}
              value={smart.goal}
              onChange={(e) => handleSmartChange('goal', e.target.value)}
              rows={2}
              placeholder="My goal is to…"
            />
          </div>
        </div>
      )}

      {mode === 'spices' && (
        <div className={styles.goalForm}>
          <p className={styles.spicesIntro}>
            Reflect on what you have learned in Venturers across each of the SPICES dimensions.
            This review is meant to be discussed with your Company Leadership Team or a Scouter.
          </p>
          {SPICES_FIELDS.map(({ key, letter, label, prompt }) => (
            <div key={key} className={styles.goalField}>
              <label className={styles.goalLabel}>
                <span className={styles.goalLetter}>{letter}</span>
                <span className={styles.goalLabelText}>{label}</span>
                <span className={styles.goalPrompt}>{prompt}</span>
              </label>
              <textarea
                className={styles.goalTextarea}
                value={spices[key]}
                onChange={(e) => handleSpicesChange(key, e.target.value)}
                rows={3}
                placeholder={`Your reflection on ${label.toLowerCase()}…`}
              />
            </div>
          ))}
          <div className={styles.goalField}>
            <label className={styles.goalLabel}>
              <span className={styles.goalLabelText}>Overall Reflection</span>
              <span className={styles.goalPrompt}>What are you most proud of from your time in Venturers, and what will you carry forward?</span>
            </label>
            <textarea
              className={styles.goalTextarea}
              value={spices.reflection}
              onChange={(e) => handleSpicesChange('reflection', e.target.value)}
              rows={3}
              placeholder="My overall reflection…"
            />
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

      <Button type="submit" variant="secondary" loading={loading} size="sm">
        Add Evidence
      </Button>
    </form>
  )
})

export default EvidenceForm
