import { useState, useEffect } from 'react'
import { getActivityLeaderboard } from '../../api/leaderboard'
import { getReviewSubmissions } from '../../api/review'
import { getScouts } from '../../api/users'
import styles from './BadgesBanner.module.css'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function StatCard({ value, label, loading, children }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{loading ? '—' : (value ?? '—')}</span>
      <span className={styles.statLabel}>{label}</span>
      {children}
    </div>
  )
}

export default function BadgesBanner({ isScout, isScouter, user, completedBadges, totalBadges }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      setLoading(true)
      try {
        if (isScout) {
          const leaderboard = await getActivityLeaderboard('7d')
          const entries = leaderboard?.entries ?? []
          const myEntry = entries.find((e) => e.scout_id === user?.id)
          if (!cancelled) setStats({
            rank: myEntry?.rank ?? null,
            weeklyApproved: myEntry?.approved_count ?? 0,
          })
        } else if (isScouter) {
          const cutoff = Date.now() - SEVEN_DAYS_MS
          const [approved, pending, scouts] = await Promise.all([
            getReviewSubmissions({ status: 'approved', days: 7 }),
            getReviewSubmissions({ status: 'submitted' }),
            getScouts(),
          ])
          const scoutList = Array.isArray(scouts) ? scouts : (scouts?.results ?? [])
          const activeScouts = scoutList.filter((s) =>
            s.last_login && new Date(s.last_login).getTime() >= cutoff
          ).length
          if (!cancelled) setStats({
            approvedCount: approved?.count ?? approved?.results?.length ?? 0,
            pendingCount: pending?.count ?? pending?.results?.length ?? 0,
            activeScouts,
            totalScouts: scoutList.length,
          })
        }
      } catch {
        if (!cancelled) setStats(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [isScout, isScouter, user?.id])

  const subtitle = isScout
    ? 'Click a requirement to submit evidence'
    : 'Browse categories and requirements · batch-approve scouts'

  return (
    <div className={styles.banner}>
      <div className={styles.bannerLeft}>
        <h1 className={styles.bannerTitle}>OAS Badges</h1>
        <p className={styles.bannerSubtitle}>{subtitle}</p>
      </div>

      <div className={styles.divider} />

      <div className={styles.stats}>
        {isScout && (
          <>
            <StatCard
              value={`${completedBadges} / ${totalBadges}`}
              label="Badges completed"
              loading={false}
            />
            <StatCard
              value={stats?.rank != null ? `#${stats.rank}` : '—'}
              label="Weekly activity rank"
              loading={loading}
            />
            <StatCard
              value={stats?.weeklyApproved}
              label="Submissions approved (7d)"
              loading={loading}
            />
          </>
        )}
        {isScouter && (
          <>
            <StatCard
              value={stats?.approvedCount}
              label="Submissions approved (7d)"
              loading={loading}
            />
            <StatCard
              value={stats?.pendingCount}
              label="Submissions pending review"
              loading={loading}
            />
            <StatCard
              value={stats?.activeScouts}
              label="Scouts logged in this week"
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  )
}
