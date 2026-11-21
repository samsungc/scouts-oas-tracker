import { useState, forwardRef, useImperativeHandle } from 'react'
import { addEvidence } from '../../api/submissions'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { useToast } from '../../context/ToastContext'
import styles from './EvidenceForm.module.css'

// SMART goals and SPICES reviews are written on the Personal Progression page now,
// so this form only offers plain notes and file uploads.
const EvidenceForm = forwardRef(function EvidenceForm({ submissionId, onAdded }, ref) {
  const addToast = useToast()
  const [mode, setMode] = useState('text') // 'text' | 'file'
  const [textNote, setTextNote] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf']
  const MAX_SIZE = 10 * 1024 * 1024

  async function doAddEvidence() {
    if (mode === 'text' && !textNote.trim()) return false
    if (mode === 'file' && !file) return false
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
      const payload = mode === 'text' ? { textNote: textNote.trim() } : { file }
      const ev = await addEvidence(submissionId, payload)
      if (mode === 'text') setTextNote('')
      if (mode === 'file') setFile(null)
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
        (mode === 'file' && file !== null)
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
        {['text', 'file'].map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.toggleBtn} ${mode === m ? styles.active : ''}`}
            onClick={() => { setMode(m); setError('') }}
          >
            {m === 'text' ? 'Text Note' : 'File Upload'}
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

      <ErrorMessage message={error} />

      <Button type="submit" variant="secondary" loading={loading} size="sm">
        Add Evidence
      </Button>
    </form>
  )
})

export default EvidenceForm
