import styles from './PersonalStatsPanel.module.css'

const RANK_LEVELS = [
  { threshold: 0,    label: 'Noob' },
  { threshold: 1000, label: 'Novice' },
  { threshold: 2000, label: 'Scout' },
  { threshold: 3000, label: 'Good Scout' },
  { threshold: 5000, label: 'Legendary Scout' },
  { threshold: 6767, label: 'OAS Master' },
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

export default function PersonalStatsPanel({ stats }) {
  const {
    total_approved,
    total_submitted,
    completed_badges,
    total_points,
    rank_label,
    current_streak_days,
    longest_streak_days,
    approved_by_category,
  } = stats

  const categoryEntries = Object.entries(approved_by_category)
  const maxCategoryCount = Math.max(1, ...categoryEntries.map(([, v]) => v))

  return (
    <div className={styles.panel}>
      <div className={styles.topRow}>
        <div className={styles.rankSection}>
          <span className={styles.rankBadge}>{rank_label}</span>
          <div className={styles.points}>{total_points} pts</div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>+10 pts per approved requirement</span>
            <span className={styles.legendItem}>+25 pts per completed badge</span>
          </div>
        </div>

        <div className={styles.streakSection}>
          {current_streak_days >= 1 ? (
            <span className={styles.streak}>
              🔥 {current_streak_days}-day streak
            </span>
          ) : (
            <span className={styles.streakNone}>No active streak</span>
          )}
          {longest_streak_days > 0 && (
            <span className={styles.longestStreak}>
              Best: {longest_streak_days} days
            </span>
          )}
          <div className={styles.rankLadder}>
            {RANK_LEVELS.map((level) => {
              const reached = total_points >= level.threshold
              const isCurrent = rank_label === level.label
              return (
                <div
                  key={level.threshold}
                  className={`${styles.rankStep} ${reached ? styles.rankReached : ''} ${isCurrent ? styles.rankCurrent : ''}`}
                >
                  <span className={styles.rankDot} />
                  <span className={styles.rankStepLabel}>{level.label}</span>
                  <span className={styles.rankStepPts}>{level.threshold.toLocaleString()} pts</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.pills}>
          <div className={styles.pill}>
            <span className={styles.pillValue}>{total_approved}</span>
            <span className={styles.pillLabel}>Approved</span>
          </div>
          <div className={styles.pill}>
            <span className={styles.pillValue}>{total_submitted}</span>
            <span className={styles.pillLabel}>Pending</span>
          </div>
          <div className={styles.pill}>
            <span className={styles.pillValue}>{completed_badges}</span>
            <span className={styles.pillLabel}>Badges Done</span>
          </div>
        </div>
      </div>

      {categoryEntries.length > 0 && (
        <div className={styles.categoryBars}>
          <h3 className={styles.barsTitle}>Progress by Category</h3>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = approved_by_category[key] || 0
            const pct = (count / maxCategoryCount) * 100
            return (
              <div key={key} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={styles.barCount}>{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
