import { api } from './client'

export function getReviewSubmissions(status) {
  const qs = status ? `?status=${status}` : ''
  return api.get(`/review/submissions/${qs}`)
}

export function approveSubmission(submissionId, reviewerNotes = '') {
  return api.post(`/review/submissions/${submissionId}/approve/`, {
    reviewer_notes: reviewerNotes,
  })
}

export function rejectSubmission(submissionId, reviewerNotes) {
  return api.post(`/review/submissions/${submissionId}/reject/`, {
    reviewer_notes: reviewerNotes,
  })
}
