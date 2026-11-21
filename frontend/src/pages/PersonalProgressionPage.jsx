import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getBadges } from '../api/badges'
import { getSubmissions } from '../api/submissions'
import Spinner from '../components/ui/Spinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import IntroStep from '../components/progression/IntroStep'
import SetGoalsStep from '../components/progression/SetGoalsStep'
import CompleteGoalsStep from '../components/progression/CompleteGoalsStep'
import ExpeditionsStep from '../components/progression/ExpeditionsStep'
import ReviewStep from '../components/progression/ReviewStep'
import {
  PP_CATEGORY, STEP_KEYS, STEP_LABELS, getPPState, buildSubmissionMap, describeNextStep,
} from '../utils/personalProgression'
import styles from './PersonalProgressionPage.module.css'

function JourneyTrail({ state }) {
  const nodes = [
    ...(state.trailhead ? [{ level: state.trailhead, statusOnly: true }] : []),
    ...state.levels.map((level) => ({ level })),
  ]
  return (
    <ol className={styles.trail} aria-label="Personal Progression levels">
      {nodes.map(({ level, statusOnly }) => {
        const isCurrent = state.current === level
        const cls = level.complete ? styles.nodeDone : isCurrent ? styles.nodeCurrent : ''
        return (
          <li key={level.badge.id} className={`${styles.node} ${cls}`} aria-current={isCurrent ? 'step' : undefined}>
            <span className={styles.nodeIcon} aria-hidden="true">{level.complete ? '✓' : level.level}</span>
            <span className={styles.nodeName}>{level.name}</span>
            {statusOnly && !level.complete && <span className={styles.nodeNote}>Ask a Scouter</span>}
          </li>
        )
      })}
    </ol>
  )
}

function StepTracker({ level, step }) {
  const keys = STEP_KEYS.filter((k) => {
    if (k === 'set_goals') return !!level.setGoals
    if (k === 'complete_goals') return level.completedGoals.length > 0
    if (k === 'expeditions') return level.expeditions.length > 0
    return level.reviews.length > 0
  })
  const currentIdx = keys.indexOf(step)
  return (
    <ol className={styles.steps}>
      {keys.map((k, i) => {
        const cls = i < currentIdx ? styles.stepDone : i === currentIdx ? styles.stepCurrent : ''
        return (
          <li key={k} className={`${styles.stepItem} ${cls}`} aria-current={i === currentIdx ? 'step' : undefined}>
            <span className={styles.stepNum}>{i < currentIdx ? '✓' : i + 1}</span>
            <span className={styles.stepLabel}>{STEP_LABELS[k]}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Finished() {
  return (
    <div className={styles.finished}>
      <h2>You've reached the Summit!</h2>
      <p>Every level of your Personal Journey is complete. Amazing work. Be proud of how far you've come.</p>
    </div>
  )
}

export default function PersonalProgressionPage() {
  const [badges, setBadges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const topRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [badgeList, subs] = await Promise.all([getBadges(), getSubmissions()])
      setBadges(badgeList.filter((b) => b.category === PP_CATEGORY))
      setSubmissions(subs)
      setError('')
    } catch {
      setError('Failed to load your Personal Progression. Please try refreshing.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const state = useMemo(
    () => getPPState(badges, buildSubmissionMap(submissions)),
    [badges, submissions],
  )

  // When the scout moves on to a new step, bring them back to the top
  const stepKey = `${state.current?.badge.id ?? 'none'}:${state.step}`
  const prevStep = useRef(stepKey)
  useEffect(() => {
    if (prevStep.current !== stepKey && !loading) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevStep.current = stepKey
  }, [stepKey, loading])

  if (loading) return <Spinner centered />

  const next = describeNextStep(state)
  const { step, current } = state

  return (
    <div className={styles.page} ref={topRef}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Personal Progression</span>
          <h1 className={styles.heroTitle}>{current ? current.name : step === 'intro' ? 'Getting started' : 'Summit reached'}</h1>
          <p className={styles.heroNext}>
            <span className={styles.heroNextLabel}>Next:</span> {next.title}
          </p>
        </div>
        {!state.empty && <JourneyTrail state={state} />}
      </header>

      <ErrorMessage message={error} />

      {state.empty && !error && (
        <p className={styles.empty}>Personal Progression hasn't been set up yet. Check back soon.</p>
      )}

      {!state.empty && (
        <>
          {current && step !== 'finished' && <StepTracker level={current} step={step} />}

          <section className={styles.panel}>
            {step === 'intro' && <IntroStep intro={state.intro} onChanged={load} />}
            {step === 'set_goals' && <SetGoalsStep key={current.badge.id} level={current} onChanged={load} />}
            {step === 'complete_goals' && <CompleteGoalsStep key={current.badge.id} level={current} onChanged={load} />}
            {step === 'expeditions' && <ExpeditionsStep key={current.badge.id} level={current} onChanged={load} />}
            {step === 'review' && <ReviewStep key={current.badge.id} level={current} onChanged={load} />}
            {step === 'finished' && <Finished />}
          </section>
        </>
      )}

    </div>
  )
}
