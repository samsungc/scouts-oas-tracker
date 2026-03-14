import { useState } from 'react'
import { addEvidence } from '../../api/submissions'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import styles from './EvidenceForm.module.css'

export default function EvidenceForm({ submissionId, onAdded }) {
  const [mode, setMode] = useState('text') // 'text' | 'file'
  const [textNote, setTextNote] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'text' && !textNote.trim()) return
    if (mode === 'file' && !file) return
    setLoading(true)
    setError('')
    try {
      const ev = await addEvidence(submissionId, {
        textNote: mode === 'text' ? textNote.trim() : undefined,
        file: mode === 'file' ? file : undefined,
      })
      setTextNote('')
      setFile(null)
      onAdded(ev)
    } catch (err) {
      setError(err.message || 'Failed to add evidence.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h4 className={styles.formTitle}>Add Evidence</h4>
      <div className={styles.toggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'text' ? styles.active : ''}`}
          onClick={() => setMode('text')}
        >
          Text Note
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mode === 'file' ? styles.active : ''}`}
          onClick={() => setMode('file')}
        >
          File Upload
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          className={styles.textarea}
          placeholder="Describe what you did to complete this requirement…"
          value={textNote}
          onChange={(e) => setTextNote(e.target.value)}
          rows={4}
          required
        />
      ) : (
        <input
          className={styles.fileInput}
          type="file"
          onChange={(e) => setFile(e.target.files[0] || null)}
          required
        />
      )}

      <ErrorMessage message={error} />

      <Button type="submit" variant="secondary" disabled={loading} size="sm">
        {loading ? 'Adding…' : 'Add Evidence'}
      </Button>
    </form>
  )
}
