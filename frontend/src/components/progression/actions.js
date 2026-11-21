import { useState } from 'react'
import { createSubmission, addEvidence, deleteSubmission, deleteEvidence } from '../../api/submissions'

const ALLOWED_TYPES = ['image/', 'video/', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

/** Return the task's submission, creating a draft one if the scout hasn't started it. */
export async function ensureSubmission(task) {
  if (task.sub) return task.sub
  return createSubmission(task.req.id)
}

export function validateFiles(files) {
  for (const f of files) {
    if (f.size > MAX_SIZE) return `"${f.name}" is larger than 10 MB.`
    if (!ALLOWED_TYPES.some((t) => f.type.startsWith(t))) return `"${f.name}" isn't a photo, video or PDF.`
  }
  return ''
}

export async function uploadFiles(submissionId, files) {
  for (const file of files) {
    await addEvidence(submissionId, { file })
  }
}

/** Two-click confirm button: first click asks, second click runs. */
export function useConfirm() {
  const [armed, setArmed] = useState(false)
  return { armed, arm: () => setArmed(true), disarm: () => setArmed(false) }
}

/**
 * Throw away an unfinished attempt. Drafts are deleted outright; returned submissions can't be
 * deleted by scouts, so their evidence is cleared instead and the empty slot gets reused later.
 */
export async function discardAttempt(sub) {
  if (sub.status === 'draft') {
    await deleteSubmission(sub.id)
    return
  }
  for (const ev of sub.evidence ?? []) {
    await deleteEvidence(ev.id)
  }
}

/** A returned/draft attempt that has been cleared out: free to be used for a new goal. */
export function isEmptyAttempt(task) {
  const status = task.sub?.status
  return (status === 'draft' || status === 'rejected') && (task.sub.evidence ?? []).length === 0
}
