import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getBadges, getBadgeDetail } from '../api/badges'
import { getSubmissions, createSubmission } from '../api/submissions'
import SubmissionCard from '../components/submissions/SubmissionCard'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import styles from './SubmitPage.module.css'

export default function SubmitPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requirementId = searchParams.get('requirementId')

  const [requirement, setRequirement] = useState(null)
  const [badgeName, setBadgeName] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requirementId) {
      navigate('/badges')
      return
    }

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [allSubs, allBadges] = await Promise.all([
          getSubmissions(),
          getBadges(),
        ])

        // Find which badge this requirement belongs to
        let foundReq = null
        let foundBadgeName = ''
        for (const badge of allBadges) {
          try {
            const detail = await getBadgeDetail(badge.id)
            const req = detail.requirements.find(
              (r) => String(r.id) === String(requirementId)
            )
            if (req) {
              foundReq = req
              foundBadgeName = badge.name
              break
            }
          } catch {
            // skip
          }
        }

        setRequirement(foundReq)
        setBadgeName(foundBadgeName)

        const relatedSubs = allSubs.filter(
          (s) => String(s.requirement) === String(requirementId)
        )
        setSubmissions(relatedSubs)
      } catch {
        setError('Failed to load data. Please try refreshing.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [requirementId, navigate])

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      const newSub = await createSubmission(requirementId)
      setSubmissions((prev) => [...prev, { ...newSub, evidence: [] }])
    } catch (err) {
      setError(err.message || 'Failed to create submission.')
    } finally {
      setCreating(false)
    }
  }

  function handleUpdated(updated) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    )
  }

  function handleDeleted(subId) {
    setSubmissions((prev) => prev.filter((s) => s.id !== subId))
  }

  const hasDraft = submissions.some((s) => s.status === 'draft')

  return (
    <div>
      <button className={styles.back} onClick={() => navigate('/badges')}>
        ← Back to Badges
      </button>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && (
        <>
          <div className={styles.pageHeader}>
            {badgeName && (
              <p className={styles.badgeName}>{badgeName}</p>
            )}
            <h1 className={styles.title}>
              {requirement?.title ?? `Requirement #${requirementId}`}
            </h1>
            {requirement?.description && (
              <p className={styles.description}>{requirement.description}</p>
            )}
            {requirement?.hint && (
              <p className={styles.hint}>
                <strong>Hint:</strong> {requirement.hint}
              </p>
            )}
          </div>

          <div className={styles.submissionsSection}>
            <div className={styles.submissionsHeader}>
              <h2 className={styles.submissionsTitle}>Your Submissions</h2>
              {!hasDraft && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? 'Creating…' : '+ New Submission'}
                </Button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className={styles.noSubmissions}>
                <p>You haven't started this requirement yet.</p>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? 'Creating…' : 'Start Submission'}
                </Button>
              </div>
            ) : (
              <div className={styles.cards}>
                {submissions.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
