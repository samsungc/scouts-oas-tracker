import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './DatePicker.module.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function parseISO(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function displayFormat(str) {
  if (!str) return null
  const d = parseISO(str)
  return `${MONTHS[d.month]} ${d.day}, ${d.year}`
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', required }) {
  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  const init = value ? parseISO(value) : null
  const [viewYear, setViewYear] = useState(init?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(init?.month ?? today.getMonth())
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('days') // 'days' | 'months'
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    if (value) {
      const d = parseISO(value)
      setViewYear(d.year)
      setViewMonth(d.month)
    }
  }, [value])

  function openPicker() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPopoverPos({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    setMode('days')
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function pickDay(year, month, day) {
    onChange(toISO(year, month, day))
    setOpen(false)
  }

  function pickMonth(month) {
    setViewMonth(month)
    setMode('days')
  }

  // Build 6-week grid
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()
  const prevM = viewMonth === 0 ? 11 : viewMonth - 1
  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
  const nextM = viewMonth === 11 ? 0 : viewMonth + 1
  const nextY = viewMonth === 11 ? viewYear + 1 : viewYear

  const cells = []
  for (let i = firstWeekday - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: prevM, year: prevY, outside: true })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: viewMonth, year: viewYear, outside: false })
  let nd = 1
  while (cells.length < 42)
    cells.push({ day: nd++, month: nextM, year: nextY, outside: true })

  const selectedParsed = value ? parseISO(value) : null

  const popover = open && createPortal(
    <div
      ref={popoverRef}
      className={styles.popover}
      style={{ top: popoverPos.top, left: popoverPos.left, minWidth: Math.max(popoverPos.width, 272) }}
    >
      {mode === 'days' ? (
        <>
          <div className={styles.navRow}>
            <button type="button" className={styles.navBtn} onClick={prevMonth}>‹</button>
            <button
              type="button"
              className={styles.monthYearBtn}
              onClick={() => setMode('months')}
            >
              {MONTHS[viewMonth]} {viewYear} <span className={styles.chevron}>▾</span>
            </button>
            <button type="button" className={styles.navBtn} onClick={nextMonth}>›</button>
          </div>

          <div className={styles.dayHeaders}>
            {DAY_HEADERS.map(d => <div key={d} className={styles.dayHeader}>{d}</div>)}
          </div>

          <div className={styles.grid}>
            {cells.map((cell, i) => {
              const iso = toISO(cell.year, cell.month, cell.day)
              const isSelected = iso === value
              const isToday = iso === todayISO
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.day}
                    ${cell.outside ? styles.outside : ''}
                    ${isSelected ? styles.selected : ''}
                    ${isToday && !isSelected ? styles.today : ''}`}
                  onClick={() => pickDay(cell.year, cell.month, cell.day)}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className={styles.navRow}>
            <button type="button" className={styles.navBtn} onClick={() => setViewYear(y => y - 1)}>‹</button>
            <span className={styles.monthYear}>{viewYear}</span>
            <button type="button" className={styles.navBtn} onClick={() => setViewYear(y => y + 1)}>›</button>
          </div>

          <div className={styles.monthGrid}>
            {MONTHS_SHORT.map((label, i) => {
              const isSelected = selectedParsed?.year === viewYear && selectedParsed?.month === i
              const isCurrent = today.getFullYear() === viewYear && today.getMonth() === i
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.monthCell}
                    ${isSelected ? styles.selected : ''}
                    ${isCurrent && !isSelected ? styles.today : ''}`}
                  onClick={() => pickMonth(i)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>,
    document.body
  )

  return (
    <div className={styles.wrap}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ''}`}
        onClick={() => open ? setOpen(false) : openPicker()}
      >
        <span>{value ? displayFormat(value) : <span className={styles.placeholder}>{placeholder}</span>}</span>
        <svg className={styles.calIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
          <line x1="1.5" y1="6" x2="14.5" y2="6" />
          <line x1="5" y1="1" x2="5" y2="4" />
          <line x1="11" y1="1" x2="11" y2="4" />
        </svg>
      </button>

      {popover}

      {required && <input type="hidden" value={value ?? ''} required />}
    </div>
  )
}
