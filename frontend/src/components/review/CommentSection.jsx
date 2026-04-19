import { useState, useRef, useEffect } from 'react'
import { addComment } from '../../api/review'
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

export default function CommentSection({ submissionId, initialComments = [], scouters = [] }) {
  const [comments, setComments] = useState(initialComments)
  const [body, setBody] = useState('')
  const [notifyMentions, setNotifyMentions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [mentionQuery, setMentionQuery] = useState(null)
  const [dropdownIndex, setDropdownIndex] = useState(0)
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
    } catch (err) {
      const data = err.response?.data
      if (data?.invalid_mentions) {
        setError(`Unknown scouter(s): ${data.invalid_mentions.join(', ')}. Only active scouters can be mentioned.`)
      } else {
        setError('Failed to post comment.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const hasMentionInBody = /@[\w.]+/.test(body)

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.lockIcon}>🔒</span>
        <span className={styles.sectionTitle}>Scouter Notes</span>
        {comments.length > 0 && <span className={styles.count}>{comments.length}</span>}
      </div>

      {comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map(c => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentMeta}>
                <span className={styles.author}>{c.author_display_name}</span>
                <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
              </div>
              <p className={styles.commentBody}>{highlightMentions(c.body)}</p>
            </div>
          ))}
        </div>
      )}

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
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || !body.trim()}
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
