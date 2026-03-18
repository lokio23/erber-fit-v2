import { useState, useMemo } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { calcSessionVolume, formatDate, displayWeight } from '../utils/calculations'

export default function WorkoutHistory() {
  const { sessions, settings } = useWorkout()
  const [view, setView] = useState('list')
  const [expandedId, setExpandedId] = useState(null)
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
    [sessions]
  )

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <Calendar size={48} className="text-muted/30 mb-6" />
        <h2 className="font-display text-3xl text-text tracking-wider mb-3">NO HISTORY YET</h2>
        <p className="text-sm text-muted leading-relaxed max-w-xs">
          Complete your first workout to start tracking progress.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* View toggle */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-text">HISTORY</h2>
        <div className="flex bg-bg border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`p-2 transition-colors ${view === 'list' ? 'bg-accent/10 text-accent' : 'text-muted'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 transition-colors ${view === 'calendar' ? 'bg-accent/10 text-accent' : 'text-muted'}`}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="px-4 space-y-2">
          {sortedSessions.map(session => (
            <SessionRow
              key={session.id}
              session={session}
              expanded={expandedId === session.id}
              onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
              unit={settings.unit}
            />
          ))}
        </div>
      ) : (
        <CalendarView
          sessions={sessions}
          month={calMonth}
          onMonthChange={setCalMonth}
          onSelectDate={(dateStr) => {
            const s = sessions.find(s => s.date === dateStr)
            if (s) {
              setView('list')
              setExpandedId(s.id)
            }
          }}
        />
      )}
    </div>
  )
}

function SessionRow({ session, expanded, onToggle, unit }) {
  const volume = useMemo(() => calcSessionVolume(session), [session])
  const completedSets = session.exercises.reduce((t, e) => t + e.sets.length, 0)
  const totalSets = session.exercises.reduce((t, e) => t + e.targetSets, 0)
  const isComplete = completedSets >= totalSets

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-body font-semibold text-text truncate">
              {session.workoutName}
            </span>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isComplete ? 'bg-accent' : 'bg-accent-secondary'}`} />
          </div>
          <p className="text-xs font-mono text-muted mt-0.5">{formatDate(session.date)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono text-text">
            {displayWeight(volume, unit).toLocaleString()} {unit}
          </p>
          <p className="text-[10px] font-mono text-muted">{completedSets}/{totalSets} sets</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {session.exercises.map(ex => (
            <div key={ex.exerciseId}>
              <p className="text-xs font-body font-medium text-text mb-1">{ex.name}</p>
              <div className="space-y-0.5">
                {ex.sets.map((set, i) => (
                  <p key={i} className="text-[11px] font-mono text-muted pl-2">
                    Set {i + 1}: {displayWeight(set.weight, unit)} {unit} × {set.reps}
                  </p>
                ))}
                {ex.sets.length === 0 && (
                  <p className="text-[11px] font-mono text-muted/50 pl-2">No sets logged</p>
                )}
              </div>
              {ex.notes && (
                <p className="text-[10px] font-mono text-muted/60 pl-2 mt-1 italic">{ex.notes}</p>
              )}
            </div>
          ))}
          {session.startedAt && session.completedAt && (
            <p className="text-[10px] font-mono text-muted/50 pt-2 border-t border-border">
              Duration: {formatDuration(session.startedAt, session.completedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CalendarView({ sessions, month, onMonthChange, onSelectDate }) {
  const { year, month: m } = month
  const firstDay = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const monthName = new Date(year, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const sessionDates = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      const completedSets = s.exercises.reduce((t, e) => t + e.sets.length, 0)
      const totalSets = s.exercises.reduce((t, e) => t + e.targetSets, 0)
      map[s.date] = completedSets >= totalSets ? 'complete' : 'partial'
    })
    return map
  }, [sessions])

  const prevMonth = () => {
    onMonthChange(m === 0 ? { year: year - 1, month: 11 } : { year, month: m - 1 })
  }

  const nextMonth = () => {
    onMonthChange(m === 11 ? { year: year + 1, month: 0 } : { year, month: m + 1 })
  }

  return (
    <div className="px-5">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-muted hover:text-text transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-display text-lg tracking-wider text-text">{monthName.toUpperCase()}</span>
        <button onClick={nextMonth} className="p-2 text-muted hover:text-text transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-mono text-muted uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const status = sessionDates[dateStr]
          return (
            <button
              key={day}
              onClick={() => status && onSelectDate(dateStr)}
              className={`relative flex flex-col items-center py-2 rounded-lg transition-colors ${
                status ? 'hover:bg-card cursor-pointer' : 'cursor-default'
              }`}
            >
              <span className="text-xs font-mono text-text/70">{day}</span>
              {status && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  status === 'complete' ? 'bg-accent' : 'bg-accent-secondary'
                }`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-[10px] font-mono text-muted">Complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-secondary" />
          <span className="text-[10px] font-mono text-muted">Partial</span>
        </div>
      </div>
    </div>
  )
}

function formatDuration(start, end) {
  const ms = new Date(end) - new Date(start)
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hrs}h ${remainMins}m`
}
