import { useState, forwardRef, useImperativeHandle } from 'react'
import { deleteEvidence, updateEvidence } from '../../api/submissions'
import { mediaUrl } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import styles from './EvidenceList.module.css'

const SMART_LABELS = {
  s: { letter: 'S', label: 'Specific' },
  m: { letter: 'M', label: 'Measurable' },
  a: { letter: 'A', label: 'Attainable' },
  r: { letter: 'R', label: 'Relevant' },
  t: { letter: 'T', label: 'Time-Bound' },
}

const SMART_FIELDS = [
  { key: 's', letter: 'S', label: 'Specific',   prompt: 'What am I going to do? Why is this important to me?' },
  { key: 'm', letter: 'M', label: 'Measurable',  prompt: 'How will I measure my success?' },
  { key: 'a', letter: 'A', label: 'Attainable',  prompt: 'What will I do to achieve this goal?' },
  { key: 'r', letter: 'R', label: 'Relevant',    prompt: 'Is this goal worthwhile? How will achieving it help me?' },
  { key: 't', letter: 'T', label: 'Time-Bound',  prompt: 'When will I accomplish my goal?' },
]

function SmartGoalDisplay({ data }) {
  return (
    <div className={styles.smartGoal}>
      <span className={styles.smartTitle}>SMART Goal</span>
      {data.category && (
        <div className={styles.goalStatement}>
          <span className={styles.goalStatementLabel}>Category: <span className={styles.goalStatementText}>{data.category}</span></span>
        </div>
      )}
      {Object.entries(SMART_LABELS).map(([key, { letter, label }]) =>
        data[key] ? (
          <div key={key} className={styles.smartRow}>
            <span className={styles.smartLetter}>{letter}</span>
            <div className={styles.smartContent}>
              <span className={styles.smartLabel}>{label}</span>
              <span className={styles.smartText}>{data[key]}</span>
            </div>
          </div>
        ) : null
      )}
      {data.goal && (
        <div className={styles.goalStatement}>
          <span className={styles.goalStatementLabel}>Goal Statement</span>
          <span className={styles.goalStatementText}>{data.goal}</span>
        </div>
      )}
    </div>
  )
}

function parseSmartGoal(text) {
  if (!text || !text.startsWith('{"__type":"smart_goal"')) return null
  try {
    const data = JSON.parse(text)
    return data.__type === 'smart_goal' ? data : null
  } catch {
    return null
  }
}

const EvidenceList = forwardRef(function EvidenceList({ evidence, isDraft, onDeleted, onUpdated }, ref) {
  const addToast = useToast()
  const [confirmId, setConfirmId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editSmart, setEditSmart] = useState(null)
  const [saving, setSaving] = useState(false)

  useImperativeHandle(ref, () => ({
    saveIfEditing: async () => {
      if (!editingId) return
      const ev = evidence.find((e) => e.id === editingId)
      if (ev) await handleSave(ev)
    },
  }))

  async function handleDelete(evidenceId) {
    await deleteEvidence(evidenceId)
    onDeleted(evidenceId)
    setConfirmId(null)
    addToast({ message: 'Evidence removed', variant: 'info' })
  }

  function startEdit(ev) {
    const smartData = ev.text_note ? parseSmartGoal(ev.text_note) : null
    setEditingId(ev.id)
    if (smartData) {
      setEditSmart({ category: smartData.category || '', s: smartData.s || '', m: smartData.m || '', a: smartData.a || '', r: smartData.r || '', t: smartData.t || '', goal: smartData.goal || '' })
      setEditText('')
    } else {
      setEditText(ev.text_note || '')
      setEditSmart(null)
    }
    setConfirmId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
    setEditSmart(null)
  }

  async function handleSave(ev) {
    const newTextNote = editSmart
      ? JSON.stringify({ __type: 'smart_goal', ...editSmart })
      : editText.trim()

    if (!newTextNote) return

    setSaving(true)
    try {
      const updated = await updateEvidence(ev.id, newTextNote)
      onUpdated(updated)
      setEditingId(null)
      setEditText('')
      setEditSmart(null)
      addToast({ message: 'Evidence updated', variant: 'success' })
    } catch (err) {
      addToast({ message: err.message || 'Failed to update evidence.', variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!evidence || evidence.length === 0) {
    return <p className={styles.empty}>No evidence added yet.</p>
  }

  return (
    <ul className={styles.list}>
      {evidence.map((ev) => {
        const smartData = ev.text_note ? parseSmartGoal(ev.text_note) : null
        const isEditing = editingId === ev.id
        const canEdit = isDraft && !ev.file

        return (
          <li key={ev.id} className={styles.item}>
            <div className={styles.content}>
              {isEditing ? (
                editSmart ? (
                  <div className={styles.editForm}>
                    <div className={styles.editField}>
                      <label className={styles.editLabel}>Category</label>
                      <textarea
                        className={styles.editTextarea}
                        value={editSmart.category}
                        onChange={(e) => setEditSmart((p) => ({ ...p, category: e.target.value }))}
                        rows={1}
                      />
                    </div>
                    {SMART_FIELDS.map(({ key, letter, label, prompt }) => (
                      <div key={key} className={styles.editField}>
                        <label className={styles.editLabel}>
                          <span className={styles.editSmartLetter}>{letter}</span> {label}
                          <span className={styles.editPrompt}>{prompt}</span>
                        </label>
                        <textarea
                          className={styles.editTextarea}
                          value={editSmart[key]}
                          onChange={(e) => setEditSmart((p) => ({ ...p, [key]: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    ))}
                    <div className={styles.editField}>
                      <label className={styles.editLabel}>Goal Statement</label>
                      <textarea
                        className={styles.editTextarea}
                        value={editSmart.goal}
                        onChange={(e) => setEditSmart((p) => ({ ...p, goal: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={() => handleSave(ev)} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className={styles.cancelBtn} onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.editForm}>
                    <textarea
                      className={styles.editTextarea}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={() => handleSave(ev)} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className={styles.cancelBtn} onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <>
                  {smartData ? (
                    <SmartGoalDisplay data={smartData} />
                  ) : ev.text_note ? (
                    <p className={styles.textNote}>{ev.text_note}</p>
                  ) : null}
                  {ev.file && (() => {
                    const url = mediaUrl(ev.file)
                    const filename = ev.file.split('/').pop()
                    const isImage = /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(filename)
                    return isImage ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={filename} className={styles.imagePreview} />
                      </a>
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        📎 {filename}
                      </a>
                    )
                  })()}
                  <span className={styles.timestamp}>
                    {new Date(ev.uploaded_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            {isDraft && !isEditing && (
              confirmId === ev.id ? (
                <div className={styles.deleteConfirm}>
                  <span className={styles.deleteConfirmText}>Delete?</span>
                  <button className={styles.deleteConfirmYes} onClick={() => handleDelete(ev.id)}>Yes</button>
                  <button className={styles.deleteConfirmNo} onClick={() => setConfirmId(null)}>No</button>
                </div>
              ) : (
                <div className={styles.itemActions}>
                  {canEdit && (
                    <button
                      className={styles.editBtn}
                      onClick={() => startEdit(ev)}
                      aria-label="Edit evidence"
                    >
                      ✎
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setConfirmId(ev.id)}
                    aria-label="Delete evidence"
                  >
                    ✕
                  </button>
                </div>
              )
            )}
          </li>
        )
      })}
    </ul>
  )
})

export default EvidenceList
