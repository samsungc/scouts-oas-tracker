/**
 * Personal Progression (PP) pipeline helpers.
 *
 * PP is stored as ordinary badges (category "personal_progression") with a `level`:
 *   0 = Intro, 1 = Trailhead, 2 = Tree Line, 3 = Snow Line, 4 = Summit.
 * Requirements inside a goal level are classified by title so the backend and the
 * existing submissions stay exactly as they are. The number of goals a scout must
 * complete is the number of "Completed Goal" requirements on that level, so adding
 * more of those requirements later is picked up automatically.
 */

export const PP_CATEGORY = 'personal_progression'

export const PP_GOAL_CATEGORIES = [
  { key: 'outdoor', label: 'Outdoor & Environment', match: ['outdoor', 'environment'],
    blurb: 'Explore, hike, camp, paddle and learn skills to live in and care for the natural world.' },
  { key: 'creative', label: 'Creative Expression', match: ['creative', 'creativity'],
    blurb: 'Share your own creativity — music, drama, dance, writing, art, photography and more.' },
  { key: 'citizenship', label: 'Citizenship', match: ['citizen'],
    blurb: 'Be a good citizen in your community, Canada and the world through service and learning.' },
  { key: 'active', label: 'Active & Healthy Living', match: ['active', 'healthy', 'health'],
    blurb: 'Keep active and build good mental and physical habits for happy, healthy living.' },
  { key: 'leadership', label: 'Leadership', match: ['leader'],
    blurb: 'Practice leading — organize expeditions, run activities, lead other Sections.' },
  { key: 'beliefs', label: 'Beliefs & Values', match: ['belief', 'value', 'faith', 'spiritual'],
    blurb: 'Explore your personal values and the cultures and faiths that make up your community.' },
]

export const SMART_FIELDS = [
  { key: 's', letter: 'S', label: 'Specific', prompt: 'What am I going to do? Why is this important to me?' },
  { key: 'm', letter: 'M', label: 'Measurable', prompt: 'How will I measure my success? How will I know when I have achieved my goal?' },
  { key: 'a', letter: 'A', label: 'Attainable', prompt: 'What will I do to achieve this goal? How will I accomplish this goal?' },
  { key: 'r', letter: 'R', label: 'Relevant', prompt: 'Is this goal worthwhile? How will achieving it help me? Does this goal fit my values?' },
  { key: 't', letter: 'T', label: 'Time-Bound', prompt: 'When will I accomplish my goal? How long will I give myself?' },
]

export const SPICES_FIELDS = [
  { key: 'social', letter: 'S', label: 'Social', prompt: 'What have you learned about working with others and being part of a team through your time in Venturers?' },
  { key: 'physical', letter: 'P', label: 'Physical', prompt: 'What have you learned about physical activity, your health, or taking care of your body through Venturers?' },
  { key: 'intellectual', letter: 'I', label: 'Intellectual', prompt: 'What new skills, knowledge, or ways of thinking have you developed through Venturers?' },
  { key: 'character', letter: 'C', label: 'Character', prompt: 'How has Venturers shaped your values, sense of responsibility, or who you are as a person?' },
  { key: 'emotional', letter: 'E', label: 'Emotional', prompt: 'What emotional growth have you experienced through your time in Venturers? How have you learned to handle your feelings or support others?' },
  { key: 'spiritual', letter: 'S', label: 'Spiritual', prompt: "How has Venturers connected you to something larger — whether that's nature, your community, your beliefs, or a sense of purpose?" },
]

export const STEP_KEYS = ['set_goals', 'complete_goals', 'expeditions', 'review']

export const STEP_LABELS = {
  set_goals: 'Set goals',
  complete_goals: 'Complete goals',
  expeditions: 'Expeditions',
  review: 'SPICES review',
}

// ── Requirement classification ─────────────────────────────────────────────

export function classifyRequirement(title = '') {
  if (/completed\s*goal/i.test(title)) return 'completed_goal'
  if (/^set\b.*goals?/i.test(title)) return 'set_goals'
  if (/expedition/i.test(title)) return 'expedition'
  if (/review/i.test(title)) return 'review'
  return 'other'
}

