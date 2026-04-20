import { useState, useEffect, useRef } from 'react'
import { getActivityFeed } from '../../api/leaderboard'
import styles from './LiveFeed.module.css'

function formatTimeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const STATUS_LABELS = {
  submitted: 'submitted',
  approved: 'approved',
  rejected: 'returned',
}

export default function LiveFeed() {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const listRef = useRef(null)
  const sectionRef = useRef(null)

  async function load() {
    try {
      const data = await getActivityFeed()
      setFeed(data.feed)
    } catch {
      // silently fail — feed is supplementary
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    setShowBottom(el.scrollHeight > el.clientHeight)
  }, [feed])

  useEffect(() => {
    if (!expanded || !sectionRef.current) return
    // wait for the max-height CSS transition (0.3s) to finish before scrolling
    const id = setTimeout(() => {
      const rect = sectionRef.current?.getBoundingClientRect()
      if (!rect) return
      const extra = 24
      const overlap = rect.bottom + extra - window.innerHeight
      if (overlap > 0) window.scrollBy({ top: overlap, behavior: 'smooth' })
    }, 320)
    return () => clearTimeout(id)
  }, [expanded])

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    setShowTop(el.scrollTop > 4)
    setShowBottom(el.scrollTop < el.scrollHeight - el.clientHeight - 4)
    // auto-expand once user scrolls past ~5 rows, collapse when back at top
    if (el.scrollTop > 200) setExpanded(true)
    else if (el.scrollTop < 8) setExpanded(false)
  }

  if (loading && feed.length === 0) return null

  return (
    <div className={styles.section} ref={sectionRef}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {feed.length === 0 ? (
        <p className={styles.empty}>No recent activity.</p>
      ) : (
        <div className={styles.listWrap}>
          {showTop && <div className={styles.fadeTop} />}
          <div
            className={styles.list}
            ref={listRef}
            onScroll={handleScroll}
            style={{ maxHeight: expanded ? '456px' : '228px' }}
          >
            {feed.map((item) => (
              <div key={item.id} className={styles.row}>
                <span className={`${styles.pill} ${styles[item.status]}`}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
                <span className={styles.info}>
                  <span className={styles.scout}>{item.scout_name}</span>
                  <span className={styles.separator}>·</span>
                  <span className={styles.badge}>{item.badge_name}</span>
                  <span className={styles.separator}>›</span>
                  <span className={styles.req}>{item.requirement_title}</span>
                </span>
                <span className={styles.time}>{formatTimeAgo(item.event_time)}</span>
              </div>
            ))}
          </div>
          {showBottom && <div className={styles.fadeBottom} />}
        </div>
      )}
    </div>
  )
}
