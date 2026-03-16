import styles from './CategoryChampionsGrid.module.css'

export default function CategoryChampionsGrid({ champions, currentUserId }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Category Champions</h2>
      <p className={styles.subtitle}>
        Scouts who have reached the highest badge level in each category.
      </p>
      <div className={styles.grid}>
        {champions.map(({ category, category_label, champion }) => {
          const isMe = champion?.scouts?.some(s => s.scout_id === currentUserId)
          return (
            <div
              key={category}
              className={`${styles.card} ${!champion ? styles.empty : ''} ${isMe ? styles.mine : ''}`}
            >
              <span className={styles.categoryLabel}>{category_label}</span>
              {champion ? (
                <>
                  <div className={styles.levelBadge}>Level {champion.badge_level}</div>
                  <span className={styles.badgeName}>{champion.badge_name}</span>
                  <div className={styles.scouts}>
                    {champion.scouts.map(s => {
                      const scoutIsMe = s.scout_id === currentUserId
                      return (
                        <span
                          key={s.scout_id}
                          className={`${styles.scout} ${scoutIsMe ? styles.scoutMe : ''}`}
                        >
                          {scoutIsMe ? '👑' : '🏅'} {s.scout_display_name}
                        </span>
                      )
                    })}
                  </div>
                </>
              ) : (
                <span className={styles.noChampion}>No champion yet</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
