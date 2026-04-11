import { useState } from 'react'

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
import Modal from './Modal'
import ErrorMessage from './ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import { updateMe, changePassword } from '../../api/users'
import styles from './ProfileModal.module.css'

export default function ProfileModal({ onClose }) {
  const { user, refreshUser } = useAuth()

  // Notifications state
  const [notifEnabled, setNotifEnabled] = useState(user?.email_notifications ?? true)
  const [notifSaving, setNotifSaving] = useState(false)

  async function handleNotifToggle(e) {
    const newValue = e.target.checked
    setNotifEnabled(newValue)
    setNotifSaving(true)
    try {
      await updateMe({ email_notifications: newValue })
    } catch {
      setNotifEnabled(!newValue)
    } finally {
      setNotifSaving(false)
    }
  }

  // Edit profile state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwFieldErrors, setPwFieldErrors] = useState({ current: '', next: '', confirm: '', general: '' })
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false })

  function clearPwErrors() {
    setPwFieldErrors({ current: '', next: '', confirm: '', general: '' })
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess(false)
    try {
      await updateMe(profileForm)
      await refreshUser()
      setProfileSuccess(true)
    } catch (err) {
      setProfileError(err.detail ?? 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    clearPwErrors()
    setPwSuccess(false)

    // Client-side validation
    const fieldErrs = { current: '', next: '', confirm: '', general: '' }
    if (!pwForm.current) fieldErrs.current = 'Required'
    if (!pwForm.next) fieldErrs.next = 'Required'
    if (!pwForm.confirm) fieldErrs.confirm = 'Required'
    if (pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm) {
      fieldErrs.confirm = 'Passwords do not match'
    }
    if (fieldErrs.current || fieldErrs.next || fieldErrs.confirm) {
      setPwFieldErrors(fieldErrs)
      return
    }

    setPwSaving(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      const raw = err.raw && typeof err.raw === 'object' ? err.raw : {}
      setPwFieldErrors({
        current: raw.current_password ? [].concat(raw.current_password)[0] : '',
        next:    raw.new_password     ? [].concat(raw.new_password)[0]     : '',
        confirm: '',
        general: (!raw.current_password && !raw.new_password)
          ? (err.detail && !err.detail.startsWith('HTTP ') ? err.detail : 'Failed to change password.')
          : '',
      })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <Modal title="My Profile" onClose={onClose}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Account Info</h3>
        <div className={styles.readOnlyRow}>
          <span className={styles.label}>Username</span>
          <span className={styles.value}>{user?.username}</span>
        </div>
        <div className={styles.readOnlyRow}>
          <span className={styles.label}>Role</span>
          <span className={styles.value}>{user?.role}</span>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Notifications</h3>
        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={notifEnabled}
            onChange={handleNotifToggle}
            disabled={notifSaving}
          />
          <span className={styles.toggleLabel}>
            Email notifications{notifSaving ? ' (saving\u2026)' : ''}
          </span>
        </label>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Edit Profile</h3>
        <form onSubmit={handleProfileSave} className={styles.form}>
          <label className={styles.fieldLabel}>First Name</label>
          <input
            className={styles.input}
            value={profileForm.first_name}
            onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
          />
          <label className={styles.fieldLabel}>Last Name</label>
          <input
            className={styles.input}
            value={profileForm.last_name}
            onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
          />
          <label className={styles.fieldLabel}>Email</label>
          <input
            type="email"
            className={styles.input}
            value={profileForm.email}
            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
          />
          {profileError && <ErrorMessage message={profileError} />}
          {profileSuccess && <p className={styles.success}>Profile updated.</p>}
          <button type="submit" className={styles.saveBtn} disabled={profileSaving}>
            {profileSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Change Password</h3>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          <label className={styles.fieldLabel}>Current Password</label>
          <div className={styles.pwWrapper}>
            <input
              type={pwShow.current ? 'text' : 'password'}
              className={`${styles.input} ${pwFieldErrors.current ? styles.inputError : ''}`}
              value={pwForm.current}
              onChange={(e) => { setPwForm((f) => ({ ...f, current: e.target.value })); setPwFieldErrors((fe) => ({ ...fe, current: '' })) }}
              autoComplete="current-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setPwShow((s) => ({ ...s, current: !s.current }))}>
              {pwShow.current ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {pwFieldErrors.current && <span className={styles.fieldError}>{pwFieldErrors.current}</span>}
          <label className={styles.fieldLabel}>New Password</label>
          <div className={styles.pwWrapper}>
            <input
              type={pwShow.next ? 'text' : 'password'}
              className={`${styles.input} ${pwFieldErrors.next ? styles.inputError : ''}`}
              value={pwForm.next}
              onChange={(e) => { setPwForm((f) => ({ ...f, next: e.target.value })); setPwFieldErrors((fe) => ({ ...fe, next: '' })) }}
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setPwShow((s) => ({ ...s, next: !s.next }))}>
              {pwShow.next ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {pwFieldErrors.next && <span className={styles.fieldError}>{pwFieldErrors.next}</span>}
          <label className={styles.fieldLabel}>Confirm New Password</label>
          <div className={styles.pwWrapper}>
            <input
              type={pwShow.confirm ? 'text' : 'password'}
              className={`${styles.input} ${pwFieldErrors.confirm ? styles.inputError : ''}`}
              value={pwForm.confirm}
              onChange={(e) => { setPwForm((f) => ({ ...f, confirm: e.target.value })); setPwFieldErrors((fe) => ({ ...fe, confirm: '' })) }}
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setPwShow((s) => ({ ...s, confirm: !s.confirm }))}>
              {pwShow.confirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {pwFieldErrors.confirm && <span className={styles.fieldError}>{pwFieldErrors.confirm}</span>}
          {pwFieldErrors.general && <ErrorMessage message={pwFieldErrors.general} />}
          {pwSuccess && <p className={styles.success}>Password changed successfully.</p>}
          <button type="submit" className={styles.saveBtn} disabled={pwSaving}>
            {pwSaving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </section>
    </Modal>
  )
}
