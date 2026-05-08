import { useState, useRef, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProfileModal from '../ui/ProfileModal'
import IconTreasury from '../icons/IconTreasury'
import IconReports from '../icons/IconReports'
import styles from './Sidebar.module.css'

const NAV_GROUPS = [
  {
    category: 'Treasurer',
    items: [
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
        label: 'Financial Reports',
        to: '/treasurer/reports',
        icon: IconReports,
        matchPrefix: '/treasurer/reports',
      },
    ],
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

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [theme, setTheme] = useState(
    () => localStorage.getItem('ec_theme') || 'light'
  )
  const menuRef = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKeyDown(e) { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  function handleTheme(next) {
    setTheme(next)
    applyTheme(next)
  }

  function isActive(item) {
    if (!item.matchPrefix) return false
    if (item.excludePrefix && pathname.startsWith(item.excludePrefix)) return false
    return pathname.startsWith(item.matchPrefix)
  }

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('ec_sidebar_collapsed') === 'true'
  )

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('ec_sidebar_collapsed', String(next))
      return next
    })
  }

  const displayName = user?.first_name || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <span className={styles.brandText}>EC Portal</span>
        <button className={styles.collapseBtn} onClick={toggleCollapsed} title={collapsed ? 'Expand' : 'Collapse'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <polyline points="9 18 15 12 9 6" />
              : <polyline points="15 18 9 12 15 6" />}
          </svg>
        </button>
      </div>

      <ul className={styles.navList}>
        {NAV_GROUPS.map((group) => (
          <li key={group.category}>
            <span className={styles.navCategory}>{group.category}</span>
            <ul className={styles.navGroupList}>
              {group.items.map((item) => {
                if (item.disabled) {
                  return (
                    <li key={item.key} className={styles.navItemDisabled} title={collapsed ? item.label : undefined}>
                      <item.icon size={16} />
                      <span className={styles.navLabel}>{item.label}</span>
                    </li>
                  )
                }
                const active = isActive(item)
                return (
                  <li key={item.key}>
                    <NavLink
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                    >
                      <item.icon size={16} />
                      <span className={styles.navLabel}>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className={styles.userSection} ref={menuRef}>
        <button className={styles.avatarBtn} onClick={() => setMenuOpen((o) => !o)} title={collapsed ? displayName : undefined}>
          <span className={styles.avatarInitial}>{initial}</span>
          <div className={styles.userInfo}>
            <span className={styles.username}>{displayName}</span>
            {user?.ec_role && (
              <span className={styles.ecRole}>{user.ec_role.replace(/_/g, ' ')}</span>
            )}
          </div>
        </button>

        {menuOpen && (
          <div className={styles.menu}>
            <div className={styles.menuHeader}>{displayName}</div>
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
