import { useState } from 'react'
import Modal from '../ui/Modal'
import ErrorMessage from '../ui/ErrorMessage'
import { deactivateUser } from '../../api/users'
import styles from './DeleteUserModal.module.css'

export default function DeleteUserModal({ scouts, onClose, onDeleted }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filtered = scouts.filter((s) => {
    const lower = search.toLowerCase()
    return (
      s.username.toLowerCase().includes(lower) ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(lower)
    )
  })

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await deactivateUser(selected.id)
      onDeleted()
      onClose()
    } catch {
      setError('Failed to deactivate user. Please try again.')
      setLoading(false)
    }
  }

  const displayName = selected
    ? (selected.first_name || selected.last_name
        ? `${selected.first_name} ${selected.last_name}`.trim()
        : selected.username)
    : ''

  if (confirming) {
    return (
      <Modal title="Confirm Deactivation" onClose={onClose}>
        <p className={styles.confirmText}>
          Are you sure you want to deactivate <strong>{displayName}</strong>
          {displayName !== selected.username && ` (@${selected.username})`}?
          They will no longer be able to log in.
        </p>
        {error && <ErrorMessage message={error} />}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => setConfirming(false)} disabled={loading}>
            Back
          </button>
          <button className={styles.deactivateBtn} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Deactivating…' : 'Confirm Deactivate'}
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Deactivate Scout" onClose={onClose}>
      <p className={styles.desc}>
        Select a scout to deactivate. They will no longer be able to log in.
      </p>
      <input
        type="search"
        className={styles.search}
        placeholder="Search scouts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No scouts found.</p>
        ) : (
          filtered.map((scout) => {
            const name =
              scout.first_name || scout.last_name
                ? `${scout.first_name} ${scout.last_name}`.trim()
                : scout.username
            return (
              <button
                key={scout.id}
                className={`${styles.scoutItem} ${selected?.id === scout.id ? styles.selected : ''}`}
                onClick={() => setSelected(scout)}
              >
                <span className={styles.scoutName}>{name}</span>
                {name !== scout.username && (
                  <span className={styles.scoutUsername}>@{scout.username}</span>
                )}
              </button>
            )
          })
        )}
      </div>
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button
          className={styles.deactivateBtn}
          disabled={!selected}
          onClick={() => setConfirming(true)}
        >
          Deactivate
        </button>
      </div>
    </Modal>
  )
}
