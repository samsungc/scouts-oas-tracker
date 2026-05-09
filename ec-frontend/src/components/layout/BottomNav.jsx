import { useState } from 'react'
import { useLocation, NavLink, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('ec_theme') || 'light')

  function handleTheme(next) { setTheme(next); applyTheme(next) }

  function isActive(item) {
    if (item.excludePrefix && pathname.startsWith(item.excludePrefix)) return false
    return pathname.startsWith(item.matchPrefix)
  }

  function handleNavItem(to) { setDrawerOpen(false); navigate(to) }

  const displayName = user?.first_name || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ''}`}
          >
            <item.icon size={20} />
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
        <button
          className={`${styles.navItem} ${drawerOpen ? styles.navItemActive : ''}`}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span className={styles.navLabel}>Menu</span>
        </button>
      </nav>

      {drawerOpen && <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />}

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHandle} />

        <div className={styles.drawerUser}>
          <span className={styles.drawerAvatar}>{initial}</span>
          <div>
            <div className={styles.drawerUsername}>{displayName}</div>
            {user?.ec_role && <div className={styles.drawerRole}>{user.ec_role.replace(/_/g, ' ')}</div>}
          </div>
        </div>

        <div className={styles.drawerSection}>
          <div className={styles.drawerSectionLabel}>Navigation</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`${styles.drawerItem} ${isActive(item) ? styles.drawerItemActive : ''}`}
              onClick={() => handleNavItem(item.to)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.drawerSection}>
          <div className={styles.drawerSectionLabel}>Appearance</div>
          <div className={styles.themeSegment}>
            <button className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`} onClick={() => handleTheme('light')}>☀ Light</button>
            <button className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`} onClick={() => handleTheme('dark')}>☾ Dark</button>
          </div>
        </div>

        <div className={styles.drawerSection}>
          <button className={styles.drawerItem} onClick={() => { setShowProfile(true); setDrawerOpen(false) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>My Profile</span>
          </button>
          <button className={`${styles.drawerItem} ${styles.drawerItemDanger}`} onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