// ── Evidence JSON helpers (shape shared with EvidenceForm / EvidenceList) ───

function parseTyped(text, type) {
  if (!text || text[0] !== '{') return null
  try {
    const data = JSON.parse(text)
    return data && data.__type === type ? data : null
  } catch {
    return null
  }
}

export const parseSmartGoal = (text) => parseTyped(text, 'smart_goal')
export const parseSpicesReview = (text) => parseTyped(text, 'spices_review')
export const parseCompletedGoal = (text) => parseTyped(text, 'completed_goal')

export function serializeSmartGoal(goal) {
  const { category = '', s = '', m = '', a = '', r = '', t = '', goal: statement = '' } = goal
  return JSON.stringify({ __type: 'smart_goal', category, s, m, a, r, t, goal: statement })
}

export function serializeSpicesReview(review) {
  const out = { __type: 'spices_review' }
  for (const f of SPICES_FIELDS) out[f.key] = review[f.key] ?? ''
  out.reflection = review.reflection ?? ''
  return JSON.stringify(out)
}

export function serializeCompletedGoal({ category = '', goal = '', details = '' }) {
  return JSON.stringify({ __type: 'completed_goal', category, goal, details })
}

/** Map a free-text category (older submissions typed it by hand) to one of the six categories. */
export function matchGoalCategory(text = '') {
  const norm = text.toLowerCase()
  if (!norm.trim()) return null
  return PP_GOAL_CATEGORIES.find((c) => c.match.some((m) => norm.includes(m))) ?? null
}

/**
 * Place each SMART-goal evidence item on a "Set Goals" submission into its category slot.
 * Anything that doesn't fit (older plain-text notes, duplicates, files) ends up in `leftovers`.
 */
export function slotGoals(evidence = []) {
  const slots = PP_GOAL_CATEGORIES.map((cat) => ({ cat, ev: null, data: null }))
  const leftovers = []
  for (const ev of evidence) {
    const data = parseSmartGoal(ev.text_note)
    const cat = data ? matchGoalCategory(data.category) : null
    const slot = cat && slots.find((s) => s.cat === cat && !s.ev)
    if (slot) {
      slot.ev = ev
      slot.data = data
    } else {
      leftovers.push(ev)
    }
  }
  return { slots, leftovers }
}

/** Two goal records refer to the same goal when the statement matches (or, failing that, the category). */
export function sameGoal(a, b) {
  if (!a || !b) return false
  const sa = (a.goal || '').trim().toLowerCase()
  const sb = (b.goal || '').trim().toLowerCase()
  if (sa && sb) return sa === sb
  const ca = matchGoalCategory(a.category)
  const cb = matchGoalCategory(b.category)
  return !!ca && ca === cb
}

// ── Submissions ─────────────────────────────────────────────────────────────

function statusPriority(status) {
  return { approved: 3, submitted: 2, rejected: 1, draft: 0 }[status] ?? 0
}

/** requirementId → best submission (same rule as the Badges page). */
export function buildSubmissionMap(submissions = []) {
  const map = new Map()
  for (const sub of submissions) {
    const existing = map.get(sub.requirement)
    if (!existing || statusPriority(sub.status) > statusPriority(existing.status)) {
      map.set(sub.requirement, sub)
    }
  }
  return map
}

const isApproved = (task) => task.sub?.status === 'approved'
const isSent = (task) => task.sub?.status === 'submitted' || task.sub?.status === 'approved'

// ── State derivation ────────────────────────────────────────────────────────

function buildLevel(badge, submissionsMap) {
  const reqs = badge.requirements ?? []
  const tasks = reqs.map((req) => ({ req, sub: submissionsMap.get(req.id) ?? null, kind: classifyRequirement(req.title) }))
  const of = (kind) => tasks.filter((t) => t.kind === kind)

  const level = {
    badge,
    name: badge.name,
    level: badge.level,
    setGoals: of('set_goals')[0] ?? null,
    completedGoals: of('completed_goal'),
    // Expeditions plus anything we can't classify, so nothing is ever hidden.
    expeditions: [...of('expedition'), ...of('other'), ...of('set_goals').slice(1)],
    reviews: of('review'),
    tasks,
  }
  level.complete = tasks.length > 0 && tasks.every(isApproved)
  level.started = tasks.some((t) => t.sub)
  return level
}

