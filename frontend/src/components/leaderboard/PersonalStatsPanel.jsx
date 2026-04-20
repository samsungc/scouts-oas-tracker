import { useState, useEffect } from 'react'
import { getMyAchievements } from '../../api/leaderboard'
import AchievementsGrid from './AchievementsGrid'
import styles from './PersonalStatsPanel.module.css'

const RANK_LEVELS = [
  { threshold: 0,    label: 'Bronze' },
  { threshold: 1000, label: 'Silver' },
  { threshold: 2000, label: 'Gold' },
  { threshold: 3000, label: 'Platinum' },
  { threshold: 5000, label: 'Diamond' },
  { threshold: 6767, label: 'Master' },
]

export default function PersonalStatsPanel({ stats }) {
  const [achievementsOpen, setAchievementsOpen] = useState(true)
  const [achievements, setAchievements] = useState(null)

  useEffect(() => {
    getMyAchievements()
      .then((data) => setAchievements(data.achievements))
      .catch(() => {})
  }, [])

  const {
    total_approved,
    total_submitted,
    completed_badges,
    personal_progression_name,
    total_points,
    rank_label,
    current_streak_days,
    longest_streak_days,
  } = stats

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
          <span className={styles.streakHint}>Build a streak by submitting requirements every day</span>
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
          <div className={styles.pill}>
            <span className={personal_progression_name ? styles.pillValueSm : styles.pillValue}>
              {personal_progression_name ?? 'N/A'}
            </span>
            <span className={styles.pillLabel}>Prog. Level</span>
          </div>
        </div>
      </div>

      {achievements && achievements.length > 0 && (
        <div className={styles.categoryBars}>
          <button
            className={styles.barsTitleBtn}
            onClick={() => setAchievementsOpen((v) => !v)}
          >
            <span className={styles.barsTitle}>
              Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
            </span>
            <span className={`${styles.chevron} ${achievementsOpen ? styles.chevronOpen : ''}`}>▾</span>
          </button>
          <div className={`${styles.barsCollapsible} ${achievementsOpen ? styles.barsOpen : ''}`}>
            <AchievementsGrid achievements={achievements} />
          </div>
        </div>
      )}
    </div>
  )
}
