import { useState } from 'react'
import { getBadgeDetail } from '../../api/badges'
import RequirementRow from './RequirementRow'
import Spinner from '../ui/Spinner'
import styles from './BadgeCard.module.css'

export default function BadgeCard({
  badge,
  submissionsMap,
  detailCache,
  onDetailLoaded,
  isComplete,
  isLocked,
}) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const detail = detailCache?.get(badge.id)

  async function toggleExpand() {
    // Locked badges can still be expanded to view requirements
    if (!expanded && !detail && badge.is_active) {
      setLoading(true)
      setError('')
      try {
        const data = await getBadgeDetail(badge.id)
        onDetailLoaded(badge.id, data)
      } catch {
        setError('Failed to load requirements.')
      } finally {
        setLoading(false)
      }
    }
    setExpanded((v) => !v)
  }

  const requirementCount = detail?.requirements?.length ?? null

  const cardClass = [
    styles.card,
    !badge.is_active ? styles.inactive : '',
    isComplete ? styles.complete : '',
    isLocked ? styles.locked : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass}>
      <button
        className={styles.header}
        onClick={badge.is_active ? toggleExpand : undefined}
        aria-expanded={expanded}
        disabled={!badge.is_active}
      >
        <div className={styles.headerLeft}>
          <span className={styles.name}>{badge.name}</span>
          {requirementCount !== null && (
            <span className={styles.count}>{requirementCount} requirements</span>
          )}
        </div>
        <div className={styles.headerRight}>
          {!badge.is_active && (
            <span className={styles.inactiveTag}>Inactive</span>
          )}
          {badge.is_active && isComplete && (
            <span className={styles.completeTag}>✓ Complete</span>
          )}
          {badge.is_active && isLocked && !isComplete && (
            <span className={styles.lockedTag}>🔒 Locked</span>
          )}
          {badge.is_active && (
            <span className={`${styles.chevron} ${expanded ? styles.chevronUp : ''}`}>
              ▾
            </span>
          )}
        </div>
      </button>

      {expanded && badge.is_active && (
        <div className={styles.body}>
          {isLocked && (
            <p className={styles.lockedNotice}>
              Complete the previous badge to unlock submissions for this one.
            </p>
          )}
          {loading && <Spinner size="sm" />}
          {error && <p className={styles.error}>{error}</p>}
          {detail && !loading && (
            <div className={styles.requirements}>
              {detail.requirements.length === 0 ? (
                <p className={styles.empty}>No requirements listed.</p>
              ) : (
                detail.requirements
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((req) => (
                    <RequirementRow
                      key={req.id}
                      requirement={req}
                      badgeId={badge.id}
                      submissionsMap={submissionsMap}
                      badgeLocked={isLocked}
                    />
                  ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
