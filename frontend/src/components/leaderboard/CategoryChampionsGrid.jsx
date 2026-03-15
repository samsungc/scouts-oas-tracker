import styles from './CategoryChampionsGrid.module.css'

export default function CategoryChampionsGrid({ champions, currentUserId }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Category Champions</h2>
      <p className={styles.subtitle}>
        Scout with the most requirements approved for a single badge in each category.
      </p>
      <div className={styles.grid}>
        {champions.map(({ category, category_label, champion }) => {
          const isMe = champion && champion.scout_id === currentUserId
          return (
            <div
              key={category}
              className={`${styles.card} ${!champion ? styles.empty : ''} ${isMe ? styles.mine : ''}`}
            >
              <span className={styles.categoryLabel}>{category_label}</span>
              {champion ? (
                <>
                  <span className={styles.champion}>
                    {isMe ? '👑 ' : '🏅 '}{champion.scout_display_name}
                  </span>
                  <span className={styles.badgeName}>{champion.badge_name}</span>
                  <span className={styles.reqCount}>
                    {champion.approved_req_count} requirement{champion.approved_req_count !== 1 ? 's' : ''}
                  </span>
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
