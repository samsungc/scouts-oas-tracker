import { useState } from 'react'
import { submitForReview } from '../../api/submissions'
import Button from '../ui/Button'
import ErrorMessage from '../ui/ErrorMessage'
import { PP_GOAL_CATEGORIES, matchGoalCategory } from '../../utils/personalProgression'
import { ReviewerNotes } from './shared'
import { ensureSubmission } from './actions'
import styles from './Progression.module.css'

/** Split the intro requirement text into opening paragraphs and per-category paragraphs. */
function parseIntro(text = '') {
  const paras = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean)
  const lead = []
  const byCategory = new Map()
  for (const p of paras) {
    const m = p.match(/^([^:]{3,40}):\s*(.+)$/s)
    const cat = m ? matchGoalCategory(m[1]) : null
    if (cat && !byCategory.has(cat.key)) byCategory.set(cat.key, m[2])
    else lead.push(p)
  }
  return { lead, byCategory }
}

const STAGES = [
  { title: 'Set your goals', text: 'Write one SMART goal for each of the six areas below. A Scouter approves them.' },
  { title: 'Complete some of them', text: 'Finish the required number of goals and show what you did.' },
  { title: 'Go on expeditions', text: 'Lead and take part in Venturer expeditions and linking activities.' },
  { title: 'Reflect with SPICES', text: 'Look back on what you learned, then chat with a Scouter.' },
]

export default function IntroStep({ intro, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { lead, byCategory } = parseIntro(intro.req?.description)

  async function handleStart() {
    setBusy(true)
    setError('')
    try {
      const s = await ensureSubmission(intro)
      await submitForReview(s.id)
      await onChanged()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Welcome to your Personal Journey</h2>
        <p className={styles.stepLead}>
          You'll move from Trailhead to Tree Line to Snow Line and finally the Summit.
          Every level follows the same four steps. This page will always show you what to do next.
        </p>
      </div>

      <ReviewerNotes sub={intro.sub} />

      <div className={styles.grid}>
        {STAGES.map((s, i) => (
          <div key={s.title} className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitleWrap}>
                <span className={styles.cardTitle}>{i + 1}. {s.title}</span>
                <span className={styles.cardSub}>{s.text}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lead.length > 0 && (
        <div className={`${styles.card} ${styles.introText}`}>
          {lead.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      <h3 className={styles.sectionLabel}>The six areas your goals come from</h3>
      <div className={styles.grid}>
        {PP_GOAL_CATEGORIES.map((c) => (
          <div key={c.key} className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitleWrap}>
                <span className={styles.cardTitle}>{c.label}</span>
                <span className={styles.cardSub}>{byCategory.get(c.key) ?? c.blurb}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {intro.req?.hint && (
        <div className={styles.notice}>
          <span className={styles.noticeTitle}>Good to know</span>
          {intro.req.hint}
        </div>
      )}

      <ErrorMessage message={error} />
      <div className={styles.footerActions}>
        <span className={styles.footerHint}>Goals can include things outside of Scouting, so make them personal.</span>
        <Button size="lg" onClick={handleStart} loading={busy}>
          I've read this. Let's start
        </Button>
      </div>
    </div>
  )
}
