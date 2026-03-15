import { useState, useEffect, useMemo } from 'react'
import { getReviewSubmissions } from '../api/review'
import { getBadges } from '../api/badges'
import { getScouts } from '../api/users'
import ScoutDetail from '../components/scouts/ScoutDetail'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Pagination from '../components/ui/Pagination'
import styles from './ScoutsPage.module.css'

const PAGE_SIZE = 20

// ─── helpers ────────────────────────────────────────────────────────────────

function statusPriority(s) {
  return { approved: 3, submitted: 2, rejected: 1, draft: 0 }[s] ?? 0
}

/**
 * Returns the timestamp at which a scout completed a badge
 * (the last required approval was granted), or null if incomplete.
 */
function badgeCompletionTime(badge, subByReq) {
  if (!badge.requirements.length) return null
  const times = []
  for (const req of badge.requirements) {
    const sub = subByReq[req.id]
    if (!sub || sub.status !== 'approved' || !sub.reviewed_at) return null
    times.push(new Date(sub.reviewed_at).getTime())
  }
  return Math.max(...times)
}

/**
 * From submissions for one scout, build:
 *   subByReq  — { reqId → best submission }
 *   completions — [{ badgeId, badgeName, completedAt }]
 *   lastSubmittedAt — ISO string or null
 */
function buildScoutStats(scoutSubs, badgeDetails) {
  // Keep best submission per requirement
  const subByReq = {}
  for (const sub of scoutSubs) {
    const existing = subByReq[sub.requirement]
    if (!existing || statusPriority(sub.status) > statusPriority(existing.status)) {
      subByReq[sub.requirement] = sub
    }
  }

  const completions = []
  for (const badge of badgeDetails) {
    if (!badge.is_active) continue
    const completedAt = badgeCompletionTime(badge, subByReq)
    if (completedAt !== null) {
      completions.push({ badgeId: badge.id, badgeName: badge.name, completedAt })
    }
  }

  const lastSubmittedAt =
    scoutSubs
      .filter((s) => s.submitted_at)
      .map((s) => s.submitted_at)
      .sort()
      .at(-1) ?? null

  return { subByReq, completions, lastSubmittedAt }
}

function timeSince(dateStr) {
  if (!dateStr) return 'Never'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatLastLogin(dateStr) {
  if (!dateStr) return 'Never'
  return timeSince(dateStr)
}

// ─── component ──────────────────────────────────────────────────────────────

export default function ScoutsPage() {
  const [scouts, setScouts] = useState([])          // from /api/users/scouts/
  const [badgeDetails, setBadgeDetails] = useState([])
  const [allSubmissions, setAllSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedScout, setSelectedScout] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [scoutList, badgeList, subs] = await Promise.all([
          getScouts(),
          getBadges(),
          getReviewSubmissions(),
        ])
        setScouts(scoutList)
        setAllSubmissions(subs)
        setBadgeDetails(badgeList)
        setLoading(false)
      } catch {
        setLoading(false)
        setError('Failed to load scout data. Please try refreshing.')
      }
    }
    load()
  }, [])

  // Group submissions by scout username
  const subsByScout = useMemo(() => {
    const map = {}
    for (const sub of allSubmissions) {
      const u = sub.scout_username
      if (!map[u]) map[u] = []
      map[u].push(sub)
    }
    return map
  }, [allSubmissions])

  // Enrich each scout with computed stats
  const enrichedScouts = useMemo(
    () =>
      scouts.map((scout) => {
        const scoutSubs = subsByScout[scout.username] ?? []
        const { subByReq, completions, lastSubmittedAt } = buildScoutStats(
          scoutSubs,
          badgeDetails,
        )
        return { ...scout, subByReq, completions, lastSubmittedAt, submissions: scoutSubs }
      }),
    [scouts, subsByScout, badgeDetails],
  )

  // ── Summary stats ──
  const now = Date.now()
  const allCompletions = enrichedScouts.flatMap((s) => s.completions)
  const stats = {
    total: scouts.length,
    last24h: allCompletions.filter((c) => now - c.completedAt < 86_400_000).length,
    lastWeek: allCompletions.filter((c) => now - c.completedAt < 7 * 86_400_000).length,
    lastMonth: allCompletions.filter((c) => now - c.completedAt < 30 * 86_400_000).length,
  }

  const activeBadgeCount = badgeDetails.filter((b) => b.is_active).length

  const filteredScouts = enrichedScouts.filter((s) =>
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredScouts.length / PAGE_SIZE)
  const paginatedScouts = filteredScouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Scout detail view ──
  if (selectedScout) {
    const scout = enrichedScouts.find((s) => s.username === selectedScout)
    return (
      <div>
        <button className={styles.backBtn} onClick={() => setSelectedScout(null)}>
          ← Back to Scouts
        </button>
        <ScoutDetail
          scout={scout}
          badgeDetails={badgeDetails}
          activeBadgeCount={activeBadgeCount}
        />
      </div>
    )
  }

  // ── List view ──
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Scouts</h1>
        <p className={styles.subtitle}>
          Summary of all scouts and their OAS badge progress.
        </p>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {/* ── Stats row ── */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Scouts</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.last24h}</span>
              <span className={styles.statLabel}>Badges Completed</span>
              <span className={styles.statWindow}>Past 24 hours</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.lastWeek}</span>
              <span className={styles.statLabel}>Badges Completed</span>
              <span className={styles.statWindow}>Past 7 days</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.lastMonth}</span>
              <span className={styles.statLabel}>Badges Completed</span>
              <span className={styles.statWindow}>Past 30 days</span>
            </div>
          </div>

          {/* ── Search ── */}
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search scouts by name or username…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            {search && (
              <span className={styles.searchCount}>
                {filteredScouts.length} result{filteredScouts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ── Scout table ── */}
          {filteredScouts.length === 0 ? (
            <div className={styles.empty}>
              <p>{search ? 'No scouts match your search.' : 'No scouts registered yet.'}</p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Scout</span>
                <span>Badges Complete</span>
                <span>Pending Review</span>
                <span>Last Submission</span>
                <span>Last Login</span>
                <span></span>
              </div>
              {paginatedScouts.map((scout) => {
                const pending = scout.submissions.filter((s) => s.status === 'submitted').length
                const displayName =
                  scout.first_name || scout.last_name
                    ? `${scout.first_name} ${scout.last_name}`.trim()
                    : scout.username
                return (
                  <button
                    key={scout.id}
                    className={styles.scoutRow}
                    onClick={() => setSelectedScout(scout.username)}
                  >
                    <span className={styles.scoutNameCol}>
                      <span className={styles.scoutDisplayName}>{displayName}</span>
                      {displayName !== scout.username && (
                        <span className={styles.scoutUsername}>@{scout.username}</span>
                      )}
                    </span>
                    <span className={styles.scoutBadges}>
                      <span
                        className={
                          scout.completions.length === activeBadgeCount && activeBadgeCount > 0
                            ? styles.allDone
                            : ''
                        }
                      >
                        {scout.completions.length}
                      </span>
                      <span className={styles.badgeOf}> / {activeBadgeCount}</span>
                    </span>
                    <span className={`${styles.pending} ${pending > 0 ? styles.pendingAlert : ''}`}>
                      {pending > 0 ? `${pending} pending` : '—'}
                    </span>
                    <span className={styles.lastSub}>{timeSince(scout.lastSubmittedAt)}</span>
                    <span className={styles.lastLogin}>{formatLastLogin(scout.last_login)}</span>
                    <span className={styles.rowChevron}>›</span>
                  </button>
                )
              })}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}
