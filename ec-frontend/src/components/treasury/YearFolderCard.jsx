import { Link } from 'react-router-dom'
import IconReports from '../icons/IconReports'
import styles from './YearFolderCard.module.css'

export default function YearFolderCard({ fiscalYear }) {
  const { start_year, label, count } = fiscalYear

  return (
    <Link to={`/treasurer/reports/${start_year}`} className={styles.card}>
      <IconReports size={28} />
      <div className={styles.info}>
        <h3 className={styles.label}>{label}</h3>
        <span className={styles.count}>{count} {count === 1 ? 'report' : 'reports'}</span>
      </div>
    </Link>
  )
}
