import { api } from './client'

export function getEligibleRequirements() {
  return api.get('/peer-review/submissions/eligible_requirements/')
}

export function getPeerReviewSubmissions(params) {
  const p = params ?? {}
  const qs = new URLSearchParams()
  if (p.status) qs.set('status', p.status)
  const query = qs.toString()
  return api.get(`/peer-review/submissions/${query ? '?' + query : ''}`)
}

export function peerApproveSubmission(submissionId, reviewerNotes = '') {
  return api.post(`/peer-review/submissions/${submissionId}/approve/`, {
    reviewer_notes: reviewerNotes,
  })
}

export function peerRejectSubmission(submissionId, reviewerNotes) {
  return api.post(`/peer-review/submissions/${submissionId}/reject/`, {
    reviewer_notes: reviewerNotes,
  })
}
