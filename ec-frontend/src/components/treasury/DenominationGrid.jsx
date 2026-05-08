import styles from './DenominationGrid.module.css'

const DENOMINATIONS = [10000, 5000, 2000, 1000, 500, 200, 100, 25, 10, 5]

const DENOM_LABELS = {
  10000: '$100',
  5000:  '$50',
  2000:  '$20',
  1000:  '$10',
  500:   '$5',
  200:   '$2',
  100:   '$1',
  25:    '$0.25',
  10:    '$0.10',
  5:     '$0.05',
}

const BILLS = new Set([10000, 5000, 2000, 1000, 500, 200, 100])

export default function DenominationGrid({ breakdown }) {
  if (!breakdown) return null

  const totalCents = DENOMINATIONS.reduce(
    (sum, d) => sum + d * (breakdown[String(d)] ?? 0),
    0
  )

  return (
    <div className={styles.grid}>
      <div className={styles.groupHeader}>
        <span>Bills</span>
        <span>Count</span>
        <span>Subtotal</span>
      </div>
      {DENOMINATIONS.filter((d) => BILLS.has(d)).map((cents) => {
        const count = breakdown[String(cents)] ?? 0
        return (
          <div key={cents} className={`${styles.row} ${count === 0 ? styles.zero : ''}`}>
            <span className={styles.denom}>{DENOM_LABELS[cents]}</span>
            <span className={styles.count}>{count === 0 ? '—' : `× ${count}`}</span>
            <span className={styles.subtotal}>
              {count === 0 ? '' : '$' + ((cents * count) / 100).toFixed(2)}
            </span>
          </div>
        )
      })}

      <div className={styles.groupHeader}>
        <span>Coins</span>
        <span>Count</span>
        <span>Subtotal</span>
      </div>
      {DENOMINATIONS.filter((d) => !BILLS.has(d)).map((cents) => {
        const count = breakdown[String(cents)] ?? 0
        return (
          <div key={cents} className={`${styles.row} ${count === 0 ? styles.zero : ''}`}>
            <span className={styles.denom}>{DENOM_LABELS[cents]}</span>
            <span className={styles.count}>{count === 0 ? '—' : `× ${count}`}</span>
            <span className={styles.subtotal}>
              {count === 0 ? '' : '$' + ((cents * count) / 100).toFixed(2)}
            </span>
          </div>
        )
      })}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>${(totalCents / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}
