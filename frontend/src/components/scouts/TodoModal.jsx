import { useState } from 'react'
import Modal from '../ui/Modal'
import { markHandedOut, clearHandouts } from '../../api/handouts'
import styles from './TodoModal.module.css'

const CATEGORY_LABELS = {
  vertical_skills: 'Vertical Skills',
  sailing_skills: 'Sailing Skills',
  scoutcraft_skills: 'Scoutcraft Skills',
  camping_skills: 'Camping Skills',
  trail_skills: 'Trail Skills',
  winter_skills: 'Winter Skills',
  paddling_skills: 'Paddling Skills',
  aquatic_skills: 'Aquatic Skills',
  emergency_skills: 'Emergency Skills',
  personal_progression: 'Personal Progression',
  awards: 'Awards',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TodoModal({ items, setItems, onClose }) {
  const [sortBy, setSortBy] = useState('scout')
  const [confirmClear, setConfirmClear] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [clearing, setClearing] = useState(false)

  const pending = items.filter((i) => !i.handed_out)

  const sorted = [...pending].sort((a, b) => {
    if (sortBy === 'scout') return a.scout_name.localeCompare(b.scout_name)
    return a.badge_name.localeCompare(b.badge_name)
  })

  async function handleHandOut(item) {
    setLoadingId(item.id)
    try {
      const updated = await markHandedOut(item.id)
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      // ignore
    } finally {
      setLoadingId(null)
    }
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      await clearHandouts()
      const now = new Date().toISOString()
      setItems((prev) =>
        prev.map((i) => (i.handed_out ? i : { ...i, handed_out: true, handed_out_at: now }))
      )
      setConfirmClear(false)
    } catch {
      // ignore
    } finally {
      setClearing(false)
    }
  }

  return (
    <Modal title="Badge Handout To-Do" onClose={onClose}>
      <div className={styles.toolbar}>
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            className={`${styles.sortBtn} ${sortBy === 'scout' ? styles.active : ''}`}
            onClick={() => setSortBy('scout')}
          >
            Scout
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'badge' ? styles.active : ''}`}
            onClick={() => setSortBy('badge')}
          >
            Badge
          </button>
        </div>

        {!confirmClear ? (
          <button
            className={styles.clearBtn}
            onClick={() => setConfirmClear(true)}
            disabled={pending.length === 0}
          >
            Mark All as Handed Out
          </button>
        ) : (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>Mark all as handed out?</span>
            <button className={styles.confirmYes} onClick={handleClearAll} disabled={clearing}>
              {clearing ? 'Marking…' : 'Yes, mark all'}
            </button>
            <button className={styles.confirmNo} onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className={styles.empty}>No badges pending handout.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Scout</th>
                <th>Badge</th>
                <th>Category</th>
                <th>Completed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={styles.scoutName}>{item.scout_name}</span>
                    <span className={styles.username}>@{item.scout_username}</span>
                  </td>
                  <td>{item.badge_name}</td>
                  <td>{CATEGORY_LABELS[item.badge_category] ?? item.badge_category}</td>
                  <td>{formatDate(item.completed_at)}</td>
                  <td>
                    <button
                      className={styles.handOutBtn}
                      onClick={() => handleHandOut(item)}
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id ? '…' : 'Done'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
