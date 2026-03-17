import { api } from './client'

export function getReviewSubmissions(params) {
  // Accept either a plain status string (legacy) or an object { status, scout_id, requirement_id, page }
  const p = typeof params === 'string' ? { status: params } : (params ?? {})
  const qs = new URLSearchParams()
  if (p.status) qs.set('status', p.status)
  if (p.scout_id) qs.set('scout_id', p.scout_id)
  if (p.requirement_id) qs.set('requirement_id', p.requirement_id)
  if (p.days) qs.set('days', p.days)
  if (p.page) qs.set('page', p.page)
  if (p.page_size) qs.set('page_size', p.page_size)
  const query = qs.toString()
  return api.get(`/review/submissions/${query ? '?' + query : ''}`)
}

export function batchDirectApprove(requirementId, scoutIds, reviewerNotes = '') {
  return api.post('/review/submissions/batch_direct_approve/', {
    requirement_id: requirementId,
    scout_ids: scoutIds,
    reviewer_notes: reviewerNotes,
  })
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
