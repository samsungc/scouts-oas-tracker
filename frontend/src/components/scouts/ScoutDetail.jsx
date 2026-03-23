import { useState, useEffect } from 'react'
import styles from './ScoutDetail.module.css'
import ReviewCard from '../review/ReviewCard'
import RejectModal from '../review/RejectModal'
import Modal from '../ui/Modal'

// ─── constants ──────────────────────────────────────────────────────────────

const CATEGORY_ORDER = [
  'awards',
  'personal_progression',
  'vertical_skills',
  'sailing_skills',
  'scoutcraft_skills',
  'camping_skills',
  'trail_skills',
  'winter_skills',
  'paddling_skills',
  'aquatic_skills',
  'emergency_skills',
]

const CATEGORY_LABELS = {
  awards: 'Awards',
  personal_progression: 'Personal Progression',
  vertical_skills: 'Vertical Skills',
  sailing_skills: 'Sailing Skills',
  scoutcraft_skills: 'Scoutcraft Skills',
  camping_skills: 'Camping Skills',
  trail_skills: 'Trail Skills',
  winter_skills: 'Winter Skills',
  paddling_skills: 'Paddling Skills',
  aquatic_skills: 'Aquatic Skills',
  emergency_skills: 'Emergency Skills',
}

// ─── helpers ────────────────────────────────────────────────────────────────

function badgeOrder(badge) {
  if (badge.level != null) return badge.level
  const m = badge.name.match(/(\d+)\s*$/)
  return m ? parseInt(m[1], 10) : 0
}

