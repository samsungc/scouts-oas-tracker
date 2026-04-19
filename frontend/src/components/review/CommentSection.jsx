import { useState, useRef } from 'react'
import { addComment, updateComment, deleteComment } from '../../api/review'
import { useAuth } from '../../context/AuthContext'
import styles from './CommentSection.module.css'

function highlightMentions(text) {
  const parts = text.split(/(@[\w.]+)/g)
  return parts.map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className={styles.mention}>{part}</span>
      : part
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
}

export default function CommentSection({ submissionId, initialComments = [], scouters = [], open = false, onOpen }) {
  const { user } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [body, setBody] = useState('')
  const [notifyMentions, setNotifyMentions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [mentionQuery, setMentionQuery] = useState(null)
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editBody, setEditBody] = useState('')
  const [editError, setEditError] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const textareaRef = useRef(null)

  const filteredScouters = mentionQuery != null
    ? scouters.filter(s =>
        s.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        s.display_name.toLowerCase().includes(mentionQuery.toLowerCase())
      ).slice(0, 6)
    : []

  function handleBodyChange(e) {
    const val = e.target.value
    setBody(val)
    setError(null)

    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@([\w.]*)$/)
    if (match) {
      setMentionQuery(match[1])
      setDropdownIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  function insertMention(username) {
    const cursor = textareaRef.current.selectionStart
    const textBefore = body.slice(0, cursor)
    const textAfter = body.slice(cursor)
    const replaced = textBefore.replace(/@[\w.]*$/, `@${username} `)
    const newBody = replaced + textAfter
    setBody(newBody)
    setMentionQuery(null)
    setTimeout(() => {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(replaced.length, replaced.length)
    }, 0)
  }

  function handleKeyDown(e) {
    if (mentionQuery == null || filteredScouters.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDropdownIndex(i => Math.min(i + 1, filteredScouters.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDropdownIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      insertMention(filteredScouters[dropdownIndex].username)
    } else if (e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  async function handleDelete(commentId) {
try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      // silently ignore — rare edge case
    }
  }

  function startEdit(c) {
    setEditingId(c.id)
    setEditBody(c.body)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditBody('')
    setEditError(null)
  }

  async function handleEditSave(commentId) {
    if (!editBody.trim()) return
    setEditSaving(true)
    setEditError(null)
    try {
      const updated = await updateComment(commentId, editBody.trim())
      setComments(prev => prev.map(c => c.id === commentId ? updated : c))
      setEditingId(null)
    } catch (err) {
      const data = err.response?.data ?? err.raw
      if (data?.invalid_mentions) {
        setEditError(`Unknown scouter(s): ${data.invalid_mentions.join(', ')}`)
      } else {
        setEditError('Failed to save.')
      }
    } finally {
      setEditSaving(false)
    }
  }

  const [showForm, setShowForm] = useState(open)
  const hasMentionInBody = /@[\w.]+/.test(body)

  function openForm() {
    setShowForm(true)
    onOpen?.()
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await addComment(submissionId, body.trim(), notifyMentions)
      setComments(prev => [...prev, res])
      setBody('')
      setNotifyMentions(true)
      setShowForm(false)
    } catch (err) {
      const data = err.response?.data ?? err.raw
      if (data?.invalid_mentions) {
        setError(`Unknown scouter(s): ${data.invalid_mentions.join(', ')}. Only active scouters can be mentioned.`)
      } else {
        setError('Failed to post comment.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Scouter Notes</span>
        {comments.length > 0 && <span className={styles.count}>{comments.length}</span>}
        {!showForm && (
          <button className={styles.addCommentBtn} onClick={openForm}>+ Comment</button>
        )}
      </div>

      {comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map(c => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentMeta}>
                <span className={styles.author}>{c.author_display_name}</span>
                <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                {c.is_edited && <span className={styles.editedTag}>(edited)</span>}
                {c.author_username === user?.username && editingId !== c.id && (
                  <span className={styles.commentActions}>
                    <button className={styles.iconBtn} onClick={() => startEdit(c)} title="Edit">✎</button>
                    <button className={styles.iconBtn} onClick={() => handleDelete(c.id)} title="Delete">✕</button>
                  </span>
                )}
              </div>
              {editingId === c.id ? (
                <div className={styles.editWrap}>
                  <textarea
                    className={styles.textarea}
                    value={editBody}
                    onChange={e => { setEditBody(e.target.value); setEditError(null) }}
                    rows={2}
                    disabled={editSaving}
                  />
                  {editError && <p className={styles.error}>{editError}</p>}
                  <div className={styles.editActions}>
                    <button className={styles.cancelBtn} onClick={cancelEdit} disabled={editSaving}>Cancel</button>
                    <button className={styles.submitBtn} onClick={() => handleEditSave(c.id)} disabled={editSaving || !editBody.trim()}>
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.commentBody}>{highlightMentions(c.body)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.textareaWrap}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Add a note… use @username to mention a scouter"
              value={body}
              onChange={handleBodyChange}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={submitting}
            />
            {mentionQuery != null && filteredScouters.length > 0 && (
              <ul className={styles.dropdown}>
                {filteredScouters.map((s, i) => (
                  <li
                    key={s.username}
                    className={`${styles.dropdownItem} ${i === dropdownIndex ? styles.dropdownItemActive : ''}`}
                    onMouseDown={e => { e.preventDefault(); insertMention(s.username) }}
                  >
                    <span className={styles.dropdownUsername}>@{s.username}</span>
                    {s.display_name !== s.username && (
                      <span className={styles.dropdownName}>{s.display_name}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formFooter}>
            {hasMentionInBody && (
              <label className={styles.notifyLabel}>
                <input
                  type="checkbox"
                  checked={notifyMentions}
                  onChange={e => setNotifyMentions(e.target.checked)}
                />
                Notify mentioned scouters
              </label>
            )}
            <button className={styles.cancelBtn} type="button" onClick={() => { setShowForm(false); setBody(''); setError(null) }} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !body.trim()}
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
