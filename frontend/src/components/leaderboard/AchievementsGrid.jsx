import styles from './AchievementsGrid.module.css'

export default function AchievementsGrid({ achievements }) {
  return (
    <div className={styles.grid}>
      {achievements.map((a) => {
        const cardClass = a.mystery
          ? `${styles.card} ${a.unlocked ? styles.mysteryUnlocked : styles.locked}`
          : `${styles.card} ${a.unlocked ? styles.unlocked : styles.locked}`

        return (
          <div key={a.id} className={cardClass}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.desc}>{a.description}</span>
            <span className={styles.pct}>{a.percent_holding}% of scouts</span>
          </div>
        )
      })}
    </div>
  )
}
