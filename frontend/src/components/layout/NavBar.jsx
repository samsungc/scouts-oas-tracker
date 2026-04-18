import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileModal from '../ui/ProfileModal'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('oas_theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const menuRef = useRef(null)

  function applyTheme(next) {
    setThemeState(next)
    localStorage.setItem('oas_theme', next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  useEffect(() => {
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const isReviewer = user?.role === 'scouter' || user?.role === 'admin'
  const isScout = user?.role === 'scout'
  const displayName = user?.first_name || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>OAS Badge Tracker</span>
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
              `${styles.link} ${styles.mobileHide} ${isActive ? styles.active : ''}`
            }
          >
            Leaderboard
          </NavLink>
          {isScout && (
            <NavLink
              to="/my-submissions"
              className={({ isActive }) =>
                `${styles.link} ${styles.mobileHide} ${isActive ? styles.active : ''}`
              }
            >
              My Submissions
            </NavLink>
          )}
          {isScout && user?.peer_review_eligible && (
            <NavLink
              to="/peer-review"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              Peer Review
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
                `${styles.link} ${styles.mobileHide} ${isActive ? styles.active : ''}`
              }
            >
              Import
            </NavLink>
          )}
        </div>
        {user && (
          <div className={styles.menuAvatarWrapper} ref={menuRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="User menu"
            >
              <span className={styles.avatarInitial}>{initial}</span>
              <span className={styles.avatarName}>{displayName}</span>
            </button>
            {menuOpen && (
              <div className={styles.menu}>
                <div className={styles.menuHeader}>{displayName}</div>
                <hr className={styles.menuDivider} />
                <button
                  className={styles.menuItem}
                  onClick={() => { setShowProfile(true); setMenuOpen(false) }}
                >
                  My Profile
                </button>
                <div className={styles.themeRow}>
                  <div className={styles.themeSegment}>
                    <button
                      className={`${styles.themeSegBtn} ${theme === 'light' ? styles.themeSegActive : ''}`}
                      onClick={() => applyTheme('light')}
                    >
                      ☀ Light
                    </button>
                    <button
                      className={`${styles.themeSegBtn} ${theme === 'dark' ? styles.themeSegActive : ''}`}
                      onClick={() => applyTheme('dark')}
                    >
                      ☾ Dark
                    </button>
                  </div>
                </div>
                <hr className={styles.menuDivider} />
                <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
    {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
