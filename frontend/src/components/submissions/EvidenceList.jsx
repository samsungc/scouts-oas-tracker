import { deleteEvidence } from '../../api/submissions'
import { mediaUrl } from '../../api/client'
import styles from './EvidenceList.module.css'

const SMART_LABELS = {
  s: { letter: 'S', label: 'Specific' },
  m: { letter: 'M', label: 'Measurable' },
  a: { letter: 'A', label: 'Attainable' },
  r: { letter: 'R', label: 'Relevant' },
  t: { letter: 'T', label: 'Time-Bound' },
}

function SmartGoalDisplay({ data }) {
  return (
    <div className={styles.smartGoal}>
      <span className={styles.smartTitle}>SMART Goal</span>
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

export default function EvidenceList({ evidence, isDraft, onDeleted }) {
  async function handleDelete(evidenceId) {
    await deleteEvidence(evidenceId)
    onDeleted(evidenceId)
  }

  if (!evidence || evidence.length === 0) {
    return <p className={styles.empty}>No evidence added yet.</p>
  }

  return (
    <ul className={styles.list}>
      {evidence.map((ev) => {
        const smartData = ev.text_note ? parseSmartGoal(ev.text_note) : null
        return (
          <li key={ev.id} className={styles.item}>
            <div className={styles.content}>
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
            </div>
            {isDraft && (
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(ev.id)}
                aria-label="Delete evidence"
              >
                ✕
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
