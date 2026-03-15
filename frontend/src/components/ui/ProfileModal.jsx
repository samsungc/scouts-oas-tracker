import { useState } from 'react'
import Modal from './Modal'
import ErrorMessage from './ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import { updateMe, changePassword } from '../../api/users'
import styles from './ProfileModal.module.css'

export default function ProfileModal({ onClose }) {
  const { user, refreshUser } = useAuth()

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
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

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
    setPwError('')
    setPwSuccess(false)
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    setPwSaving(true)
    try {
      await changePassword(pwForm.current, pwForm.next)
      setPwSuccess(true)
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      const msgs = err.raw && typeof err.raw === 'object'
        ? Object.values(err.raw).flatMap((v) => Array.isArray(v) ? v : [v])
        : []
      setPwError(msgs.length ? msgs.join(' ') : (err.detail && !err.detail.startsWith('HTTP ') ? err.detail : 'Failed to change password.'))
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
          <input
            type="password"
            className={styles.input}
            value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            autoComplete="current-password"
          />
          <label className={styles.fieldLabel}>New Password</label>
          <input
            type="password"
            className={styles.input}
            value={pwForm.next}
            onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
            autoComplete="new-password"
          />
          <label className={styles.fieldLabel}>Confirm New Password</label>
          <input
            type="password"
            className={styles.input}
            value={pwForm.confirm}
            onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
            autoComplete="new-password"
          />
          {pwError && <ErrorMessage message={pwError} />}
          {pwSuccess && <p className={styles.success}>Password changed successfully.</p>}
          <button type="submit" className={styles.saveBtn} disabled={pwSaving}>
            {pwSaving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </section>
    </Modal>
  )
}
