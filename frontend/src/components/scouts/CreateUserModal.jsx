import { useState } from 'react'
import Modal from '../ui/Modal'
import ErrorMessage from '../ui/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import { createUser } from '../../api/users'
import { useToast } from '../../context/ToastContext'
import styles from './CreateUserModal.module.css'

const ROLE_OPTIONS = {
  scouter: [
    { value: 'scout', label: 'Scout' },
    { value: 'scouter', label: 'Scouter' },
  ],
  admin: [
    { value: 'scout', label: 'Scout' },
    { value: 'scouter', label: 'Scouter' },
    { value: 'admin', label: 'Admin' },
  ],
}

const EMPTY_FORM = { username: '', first_name: '', last_name: '', email: '', password: '', role: 'scout' }

function parseCreateError(err) {
  if (err.raw && typeof err.raw === 'object') {
    const messages = Object.values(err.raw).flatMap((v) => (Array.isArray(v) ? v : [v]))
    if (messages.length) return messages.join(' ')
  }
  if (err.detail && !err.detail.startsWith('HTTP ')) return err.detail
  return 'Failed to create user.'
}

export default function CreateUserModal({ onClose, onCreated }) {
  const addToast = useToast()
  const { user } = useAuth()
  const roleOptions = ROLE_OPTIONS[user?.role] ?? ROLE_OPTIONS.scouter

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdUser, setCreatedUser] = useState(null)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await createUser(form)
      onCreated()
      setCreatedUser(created)
      addToast({ message: 'User created successfully', variant: 'success' })
    } catch (err) {
      setError(parseCreateError(err))
    } finally {
      setSaving(false)
    }
  }

  function handleCreateAnother() {
    setCreatedUser(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  if (createdUser) {
    const displayName = [createdUser.first_name, createdUser.last_name].filter(Boolean).join(' ')
    return (
      <Modal title="Create New User" onClose={onClose}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>✓</div>
          <p className={styles.successMsg}>
            <strong>{displayName || createdUser.username}</strong> (@{createdUser.username}) was created successfully as a <strong>{createdUser.role}</strong>.
          </p>
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={handleCreateAnother}>
              Create Another
            </button>
            <button className={styles.createBtn} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Create New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Username <span className={styles.req}>*</span></label>
        <input
          className={styles.input}
          value={form.username}
          onChange={set('username')}
          required
          autoFocus
        />

        <div className={styles.row}>
          <div className={styles.col}>
            <label className={styles.label}>First Name</label>
            <input className={styles.input} value={form.first_name} onChange={set('first_name')} />
          </div>
          <div className={styles.col}>
            <label className={styles.label}>Last Name</label>
            <input className={styles.input} value={form.last_name} onChange={set('last_name')} />
          </div>
        </div>

        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          value={form.email}
          onChange={set('email')}
        />

        <label className={styles.label}>Password <span className={styles.req}>*</span></label>
        <input
          type="password"
          className={styles.input}
          value={form.password}
          onChange={set('password')}
          required
          autoComplete="new-password"
        />

        <label className={styles.label}>Role</label>
        <select className={styles.input} value={form.role} onChange={set('role')}>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {error && <ErrorMessage message={error} />}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.createBtn} disabled={saving}>
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
