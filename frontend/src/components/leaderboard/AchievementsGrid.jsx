import { useState } from 'react'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import { getAchievementScouts } from '../../api/leaderboard'
import styles from './AchievementsGrid.module.css'

export default function AchievementsGrid({ achievements }) {
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [scouts, setScouts] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  async function handleCardClick(a) {
    setSelectedAchievement(a)
    setScouts([])
    setModalError('')
    setModalLoading(true)
    try {
      const data = await getAchievementScouts(a.id)
      setScouts(data.scouts)
    } catch {
      setModalError('Failed to load scouts.')
    } finally {
      setModalLoading(false)
    }
  }

  function handleClose() {
    setSelectedAchievement(null)
    setScouts([])
    setModalError('')
  }

  return (
    <>
      <div className={styles.grid}>
        {achievements.map((a) => {
          const cardClass = [
            styles.card,
            a.mystery
              ? (a.unlocked ? styles.mysteryUnlocked : styles.locked)
              : (a.unlocked ? styles.unlocked : styles.locked),
            styles.clickable,
          ].join(' ')

          return (
            <div
              key={a.id}
              className={cardClass}
              onClick={() => handleCardClick(a)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(a) }}
            >
              <span className={styles.name}>{a.name}</span>
              <span className={styles.desc}>{a.description}</span>
              <span className={styles.pct}>{a.percent_holding}% of scouts</span>
            </div>
          )
        })}
      </div>

      {selectedAchievement && (
        <Modal
          title={selectedAchievement.mystery ? 'Mystery Achievement' : selectedAchievement.name}
          onClose={handleClose}
        >
          {modalLoading && <Spinner centered />}
          {modalError && <p className={styles.modalError}>{modalError}</p>}
          {!modalLoading && !modalError && (
            scouts.length === 0
              ? <p className={styles.emptyState}>No scouts have earned this achievement yet.</p>
              : (
                <ul className={styles.scoutList}>
                  {scouts.map((s) => (
                    <li key={s.id} className={styles.scoutItem}>
                      {s.first_name} {s.last_name}
                    </li>
                  ))}
                </ul>
              )
          )}
        </Modal>
      )}
    </>
  )
}
