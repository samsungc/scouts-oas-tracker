import { isApproved, isSent } from '../../utils/personalProgression'
import { ProgressRow, Waiting } from './shared'
import RequirementTask from './RequirementTask'
import styles from './Progression.module.css'

export default function ExpeditionsStep({ level, onChanged }) {
  const tasks = level.expeditions
  const approved = tasks.filter(isApproved).length
  const allSent = tasks.every(isSent)

  // Unfinished first, so the next thing to do is always at the top
  const order = { rejected: 0, draft: 1, undefined: 2, submitted: 3, approved: 4 }
  const sorted = [...tasks].sort((a, b) => order[a.sub?.status] - order[b.sub?.status])

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>{level.name} expeditions</h2>
        <p className={styles.stepLead}>
          Nice work finishing your goals! Now show what you've done on expeditions. Add a short note
          or some photos for each one and submit it. They can be done in any order.
        </p>
      </div>

      <ProgressRow done={approved} total={tasks.length} />

      {allSent && approved < tasks.length && (
        <Waiting title="Everything's submitted">
          A Scouter will review your expeditions. Then you'll write your SPICES review.
        </Waiting>
      )}

      <div className={styles.list}>
        {sorted.map((task) => (
          <RequirementTask key={task.req.id} task={task} onChanged={onChanged} />
        ))}
      </div>
    </div>
  )
}
