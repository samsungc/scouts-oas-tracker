import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getRequirement, getBadgeDetail } from '../api/badges'
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
  const badgeId = searchParams.get('badgeId')

  const [requirement, setRequirement] = useState(null)
  const [badgeName, setBadgeName] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [siblingReqs, setSiblingReqs] = useState([])

  useEffect(() => {
    if (!requirementId) {
      navigate('/badges')
      return
    }

    async function load() {
      setLoading(true)
      setError('')
      try {
        const fetches = [getSubmissions(), getRequirement(requirementId)]
        if (badgeId) fetches.push(getBadgeDetail(badgeId))
        const [allSubs, reqData, badgeData] = await Promise.all(fetches)

        setRequirement(reqData)
        setBadgeName(reqData.badge_name)

        if (badgeData?.requirements) {
          const sorted = [...badgeData.requirements].sort((a, b) => a.order - b.order)
          setSiblingReqs(sorted)
        }

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
  }, [requirementId, badgeId, navigate])

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

  const hasSubmission = submissions.length > 0

  const currentIdx = siblingReqs.findIndex((r) => String(r.id) === String(requirementId))
  const prevReq = currentIdx > 0 ? siblingReqs[currentIdx - 1] : null
  const nextReq = currentIdx >= 0 && currentIdx < siblingReqs.length - 1 ? siblingReqs[currentIdx + 1] : null

  function navToReq(req) {
    navigate(`/submit?requirementId=${req.id}${badgeId ? `&badgeId=${badgeId}` : ''}`)
  }

  return (
    <div>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate('/badges')}>
          ← Back to Badges
        </button>
        {siblingReqs.length > 1 && (
          <div className={styles.reqNav}>
            <button
              className={styles.reqNavBtn}
              onClick={() => prevReq && navToReq(prevReq)}
              disabled={!prevReq}
            >
              ← Prev
            </button>
            <span className={styles.reqNavCount}>
              {currentIdx + 1} / {siblingReqs.length}
            </span>
            <button
              className={styles.reqNavBtn}
              onClick={() => nextReq && navToReq(nextReq)}
              disabled={!nextReq}
            >
              Next →
            </button>
          </div>
        )}
      </div>

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
              {!hasSubmission && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreate}
                  loading={creating}
                >
                  + New Submission
                </Button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className={styles.noSubmissions}>
                <p>You haven't started this requirement yet.</p>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  loading={creating}
                >
                  Start Submission
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

          {(prevReq || nextReq) && (
            <div className={styles.bottomNav}>
              <button
                className={styles.bottomNavBtn}
                onClick={() => prevReq && navToReq(prevReq)}
                disabled={!prevReq}
              >
                ← {prevReq ? prevReq.title : 'Previous'}
              </button>
              <button
                className={styles.bottomNavBtn}
                onClick={() => nextReq && navToReq(nextReq)}
                disabled={!nextReq}
              >
                {nextReq ? nextReq.title : 'Next'} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
