import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatusPill from '../ui/StatusPill'
import styles from './RequirementRow.module.css'

export default function RequirementRow({ requirement, badgeId, submissionsMap, badgeLocked }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const submission = submissionsMap?.get(requirement.id)
  const isScout = user?.role === 'scout'
  const [hintOpen, setHintOpen] = useState(false)

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.order}>{requirement.order}.</span>
        <div className={styles.content}>
          <p className={styles.title}>{requirement.title}</p>
          {requirement.description && (
            <p className={styles.description}>{requirement.description}</p>
          )}
          {requirement.hint && (
            <div className={styles.hintBlock}>
              <button
                className={styles.hintToggle}
                onClick={() => setHintOpen((v) => !v)}
                aria-expanded={hintOpen}
              >
                <span className={styles.hintLabel}>Hint</span>
                <span className={`${styles.hintChevron} ${hintOpen ? styles.hintChevronUp : ''}`}>▾</span>
              </button>
              {hintOpen && (
                <p className={styles.hint}>{requirement.hint}</p>
              )}
            </div>
          )}
        </div>
      </div>
      {isScout && (
        <div className={styles.actions}>
          {badgeLocked ? (
            <span className={styles.lockedIndicator} title="Complete the previous badge first">
              🔒
            </span>
          ) : submission ? (
            <button
              className={styles.viewBtn}
              onClick={() => navigate(`/submit?requirementId=${requirement.id}`)}
            >
              <StatusPill status={submission.status} />
            </button>
          ) : (
            <button
              className={styles.startBtn}
              onClick={() => navigate(`/submit?requirementId=${requirement.id}`)}
            >
              Start
            </button>
          )}
        </div>
      )}
    </div>
  )
}
