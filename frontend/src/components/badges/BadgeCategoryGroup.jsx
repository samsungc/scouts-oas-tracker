import { useState } from 'react'
import BadgeCard from './BadgeCard'
import styles from './BadgeCategoryGroup.module.css'

/** Returns a sort key for a badge within its category. Uses the level field when set, otherwise falls back to trailing integer in the name. */
function badgeOrder(badge) {
  if (badge.level != null) return badge.level
  const m = badge.name.match(/(\d+)\s*$/)
  return m ? parseInt(m[1], 10) : 0
}

/** A badge is complete when every one of its requirements has an approved submission. */
function isBadgeComplete(badge, detailCache, submissionsMap) {
  if (!badge.is_active) return false
  const detail = detailCache?.get(badge.id)
  if (!detail || detail.requirements.length === 0) return false
  return detail.requirements.every(
    (req) => submissionsMap.get(req.id)?.status === 'approved',
  )
}

/** A badge has a rejection if it isn't complete and at least one requirement has a rejected submission. */
function isBadgeRejected(badge, detailCache, submissionsMap, isComplete) {
  if (!badge.is_active || isComplete) return false
  const detail = detailCache?.get(badge.id)
  if (!detail || detail.requirements.length === 0) return false
  return detail.requirements.some(
    (req) => submissionsMap.get(req.id)?.status === 'rejected',
  )
}

export default function BadgeCategoryGroup({
  categoryKey,
  categoryLabel,
  badges,
  submissionsMap,
  detailCache,
  onDetailLoaded,
  isScout,
  isSearching,
  filteredReqsMap,
  onBatchReview,
  expandDetails,
}) {
  const [open, setOpen] = useState(true)
  const isOpen = isSearching || open

  // Sort by numeric suffix so "Vertical Skills 2" always follows "Vertical Skills 1"
  const sortedBadges = [...badges].sort((a, b) => badgeOrder(a) - badgeOrder(b))

  // Completion state for each sorted badge
  const completeFlags = sortedBadges.map((b) =>
    isBadgeComplete(b, detailCache, submissionsMap),
  )

  // Rejection state — true if any requirement has a rejected submission and badge isn't complete
  const rejectedFlags = sortedBadges.map((b, idx) =>
    isBadgeRejected(b, detailCache, submissionsMap, completeFlags[idx]),
  )

  // A badge is locked for scouts if the immediately preceding badge isn't complete
  const lockedFlags = sortedBadges.map((_, idx) => {
    if (!isScout || idx === 0) return false
    return !completeFlags[idx - 1]
  })

  const completedCount = completeFlags.filter(Boolean).length
  const totalCount = sortedBadges.filter((b) => b.is_active).length
  const allComplete = isScout && totalCount > 0 && completedCount === totalCount

  return (
    <section className={styles.section}>
      <button
        className={styles.categoryHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className={styles.categoryLabel}>{categoryLabel}</span>

        {isScout && totalCount > 0 && (
          <span className={`${styles.progressPill} ${allComplete ? styles.progressPillDone : ''}`}>
            {allComplete ? '★' : '◎'} {completedCount} / {totalCount}
          </span>
        )}

        <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className={styles.grid}>
          {sortedBadges.map((badge, idx) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              submissionsMap={submissionsMap}
              detailCache={detailCache}
              onDetailLoaded={onDetailLoaded}
              isComplete={completeFlags[idx]}
              isRejected={rejectedFlags[idx]}
              isLocked={lockedFlags[idx]}
              isSearching={isSearching}
              filteredRequirements={filteredReqsMap?.get(badge.id)}
              onBatchReview={onBatchReview}
              expandDetails={expandDetails}
            />
          ))}
        </div>
      )}
    </section>
  )
}
