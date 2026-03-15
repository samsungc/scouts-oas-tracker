import { useState, useEffect } from 'react'
import { getPeerReviewSubmissions, peerApproveSubmission, peerRejectSubmission } from '../api/peerReview'
import ReviewCard from '../components/review/ReviewCard'
import RejectModal from '../components/review/RejectModal'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Pagination from '../components/ui/Pagination'
import styles from './ReviewPage.module.css'

const PAGE_SIZE = 20

export default function PeerReviewPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    setError('')
    try {
      const data = await getPeerReviewSubmissions()
      setSubmissions(data)
    } catch (err) {
      setError('Failed to load submissions. Please try refreshing.')
    } finally {
      setLoading(false)
    }
  }

  function handleApproved(updated) {
    setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
  }

  function handleRejected(updated) {
    setRejectTarget(null)
    setSubmissions((prev) => prev.filter((s) => s.id !== updated.id))
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Peer Review</h1>
        <p className={styles.subtitle}>
          Review badge submissions from your fellow scouts. As a senior member, you can sign off on requirements you have already mastered.
        </p>
      </div>

      {loading && <Spinner centered />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          {submissions.length === 0 ? (
            <div className={styles.empty}>
              <p>No pending submissions to peer review right now.</p>
            </div>
          ) : (
            <>
              <div className={styles.cards}>
                {submissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((sub) => (
                  <ReviewCard
                    key={sub.id}
                    submission={sub}
                    requirement={sub.requirement_detail}
                    onApproved={handleApproved}
                    onRejectClick={setRejectTarget}
                    onApprove={(id) => peerApproveSubmission(id)}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={Math.ceil(submissions.length / PAGE_SIZE)}
                onPage={setPage}
              />
            </>
          )}
        </>
      )}

      {rejectTarget && (
        <RejectModal
          submission={rejectTarget}
          onRejected={handleRejected}
          onClose={() => setRejectTarget(null)}
          onReject={(id, notes) => peerRejectSubmission(id, notes)}
        />
      )}
    </div>
  )
}
