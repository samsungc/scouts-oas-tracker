import { deleteEvidence } from '../../api/submissions'
import { mediaUrl } from '../../api/client'
import styles from './EvidenceList.module.css'

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
      {evidence.map((ev) => (
        <li key={ev.id} className={styles.item}>
          <div className={styles.content}>
            {ev.text_note && (
              <p className={styles.textNote}>{ev.text_note}</p>
            )}
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
      ))}
    </ul>
  )
}
