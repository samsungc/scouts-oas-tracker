import { Link } from 'react-router-dom'
import styles from './StatementListItem.module.css'

function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmtDate(iso) {
  return parseDate(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StatementListItem({ statement, startYear }) {
  return (
    <Link to={`/treasurer/reports/${startYear}/${statement.id}`} className={styles.item}>
      {fmtDate(statement.period_start)} — {fmtDate(statement.period_end)}
    </Link>
  )
}
