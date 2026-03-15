import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileModal from '../ui/ProfileModal'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isReviewer = user?.role === 'scouter' || user?.role === 'admin'
  const isScout = user?.role === 'scout'

  return (
    <>
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>OAS Badge Tracker</span>
          <span className={styles.groupName}>6th Richmond Hill Scout Group</span>
        </div>
        <div className={styles.links}>
          <NavLink
            to="/badges"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Badges
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            Leaderboard
          </NavLink>
          {isScout && (
            <NavLink
              to="/my-submissions"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              My Submissions
            </NavLink>
          )}
          {isReviewer && (
            <>
              <NavLink
                to="/scouts"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`
                }
              >
                Scouts
              </NavLink>
              <NavLink
                to="/review"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`
                }
              >
                Review
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/import"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              Import
            </NavLink>
          )}
        </div>
        <div className={styles.userArea}>
          {user && (
            <span className={styles.greeting}>
              Hello, {user.first_name || user.username}
            </span>
          )}
          <button className={styles.profileBtn} onClick={() => setShowProfile(true)}>
            My Profile
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
    {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
