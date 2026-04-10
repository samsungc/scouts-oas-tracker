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
  isRejected,
  isLocked,
  isSearching,
  filteredRequirements,
  onBatchReview,
  expandDetails,
}) {
  const [expanded, setExpanded] = useState(false)
  const isExpanded = isSearching || expanded
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

  const requirementsToShow = filteredRequirements ?? detail?.requirements

  const totalCount = detail?.requirements?.length ?? badge.requirements?.length ?? null
  const requirementCount = filteredRequirements
    ? `${filteredRequirements.length} / ${totalCount ?? '?'} match`
    : totalCount

  const cardClass = [
    styles.card,
    !badge.is_active ? styles.inactive : '',
    isComplete ? styles.complete : '',
    isRejected ? styles.rejected : '',
    isLocked ? styles.locked : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass}>
      <button
        className={styles.header}
        onClick={badge.is_active ? toggleExpand : undefined}
        aria-expanded={isExpanded}
        disabled={!badge.is_active}
      >
        <div className={styles.headerLeft}>
          <span className={styles.name}>{badge.name}</span>
          {requirementCount !== null && (
            <span className={styles.count}>
              {typeof requirementCount === 'string'
                ? requirementCount
                : `${requirementCount} requirements`}
            </span>
          )}
        </div>
        <div className={styles.headerRight}>
          {!badge.is_active && (
            <span className={styles.inactiveTag}>Inactive</span>
          )}
          {badge.is_active && isComplete && (
            <span className={styles.completeTag}>✓ Complete</span>
          )}
          {badge.is_active && isRejected && (
            <span className={styles.rejectedTag}>✗ Returned</span>
          )}
          {badge.is_active && isLocked && !isComplete && (
            <span className={styles.lockedTag}>🔒 Locked</span>
          )}
          {badge.is_active && (
            <span className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`}>
              ▾
            </span>
          )}
        </div>
      </button>

      {isExpanded && badge.is_active && (
        <div className={styles.body}>
          {isLocked && (
            <p className={styles.lockedNotice}>
              Complete the previous badge to unlock submissions for this one.
            </p>
          )}
          {loading && <Spinner size="sm" />}
          {error && <p className={styles.error}>{error}</p>}
          {requirementsToShow && !loading && (
            <div className={styles.requirements}>
              {requirementsToShow.length === 0 ? (
                <p className={styles.empty}>No requirements listed.</p>
              ) : (
                requirementsToShow
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((req) => (
                    <RequirementRow
                      key={req.id}
                      requirement={req}
                      badgeId={badge.id}
                      submissionsMap={submissionsMap}
                      badgeLocked={isLocked}
                      onBatchReview={onBatchReview}
                      expandDetails={expandDetails}
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