function statusPriority(s) {
  return { approved: 3, submitted: 2, rejected: 1, draft: 0 }[s] ?? 0
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── component ──────────────────────────────────────────────────────────────

export default function ScoutDetail({ scout, badgeDetails, activeBadgeCount }) {
  const [expandedBadge, setExpandedBadge] = useState(null)
  const [localSubByReq, setLocalSubByReq] = useState(() => ({ ...scout.subByReq }))
  const [reviewTarget, setReviewTarget] = useState(null) // { sub, req, badge }
  const [rejectTarget, setRejectTarget] = useState(null) // sub

  useEffect(() => {
    setLocalSubByReq({ ...scout.subByReq })
  }, [scout.username])

  function handleApproved(updated) {
    setLocalSubByReq((prev) => ({ ...prev, [updated.requirement]: updated }))
    setReviewTarget(null)
  }

  function handleRejectClick(sub) {
    setReviewTarget(null)
    setRejectTarget(sub)
  }

  function handleRejected(updated) {
    setLocalSubByReq((prev) => ({ ...prev, [updated.requirement]: updated }))
    setRejectTarget(null)
  }

  if (!scout) return null

  const subByReq = localSubByReq

  // ── Per-badge stats ──
  const activeBadges = badgeDetails.filter((b) => b.is_active)

  // Group by category, sort within each
  const byCategory = {}
  for (const badge of activeBadges) {
    const cat = badge.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(badge)
  }
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => badgeOrder(a) - badgeOrder(b))
  }

  const allBadgeStats = activeBadges.map((badge) => {
    const reqs = badge.requirements
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((req) => ({ req, sub: subByReq[req.id] ?? null }))

    const approved = reqs.filter((r) => r.sub?.status === 'approved').length
    const submitted = reqs.filter((r) => r.sub?.status === 'submitted').length
    const rejected = reqs.filter((r) => r.sub?.status === 'rejected').length
    const draft = reqs.filter((r) => r.sub?.status === 'draft').length
    const notStarted = reqs.filter((r) => !r.sub).length
    const isComplete = approved === reqs.length && reqs.length > 0

    return { badge, reqs, approved, submitted, rejected, draft, notStarted, isComplete }
  })

  // ── Overall totals ──
  const totals = allBadgeStats.reduce(
    (acc, b) => {
      acc.approved += b.approved
      acc.submitted += b.submitted
      acc.rejected += b.rejected
      acc.draft += b.draft
      acc.notStarted += b.notStarted
      return acc
    },
    { approved: 0, submitted: 0, rejected: 0, draft: 0, notStarted: 0 },
  )

  const lastSubmittedAt = scout.lastSubmittedAt ? formatDate(scout.lastSubmittedAt) : 'Never'
  const lastLogin = scout.last_login ? formatDate(scout.last_login) : 'Never'
  const displayName =
    scout.first_name || scout.last_name
      ? `${scout.first_name} ${scout.last_name}`.trim()
      : scout.username

  return (
    <div>
      {reviewTarget && (
        <Modal title="Review Submission" onClose={() => setReviewTarget(null)}>
          <ReviewCard
            submission={reviewTarget.sub}
            requirement={{
              badge_name: reviewTarget.badge.name,
              title: reviewTarget.req.title,
              description: reviewTarget.req.description,
              hint: reviewTarget.req.hint,
            }}
            onApproved={handleApproved}
            onRejectClick={handleRejectClick}
          />
        </Modal>
      )}
      {rejectTarget && (
        <RejectModal
          submission={rejectTarget}
          onRejected={handleRejected}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* ── Scout header ── */}
      <div className={styles.header}>
        <h2 className={styles.scoutName}>
          {displayName}
          {displayName !== scout.username && (
            <span className={styles.usernameTag}> @{scout.username}</span>
          )}
        </h2>
        <div className={styles.metaRow}>
          <span className={styles.metaChip}>
            <strong>{scout.completions.length}</strong> / {activeBadgeCount} badges complete
          </span>
          <span className={styles.metaSep}>·</span>
          <span className={styles.metaItem}>
            Last submission: <strong>{lastSubmittedAt}</strong>
          </span>
          <span className={styles.metaSep}>·</span>
          <span className={styles.metaItem}>
            Last login: <strong>{lastLogin}</strong>
          </span>
        </div>
      </div>

      {/* ── Requirement status overview ── */}
      <div className={styles.overview}>
        <div className={`${styles.chip} ${styles.chipApproved}`}>
          <span className={styles.chipNum}>{totals.approved}</span>
          <span className={styles.chipLbl}>Approved</span>
        </div>
        <div className={`${styles.chip} ${styles.chipSubmitted}`}>
          <span className={styles.chipNum}>{totals.submitted}</span>
          <span className={styles.chipLbl}>Pending</span>
        </div>
        <div className={`${styles.chip} ${styles.chipRejected}`}>
          <span className={styles.chipNum}>{totals.rejected}</span>
          <span className={styles.chipLbl}>Returned</span>
        </div>
        <div className={`${styles.chip} ${styles.chipDraft}`}>
          <span className={styles.chipNum}>{totals.draft}</span>
          <span className={styles.chipLbl}>Draft</span>
        </div>
        <div className={`${styles.chip} ${styles.chipNone}`}>
          <span className={styles.chipNum}>{totals.notStarted}</span>
          <span className={styles.chipLbl}>Not started</span>
        </div>
      </div>

      {/* ── Badge breakdown by category ── */}
      {CATEGORY_ORDER.filter((cat) => byCategory[cat]).map((cat) => {
        const catBadges = byCategory[cat]
        const catStats = catBadges.map((b) => allBadgeStats.find((s) => s.badge.id === b.id))
        const catComplete = catStats.filter((s) => s.isComplete).length

        return (
          <section key={cat} className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryLabel}>{CATEGORY_LABELS[cat]}</span>
              <span
                className={`${styles.catProgress} ${catComplete === catBadges.length ? styles.catDone : ''}`}
              >
                {catComplete === catBadges.length ? '★' : '◎'} {catComplete} / {catBadges.length}
              </span>
            </div>

            {catStats.map((stat) => {
              if (!stat) return null
              const { badge, reqs, approved, submitted, rejected, draft, notStarted, isComplete } = stat
              const isExpanded = expandedBadge === badge.id
              const total = reqs.length

              return (
                <div
                  key={badge.id}
                  className={`${styles.badgeRow} ${isComplete ? styles.badgeComplete : submitted > 0 ? styles.badgeSubmitted : ''}`}
                >
                  <button
                    className={styles.badgeHeader}
                    onClick={() => setExpandedBadge(isExpanded ? null : badge.id)}
                  >
                    <span className={styles.badgeName}>{badge.name}</span>

                    {/* Mini status indicators */}
                    <div className={styles.miniStats}>
                      {approved > 0 && (
                        <span className={`${styles.mini} ${styles.miniApproved}`}>{approved}✓</span>
                      )}
                      {submitted > 0 && (
                        <span className={`${styles.mini} ${styles.miniSubmitted}`}>{submitted}⏳</span>
                      )}
                      {rejected > 0 && (
                        <span className={`${styles.mini} ${styles.miniRejected}`}>{rejected}✗</span>
                      )}
                      {draft > 0 && (
                        <span className={`${styles.mini} ${styles.miniDraft}`}>{draft}✎</span>
                      )}
                      {notStarted > 0 && (
                        <span className={`${styles.mini} ${styles.miniNone}`}>{notStarted}—</span>
                      )}
                    </div>

                    {isComplete && (
                      <span className={styles.completeTag}>✓ Complete</span>
                    )}
                    <span className={styles.chevron}>{isExpanded ? '▴' : '▾'}</span>
                  </button>

                  {/* ── Progress bar ── */}
                  {total > 0 && (
                    <div className={styles.progressBar} title={`${approved} / ${total} approved`}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${(approved / total) * 100}%` }}
                      />
                    </div>
                  )}

                  {/* ── Per-requirement rows ── */}
                  {isExpanded && (
                    <div className={styles.reqList}>
                      {reqs.map(({ req, sub }) => {
                        const status = sub?.status ?? 'none'
                        const icons = {
                          approved: '✓',
                          submitted: '⏳',
                          rejected: '✗',
                          draft: '✎',
                          none: '—',
                        }
                        const dateStr =
                          status === 'approved' || status === 'rejected'
                            ? formatDate(sub?.reviewed_at)
                            : status === 'submitted'
                            ? formatDate(sub?.submitted_at)
                            : status === 'draft'
                            ? formatDate(sub?.created_at)
                            : null

                        const isReviewable = status === 'submitted'
                        const isClickable = status === 'submitted' || status === 'approved' || status === 'rejected'
                        const rowEl = (
                          <>
                            <span className={styles.reqIcon}>{icons[status]}</span>
                            <span className={styles.reqTitle}>{req.title}</span>
                            {dateStr && (
                              <span className={styles.reqDate}>{dateStr}</span>
                            )}
                            {status === 'approved' && sub?.reviewed_by_username && (
                              <span className={styles.reviewedBy}>by {sub.reviewed_by_username}</span>
                            )}
                            {isReviewable && (
                              <span className={styles.reviewBadge}>Review</span>
                            )}
                            {sub?.reviewer_notes && (
                              <span
                                className={styles.notesIcon}
                                title={`Reviewer notes: ${sub.reviewer_notes}`}
                              />
                            )}
                          </>
                        )

                        return isClickable ? (
                          <button
                            key={req.id}
                            className={`${styles.reqRow} ${styles['req_' + status]} ${styles.reqRowClickable}`}
                            onClick={() => setReviewTarget({ sub, req, badge })}
                          >
                            {rowEl}
                          </button>
                        ) : (
                          <div key={req.id} className={`${styles.reqRow} ${styles['req_' + status]}`}>
                            {rowEl}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
