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

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>OAS Badges</h1>
        <p className={styles.subtitle}>
          Browse all badge categories and their requirements.
          {isScout && ' Click a requirement to submit your evidence.'}
        </p>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <div>
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <BadgeCategoryGroup
              key={cat}
              categoryKey={cat}
              categoryLabel={CATEGORY_LABELS[cat]}
              badges={grouped[cat]}
              submissionsMap={submissionsMap}
              detailCache={detailCache}
              onDetailLoaded={handleDetailLoaded}
              isScout={isScout}
            />
          ))}
          {badges.length === 0 && (
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
