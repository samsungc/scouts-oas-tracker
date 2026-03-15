import { useState, useEffect, useCallback } from 'react'
import { getBadges } from '../api/badges'
import { getSubmissions } from '../api/submissions'
import { useAuth } from '../context/AuthContext'
import BadgeCategoryGroup from '../components/badges/BadgeCategoryGroup'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './BadgesPage.module.css'

const CACHE_KEY = 'badges_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function writeCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

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
}

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS)

export default function BadgesPage() {
  const { user } = useAuth()
  const isScout = user?.role === 'scout'
  const [badges, setBadges] = useState([])
  const [submissionsMap, setSubmissionsMap] = useState(new Map())
  const [detailCache, setDetailCache] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const cached = readCache()
        const [badgeList, submissionList] = await Promise.all([
          cached ? Promise.resolve(cached) : getBadges().then((data) => { writeCache(data); return data }),
          isScout ? getSubmissions() : Promise.resolve([]),
        ])
        setBadges(badgeList)

        // Badges now include requirements — pre-populate the detail cache
        const cache = new Map()
        for (const badge of badgeList) {
          cache.set(badge.id, badge)
        }
        setDetailCache(cache)

        // Build requirement → latest submission map
        const map = new Map()
        for (const sub of submissionList) {
          const reqId = sub.requirement
          const existing = map.get(reqId)
          // Prefer non-draft statuses, then most recent
          if (!existing || statusPriority(sub.status) > statusPriority(existing.status)) {
            map.set(reqId, sub)
          }
        }
        setSubmissionsMap(map)
      } catch {
        setError('Failed to load badges. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleDetailLoaded = useCallback((badgeId, detail) => {
    setDetailCache((prev) => new Map(prev).set(badgeId, detail))
  }, [])

  // Group badges by category
  const grouped = {}
  for (const badge of badges) {
    if (!grouped[badge.category]) grouped[badge.category] = []
    grouped[badge.category].push(badge)
  }

  // Filter badges/requirements by search query
  const isSearching = debouncedQuery.trim().length > 0
  const lowerQuery = debouncedQuery.toLowerCase().trim()

  const filteredReqsMap = new Map()
  const displayGrouped = {}

  if (isSearching) {
    for (const badge of badges) {
      const reqs = badge.requirements ?? []
      const matched = reqs.filter(
        (r) =>
          r.title?.toLowerCase().includes(lowerQuery) ||
          r.description?.toLowerCase().includes(lowerQuery),
      )
      if (matched.length > 0) {
        filteredReqsMap.set(badge.id, matched)
        if (!displayGrouped[badge.category]) displayGrouped[badge.category] = []
        displayGrouped[badge.category].push(badge)
      }
    }
  } else {
    Object.assign(displayGrouped, grouped)
  }

  const noResults = isSearching && Object.keys(displayGrouped).length === 0

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>OAS Badges</h1>
        <p className={styles.subtitle}>
          Browse all badge categories and their requirements.
          {isScout && ' Click a requirement to submit your evidence.'}
        </p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search requirements…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div>
          {noResults ? (
            <p className={styles.noResults}>No requirements found for &ldquo;{debouncedQuery}&rdquo;.</p>
          ) : (
            CATEGORY_ORDER.filter((cat) => displayGrouped[cat]?.length > 0).map((cat) => (
              <BadgeCategoryGroup
                key={cat}
                categoryKey={cat}
                categoryLabel={CATEGORY_LABELS[cat]}
                badges={displayGrouped[cat]}
                submissionsMap={submissionsMap}
                detailCache={detailCache}
                onDetailLoaded={handleDetailLoaded}
                isScout={isScout}
                isSearching={isSearching}
                filteredReqsMap={filteredReqsMap}
              />
            ))
          )}
          {!isSearching && badges.length === 0 && (
            <p className={styles.empty}>No badges available yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

function statusPriority(status) {
  return { approved: 3, submitted: 2, rejected: 1, draft: 0 }[status] ?? 0
}
