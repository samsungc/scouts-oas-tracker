import NavBar from './NavBar'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      <NavBar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