function currentStepFor(level) {
  if (level.setGoals && !isApproved(level.setGoals)) return 'set_goals'
  if (!level.completedGoals.every(isApproved)) return 'complete_goals'
  if (!level.expeditions.every(isApproved)) return 'expeditions'
  if (!level.reviews.every(isApproved)) return 'review'
  return null
}

/**
 * Work out where a scout is in Personal Progression.
 * @param badges all PP badges (with requirements) — other categories are ignored
 * @param submissionsMap Map requirementId → submission
 */
export function getPPState(badges = [], submissionsMap = new Map()) {
  const pp = badges
    .filter((b) => b.category === PP_CATEGORY && b.is_active !== false)
    .sort((a, b) => (a.level ?? 99) - (b.level ?? 99))

  const introBadge = pp.find((b) => b.level === 0) ?? null
  const introReq = introBadge?.requirements?.[0] ?? null
  const intro = introBadge
    ? { badge: introBadge, req: introReq, sub: introReq ? submissionsMap.get(introReq.id) ?? null : null }
    : null
  // Reading the intro is a formality — the scout moves on as soon as they've sent it.
  if (intro) intro.done = !introReq || isSent(intro)

  const trailheadBadge = pp.find((b) => b.level === 1) ?? null
  const trailhead = trailheadBadge ? buildLevel(trailheadBadge, submissionsMap) : null

  const levels = pp.filter((b) => (b.level ?? 0) >= 2).map((b) => buildLevel(b, submissionsMap))

  let step = 'finished'
  let current = null
  if (intro && !intro.done) {
    step = 'intro'
  } else {
    current = levels.find((l) => !l.complete) ?? null
    if (current) step = currentStepFor(current) ?? 'finished'
  }

  const started = !!intro?.sub || levels.some((l) => l.started)

  return { intro, trailhead, levels, current, step, started, empty: pp.length === 0 }
}

/** Short "what's next" text for the Badges page banner and the page header. */
export function describeNextStep(state) {
  const { step, current } = state
  const name = current?.name ?? ''
  const count = (tasks) => `${tasks.filter(isApproved).length} / ${tasks.length} approved`

  switch (step) {
    case 'intro':
      return { title: 'Learn how Personal Progression works', detail: 'Start here — it only takes a few minutes.' }
    case 'set_goals': {
      const status = current.setGoals?.sub?.status
      if (status === 'submitted') return { title: `Waiting for a Scouter to approve your ${name} goals`, detail: 'You can review what you submitted.', waiting: true }
      if (status === 'rejected') return { title: `Your ${name} goals were returned`, detail: "Read the Scouter's comments and update your goals.", attention: true }
      return { title: `Set your ${name} goals`, detail: 'One SMART goal for each of the six areas.' }
    }
    case 'complete_goals': {
      const waiting = current.completedGoals.every(isSent)
      return {
        title: waiting ? `Waiting for a Scouter to review your ${name} goals` : `Complete your ${name} goals`,
        detail: count(current.completedGoals),
        waiting,
        attention: current.completedGoals.some((t) => t.sub?.status === 'rejected' && (t.sub.evidence ?? []).length > 0),
      }
    }
    case 'expeditions': {
      const waiting = current.expeditions.every(isSent)
      return {
        title: waiting ? `Waiting for a Scouter to review your ${name} expeditions` : `${name} expeditions`,
        detail: count(current.expeditions),
        waiting,
        attention: current.expeditions.some((t) => t.sub?.status === 'rejected'),
      }
    }
    case 'review': {
      const waiting = current.reviews.every(isSent)
      return {
        title: waiting ? `Waiting for a Scouter to review your ${name} SPICES review` : `Write your ${name} SPICES review`,
        detail: waiting ? 'Almost there!' : 'Reflect on what you have learned, then chat with a Scouter.',
        waiting,
        attention: current.reviews.some((t) => t.sub?.status === 'rejected'),
      }
    }
    default:
      return { title: 'You have reached the Summit!', detail: 'Every Personal Progression level is complete.' }
  }
}

export { isApproved, isSent }
