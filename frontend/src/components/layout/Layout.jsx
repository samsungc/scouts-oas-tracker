import NavBar from './NavBar'
import LoginNotificationBanner from '../ui/LoginNotificationBanner'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.root}>
      <NavBar />
      <LoginNotificationBanner />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
