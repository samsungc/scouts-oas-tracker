import { useState, useRef, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileModal from '../ui/ProfileModal'
import IconTreasury from '../icons/IconTreasury'
import IconReports from '../icons/IconReports'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  {
    key: 'treasury',
    label: 'Treasury',
    to: '/treasurer',
    icon: IconTreasury,
    matchPrefix: '/treasurer',
    excludePrefix: '/treasurer/reports',
  },
  {
    key: 'reports',
    label: 'Reports',
    to: '/treasurer/reports',
    icon: IconReports,
    matchPrefix: '/treasurer/reports',
  },
]

function applyTheme(next) {
  localStorage.setItem('ec_theme', next)
  if (next === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('ec_theme') || 'light')
  const menuRef = useRef(null)

  useEffect(() => {
    function onTouchStart(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('touchstart', onTouchStart)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  function handleTheme(next) {
    setTheme(next)
    applyTheme(next)
  }

  function isActive(item) {
    if (item.excludePrefix && pathname.startsWith(item.excludePrefix)) return false
    return pathname.startsWith(item.matchPrefix)
  }

  const displayName = user?.first_name || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
            >
              <item.icon size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          )
        })}

        <div className={styles.navItem} ref={menuRef}>
          <button
            className={`${styles.avatarBtn} ${menuOpen ? styles.avatarBtnActive : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.avatarInitial}>{initial}</span>
          </button>
          <span className={styles.navLabel}>Account</span>

          {menuOpen && (
            <div className={styles.menu}>
              <div className={styles.menuHeader}>{displayName}</div>
              {user?.ec_role && (
                <div className={styles.menuRole}>{user.ec_role.replace(/_/g, ' ')}</div>
              )}
              <hr className={styles.menuDivider} />
              <button className={styles.menuItem} onClick={() => { setShowProfile(true); setMenuOpen(false) }}>
                My Profile
              </button>
              <div className={styles.themeRow}>
                <div className={styles.themeSegment}>
                  <button
                    className={`${styles.themeSegBtn} ${theme === 'light' ? styles.themeSegActive : ''}`}
                    onClick={() => handleTheme('light')}
                  >
                    ☀ Light
                  </button>
                  <button
                    className={`${styles.themeSegBtn} ${theme === 'dark' ? styles.themeSegActive : ''}`}
                    onClick={() => handleTheme('dark')}
                  >
                    ☾ Dark
                  </button>
                </div>
              </div>
              <hr className={styles.menuDivider} />
              <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={logout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
