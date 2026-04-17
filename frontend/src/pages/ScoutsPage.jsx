import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { getReviewSubmissions } from '../api/review'
import { getBadges } from '../api/badges'
import { getScoutStats, getEmailSettings, updateEmailSettings } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { getHandouts } from '../api/handouts'
import ScoutDetail from '../components/scouts/ScoutDetail'
import CreateUserModal from '../components/scouts/CreateUserModal'
import DeleteUserModal from '../components/scouts/DeleteUserModal'
import TodoModal from '../components/scouts/TodoModal'
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
    if (badge.category === 'personal_progression' || badge.category === 'awards') continue
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
  const mins = Math.floor(diffMs / 60_000)
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) {
    if (mins < 1)  return 'Just now'
    if (mins < 60) return `${mins} min ago`
    return `${Math.floor(mins / 60)} hr ago`
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatLastLogin(dateStr) {
  if (!dateStr) return 'Never'
  return timeSince(dateStr)
}

const PP_LEVEL_LABELS = { 0: 'N/A', 1: 'Trailhead', 2: 'Tree Line', 3: 'Snow Line', 4: 'Summit' }

// ─── component ──────────────────────────────────────────────────────────────

export default function ScoutsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const cameFromReview = location.state?.from === 'review'
  const [scouts, setScouts] = useState([])        // from /api/users/scouts/stats/
  const [summary, setSummary] = useState(null)    // aggregate counts from stats endpoint
  const [badgeDetails, setBadgeDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedScout, setSelectedScout] = useState(null)
  const [detailScout, setDetailScout] = useState(null)   // enriched scout for detail view
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showDeleteUser, setShowDeleteUser] = useState(false)
  const [showTodo, setShowTodo] = useState(false)
  const [todoItems, setTodoItems] = useState([])
  const [sortKey, setSortKey] = useState(() => localStorage.getItem('scouts_sortKey') ?? 'name')
  const [sortDir, setSortDir] = useState(() => localStorage.getItem('scouts_sortDir') ?? 'asc')
  const [emailsPaused, setEmailsPaused] = useState(null)
  const [pauseLoading, setPauseLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const promises = [getScoutStats(), getBadges(), getHandouts().catch(() => [])]
      if (user?.role === 'admin') {
        promises.push(getEmailSettings())
      }
      const results = await Promise.all(promises)
      setScouts(results[0].scouts)
      setSummary(results[0].summary)
      setBadgeDetails(results[1])
      setTodoItems(results[2])
      if (user?.role === 'admin' && results[3]) {
        setEmailsPaused(results[3].emails_paused)
      }
      setLoading(false)
    } catch {
      setLoading(false)
      setError('Failed to load scout data. Please try refreshing.')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // When a scout row is clicked, lazy-load their submissions for the detail view
  const handleScoutClick = useCallback(
    async (scout) => {
      setSelectedScout(scout.username)
      setDetailScout(null)
      setDetailLoading(true)
      setDetailError('')
      try {
        const subs = await getReviewSubmissions({ scout_id: scout.id })
        const { subByReq, completions, lastSubmittedAt } = buildScoutStats(subs, badgeDetails)
        setDetailScout({ ...scout, subByReq, completions, lastSubmittedAt, submissions: subs })
      } catch {
        setDetailError('Failed to load scout details. Please try again.')
      } finally {
        setDetailLoading(false)
      }
    },
    [badgeDetails],
  )

  // Auto-open scout detail when ?username= param is present (e.g. linked from ReviewCard)
  useEffect(() => {
    if (loading || scouts.length === 0) return
    const usernameParam = searchParams.get('username')
    if (!usernameParam) return
    const target = scouts.find(s => s.username === usernameParam)
    if (target) handleScoutClick(target)
  }, [loading, scouts, searchParams, handleScoutClick])

  function openTodo() {
    setShowTodo(true)
  }

  const activeBadgeCount = summary?.active_badge_count
    ?? badgeDetails.filter((b) => b.is_active && b.category !== 'personal_progression' && b.category !== 'awards').length
  const kvaTotal = summary?.kva_total ?? 0

  function handleSort(key) {
    if (key === sortKey) {
      const next = sortDir === 'asc' ? 'desc' : 'asc'
      setSortDir(next)
      localStorage.setItem('scouts_sortDir', next)
    } else {
      setSortKey(key)
      setSortDir('asc')
      localStorage.setItem('scouts_sortKey', key)
      localStorage.setItem('scouts_sortDir', 'asc')
    }
    setPage(1)
  }

  const filteredScouts = useMemo(() => {
    const lower = search.toLowerCase()
    const filtered = scouts.filter(
      (s) =>
        s.username.toLowerCase().includes(lower) ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(lower),
    )

    const dir = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name': {
          const na = `${a.first_name} ${a.last_name}`.trim() || a.username
          const nb = `${b.first_name} ${b.last_name}`.trim() || b.username
          return na.localeCompare(nb) * dir
        }
        case 'badges':
          return (a.badges_complete - b.badges_complete) * dir
        case 'progression':
          return ((a.personal_progression_level ?? 0) - (b.personal_progression_level ?? 0)) * dir
        case 'kva':
          return ((a.kva_requirements_completed ?? 0) - (b.kva_requirements_completed ?? 0)) * dir
        case 'pending':
          return (a.pending_review - b.pending_review) * dir
        case 'lastSub':
          return ((a.last_submission_at ?? '') < (b.last_submission_at ?? '') ? -1 : 1) * dir
        case 'lastLogin':
          return ((a.last_login ?? '') < (b.last_login ?? '') ? -1 : 1) * dir
        default:
          return 0
      }
    })
  }, [scouts, search, sortKey, sortDir])

  const totalPages = Math.ceil(filteredScouts.length / PAGE_SIZE)
  const paginatedScouts = filteredScouts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handlePauseToggle() {
    if (emailsPaused === null) return
    setPauseLoading(true)
    try {
      const updated = await updateEmailSettings({ emails_paused: !emailsPaused })
      setEmailsPaused(updated.emails_paused)
    } catch {
      // ignore
    } finally {
      setPauseLoading(false)
    }
  }

  // ── Scout detail view ──
  if (selectedScout) {
    return (
      <div>
        <button
          className={styles.backBtn}
          onClick={() => cameFromReview ? navigate(-1) : setSelectedScout(null)}
        >
          {cameFromReview ? '← Back to Review' : '← Back to Scouts'}
        </button>
        {detailLoading && <Spinner centered />}
        {detailError && <ErrorMessage message={detailError} />}
        {detailScout && (
          <ScoutDetail
            scout={detailScout}
            badgeDetails={badgeDetails}
            activeBadgeCount={activeBadgeCount}
          />
        )}
      </div>
    )
  }

  // ── List view ──
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Scouts</h1>
          <p className={styles.subtitle}>
            Summary of all scouts and their OAS badge progress.
          </p>
        </div>
        <div className={styles.headerActions}>
          {user?.role === 'admin' && emailsPaused !== null && (
            <button
              className={`${styles.emailPauseBtn} ${emailsPaused ? styles.emailPausedActive : styles.emailPauseInactive}`}
              onClick={handlePauseToggle}
              disabled={pauseLoading}
            >
              {pauseLoading ? 'Updating...' : emailsPaused ? 'Emails: OFF' : 'Emails: ON'}
            </button>
          )}
          {(() => {
            const pendingCount = todoItems.filter((i) => !i.handed_out).length
            return (
              <button
                className={`${styles.todoBtn} ${pendingCount > 0 ? styles.todoBtnActive : ''}`}
                onClick={openTodo}
              >
                To-Do{pendingCount > 0 ? ` (${pendingCount})` : ''}
              </button>
            )
          })()}
          <button className={styles.deleteUserBtn} onClick={() => setShowDeleteUser(true)}>
            Delete User
          </button>
          <button className={styles.createUserBtn} onClick={() => setShowCreateUser(true)}>
            + Create User
          </button>
        </div>
      </div>
      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onCreated={load}
        />
      )}
      {showDeleteUser && (
        <DeleteUserModal
          scouts={scouts}
          onClose={() => setShowDeleteUser(false)}
          onDeleted={load}
        />
      )}
      {showTodo && (
        <TodoModal
          items={todoItems}
          setItems={setTodoItems}
          onClose={() => setShowTodo(false)}
        />
      )}

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && summary && (
        <>
          {/* ── Stats row ── */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.total}</span>
              <span className={styles.statLabel}>Total Scouts</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.completions_24h}</span>
              <span className={styles.statLabel}>Badges Completed</span>
              <span className={styles.statWindow}>Past 24 hours</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.completions_7d}</span>
              <span className={styles.statLabel}>Badges Completed</span>
              <span className={styles.statWindow}>Past 7 days</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{summary.completions_30d}</span>
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
                {[
                  { key: 'name',        label: 'Scout' },
                  { key: 'badges',      label: 'Badges Complete' },
                  { key: 'progression', label: 'Progression',    mobile: false },
                  { key: 'kva',         label: 'KVA',            mobile: false },
                  { key: 'pending',     label: 'Pending Review', mobile: false },
                  { key: 'lastSub',     label: 'Last Submission', mobile: false },
                  { key: 'lastLogin',   label: 'Last Login',     mobile: false },
                ].map(({ key, label, mobile }) => (
                  <button
                    key={key}
                    className={`${styles.sortBtn} ${sortKey === key ? styles.sortActive : ''} ${mobile === false ? styles.mobileHide : ''}`}
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    <span className={styles.sortIcon}>
                      {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⬍'}
                    </span>
                  </button>
                ))}
                <span></span>
              </div>
              {paginatedScouts.map((scout) => {
                const displayName =
                  scout.first_name || scout.last_name
                    ? `${scout.first_name} ${scout.last_name}`.trim()
                    : scout.username
                return (
                  <button
                    key={scout.id}
                    className={styles.scoutRow}
                    onClick={() => handleScoutClick(scout)}
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
                          scout.badges_complete === activeBadgeCount && activeBadgeCount > 0
                            ? styles.allDone
                            : ''
                        }
                      >
                        {scout.badges_complete}
                      </span>
                      <span className={styles.badgeOf}> / {activeBadgeCount}</span>
                    </span>
                    <span className={`${styles.progression} ${styles.mobileHide}`}>
                      {PP_LEVEL_LABELS[scout.personal_progression_level ?? 0]}
                    </span>
                    <span className={`${styles.kva} ${styles.mobileHide}`}>
                      {scout.kva_requirements_completed ?? 0}
                      {kvaTotal > 0 && <span className={styles.badgeOf}> / {kvaTotal}</span>}
                    </span>
                    <span className={`${styles.pending} ${styles.mobileHide} ${scout.pending_review > 0 ? styles.pendingAlert : ''}`}>
                      {scout.pending_review > 0 ? `${scout.pending_review} pending` : '—'}
                    </span>
                    <span className={`${styles.lastSub} ${styles.mobileHide}`}>{timeSince(scout.last_submission_at)}</span>
                    <span className={`${styles.lastLogin} ${styles.mobileHide}`}>{formatLastLogin(scout.last_login)}</span>
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
