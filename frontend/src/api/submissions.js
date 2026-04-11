import { api } from './client'

export function getSubmissions() {
  return api.get('/submissions/')
}

export function createSubmission(requirementId) {
  return api.post('/submissions/', { requirement: requirementId })
}

export function submitForReview(submissionId) {
  return api.post(`/submissions/${submissionId}/submit/`, {})
}

export function deleteSubmission(submissionId) {
  return api.delete(`/submissions/${submissionId}/`)
}

export function addEvidence(submissionId, { textNote, file }) {
  const formData = new FormData()
  if (textNote) formData.append('text_note', textNote)
  if (file) formData.append('file', file)
  return api.post(`/submissions/${submissionId}/evidence/`, formData)
}

export function deleteEvidence(evidenceId) {
  return api.delete(`/evidence/${evidenceId}/`)
}

export function updateEvidence(evidenceId, textNote) {
  return api.patch(`/evidence/${evidenceId}/`, { text_note: textNote })
}
