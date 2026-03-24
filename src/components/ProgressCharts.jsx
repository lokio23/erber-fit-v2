import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Trophy, Flame, Dumbbell, Target } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { EXERCISE_LIBRARY } from '../data/workouts'
import {
  findPR, displayWeight, formatDate, calcEstimated1RM,
  calcSetsPerMuscleGroup, calcWeeklyTotalSets, calcWorkoutsThisWeek,
  calcStreak, daysSince, countCompletedSets,
} from '../utils/calculations'

const TOOLTIP_STYLE = {
  backgroundColor: '#161819',
  border: '1px solid #222527',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'DM Mono',
}

const MUSCLE_GROUP_ORDER = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Rear Delts', 'Calves']

export default function ProgressCharts() {
  const { sessions, program, settings } = useWorkout()

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <TrendingUp size={48} className="text-muted/30 mb-6" />
        <h2 className="font-display text-3xl text-text tracking-wider mb-3">NO DATA YET</h2>
        <p className="text-sm text-muted leading-relaxed max-w-xs">
          Log some workouts to see your progress charts and personal records.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-2xl tracking-wider text-text">PROGRESS</h2>
      </div>

      <div className="px-4 space-y-4">
        <WeeklySummary sessions={sessions} />
        <MuscleGroupVolume sessions={sessions} />
        <MuscleGroupTracker sessions={sessions} />
        <StrengthTrends sessions={sessions} unit={settings.unit} />
        <WeeklySetsTrend sessions={sessions} />
        <PersonalRecords sessions={sessions} unit={settings.unit} />
      </div>
    </div>
  )
}

function WeeklySummary({ sessions }) {
  const workouts = calcWorkoutsThisWeek(sessions)
  const totalSets = calcWeeklyTotalSets(sessions, 0)
  const streak = calcStreak(sessions)

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">This Week</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-mono font-medium text-accent">{workouts}</p>
          <p className="text-[10px] font-mono text-muted mt-0.5">Workouts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-medium text-text">{totalSets}</p>
          <p className="text-[10px] font-mono text-muted mt-0.5">Total Sets</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame size={16} className={streak > 0 ? 'text-accent-secondary' : 'text-muted/30'} />
            <p className="text-2xl font-mono font-medium text-text">{streak}</p>
          </div>
          <p className="text-[10px] font-mono text-muted mt-0.5">Week Streak</p>
        </div>
      </div>
    </div>
  )
}

function MuscleGroupVolume({ sessions }) {
  const muscleData = useMemo(() => {
    const setsMap = calcSetsPerMuscleGroup(sessions, EXERCISE_LIBRARY, 0)
    return MUSCLE_GROUP_ORDER.map(muscle => ({
      muscle,
      sets: setsMap[muscle] || 0,
    })).filter(d => d.sets > 0 || MUSCLE_GROUP_ORDER.indexOf(d.muscle) < 6) // Always show top 6
  }, [sessions])

  const getBarColor = (sets) => {
    if (sets === 0) return '#222527'
    if (sets < 10) return '#ef4444' // red — below MEV
    if (sets <= 20) return '#e8ff47' // accent green — optimal
    return '#ff6b35' // orange — approaching MRV
  }

  const getZoneLabel = (sets) => {
    if (sets === 0) return ''
    if (sets < 10) return 'Low'
    if (sets <= 20) return 'Optimal'
    return 'High'
  }

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Sets Per Muscle Group</p>
        <p className="text-[10px] font-mono text-muted">This Week</p>
      </div>
      <div className="space-y-2">
        {muscleData.map(({ muscle, sets }) => (
          <div key={muscle} className="flex items-center gap-2">
            <p className="text-[10px] font-mono text-muted w-20 text-right shrink-0">{muscle}</p>
            <div className="flex-1 h-5 bg-bg rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((sets / 25) * 100, 100)}%`,
                  backgroundColor: getBarColor(sets),
                  minWidth: sets > 0 ? '8px' : '0',
                }}
              />
              {/* 10-set and 20-set reference lines */}
              <div className="absolute top-0 bottom-0 left-[40%] w-px bg-muted/20" />
              <div className="absolute top-0 bottom-0 left-[80%] w-px bg-muted/20" />
            </div>
            <p className={`text-xs font-mono w-8 text-right shrink-0 ${
              sets === 0 ? 'text-muted/30' : sets < 10 ? 'text-red-400' : sets <= 20 ? 'text-accent' : 'text-accent-secondary'
            }`}>
              {sets}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] font-mono text-muted">&lt;10 Low</span></span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /><span className="text-[9px] font-mono text-muted">10-20 Optimal</span></span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-secondary" /><span className="text-[9px] font-mono text-muted">&gt;20 High</span></span>
      </div>
    </div>
  )
}

function MuscleGroupTracker({ sessions }) {
  const weekLabels = useMemo(() => {
    return [0, 1, 2, 3].map(w => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() - w * 7)
      return w === 0 ? 'This Wk' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  }, [])

  const weeklyData = useMemo(() => {
    return MUSCLE_GROUP_ORDER.map(muscle => {
      const weeks = [0, 1, 2, 3].map(w => {
        const setsMap = calcSetsPerMuscleGroup(sessions, EXERCISE_LIBRARY, w)
        return setsMap[muscle] || 0
      })
      return { muscle, weeks }
    })
  }, [sessions])

  const getStatusBadge = (sets) => {
    if (sets === 0) return { label: '—', color: 'text-muted/30', bg: '' }
    if (sets < 10) return { label: 'Low', color: 'text-red-400', bg: 'bg-red-400/10' }
    if (sets <= 20) return { label: 'Good', color: 'text-accent', bg: 'bg-accent/10' }
    return { label: 'High', color: 'text-accent-secondary', bg: 'bg-accent-secondary/10' }
  }

  const getCellColor = (sets) => {
    if (sets === 0) return 'text-muted/20'
    if (sets < 10) return 'text-red-400'
    if (sets <= 20) return 'text-accent'
    return 'text-accent-secondary'
  }

  const getCellBg = (sets) => {
    if (sets === 0) return ''
    if (sets < 10) return 'bg-red-400/5'
    if (sets <= 20) return 'bg-accent/5'
    return 'bg-accent-secondary/5'
  }

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Muscle Group Tracker</p>
        <p className="text-[10px] font-mono text-muted">4-Week View</p>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-1 mb-1.5">
        <div className="w-[72px] shrink-0" />
        {weekLabels.map((label, i) => (
          <div key={i} className={`flex-1 text-center text-[8px] font-mono uppercase tracking-wider ${i === 0 ? 'text-accent' : 'text-muted/50'}`}>
            {label}
          </div>
        ))}
        <div className="w-12 shrink-0 text-center text-[8px] font-mono text-muted/50 uppercase">Status</div>
      </div>

      {/* Muscle group rows */}
      <div className="space-y-0.5">
        {weeklyData.map(({ muscle, weeks }) => {
          const status = getStatusBadge(weeks[0])
          return (
            <div key={muscle} className="flex items-center gap-1">
              <p className="text-[10px] font-mono text-muted w-[72px] text-right shrink-0 truncate">{muscle}</p>
              {weeks.map((sets, i) => (
                <div key={i} className={`flex-1 text-center py-1 rounded ${getCellBg(sets)}`}>
                  <span className={`text-xs font-mono font-medium ${getCellColor(sets)}`}>{sets || '·'}</span>
                </div>
              ))}
              <div className={`w-12 shrink-0 text-center py-0.5 rounded-full text-[8px] font-mono ${status.color} ${status.bg}`}>
                {status.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] font-mono text-muted">&lt;10 Under MEV</span></span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /><span className="text-[9px] font-mono text-muted">10-20 Optimal</span></span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-secondary" /><span className="text-[9px] font-mono text-muted">&gt;20 Near MRV</span></span>
      </div>
    </div>
  )
}

function StrengthTrends({ sessions, unit }) {
  const [selectedExercise, setSelectedExercise] = useState('')

  const allExercises = useMemo(() => {
    const map = new Map()
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        if (!map.has(ex.exerciseId)) map.set(ex.exerciseId, ex.name)
      })
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [sessions])

  const exerciseId = selectedExercise || allExercises[0]?.id || ''

  const chartData = useMemo(() => {
    return sessions
      .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === exerciseId)
        const bestSet = ex.sets.reduce((best, set) => {
          if (!set.completed) return best
          const e1rm = calcEstimated1RM(set.weight, set.reps)
          return (!best || e1rm > best.e1rm) ? { ...set, e1rm } : best
        }, null)
        return bestSet ? {
          date: formatDate(s.date),
          e1rm: Math.round(displayWeight(bestSet.e1rm, unit)),
          weight: displayWeight(bestSet.weight, unit),
          reps: bestSet.reps,
          rpe: bestSet.rpe || null,
        } : null
      })
      .filter(Boolean)
  }, [sessions, exerciseId, unit])

  // Trend indicator: compare avg of last 2 vs previous 2
  const trend = useMemo(() => {
    if (chartData.length < 4) return 'neutral'
    const recent = chartData.slice(-2).reduce((s, d) => s + d.e1rm, 0) / 2
    const prior = chartData.slice(-4, -2).reduce((s, d) => s + d.e1rm, 0) / 2
    if (recent > prior * 1.02) return 'up'
    if (recent < prior * 0.98) return 'down'
    return 'neutral'
  }, [chartData])

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Strength Trend</p>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp size={14} className="text-accent" />}
          {trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
          {trend === 'neutral' && <Minus size={14} className="text-muted" />}
          <span className={`text-[10px] font-mono ${trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-red-400' : 'text-muted'}`}>
            {trend === 'up' ? 'Gaining' : trend === 'down' ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>

      <select
        value={exerciseId}
        onChange={e => setSelectedExercise(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-body text-text mb-3 focus:outline-none focus:border-accent/30 appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b6e72\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {allExercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>

      {chartData.length > 1 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222527" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6b6e72', fontFamily: 'DM Mono' }} stroke="#222527" />
            <YAxis tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }} stroke="#222527" width={40} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e2e2e2' }} formatter={(val, name, props) => {
              const rpe = props.payload?.rpe
              return [`${val} ${unit}${rpe ? ` (RPE ${rpe})` : ''}`, 'Est. 1RM']
            }} />
            <Line type="monotone" dataKey="e1rm" stroke="#e8ff47" strokeWidth={2} dot={{ fill: '#e8ff47', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs font-mono text-muted text-center py-6">Need 2+ sessions to show trend.</p>
      )}
      <p className="text-[9px] font-mono text-muted/50 text-center mt-1">Estimated 1RM ({unit}) — Epley formula</p>
    </div>
  )
}

function WeeklySetsTrend({ sessions }) {
  const weeklyData = useMemo(() => {
    const data = []
    for (let w = 7; w >= 0; w--) {
      const sets = calcWeeklyTotalSets(sessions, w)
      const weekDate = new Date()
      weekDate.setDate(weekDate.getDate() - weekDate.getDay() - w * 7)
      data.push({
        week: weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sets,
      })
    }
    return data
  }, [sessions])

  const hasData = weeklyData.some(d => d.sets > 0)

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">Weekly Total Sets (8 Weeks)</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222527" />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#6b6e72', fontFamily: 'DM Mono' }} stroke="#222527" />
            <YAxis tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }} stroke="#222527" width={30} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e2e2e2' }} formatter={(val) => [val, 'Sets']} />
            <Bar dataKey="sets" fill="#e8ff47" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs font-mono text-muted text-center py-6">No data yet.</p>
      )}
    </div>
  )
}

function PersonalRecords({ sessions, unit }) {
  const allExercises = useMemo(() => {
    const map = new Map()
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        if (!map.has(ex.exerciseId)) map.set(ex.exerciseId, ex.name)
      })
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [sessions])

  const records = useMemo(() => {
    return allExercises
      .map(ex => {
        const pr = findPR(sessions, ex.id)
        if (!pr) return null
        const e1rm = calcEstimated1RM(pr.weight, pr.reps)
        const days = daysSince(pr.date)
        return { ...ex, ...pr, e1rm, days }
      })
      .filter(Boolean)
      .sort((a, b) => b.e1rm - a.e1rm)
  }, [sessions, allExercises])

  const getDaysColor = (days) => {
    if (days <= 30) return 'text-accent'
    if (days <= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDaysBg = (days) => {
    if (days <= 30) return 'border-accent/20'
    if (days <= 60) return 'border-yellow-400/20'
    return 'border-red-400/20'
  }

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Personal Records</p>
        <p className="text-[10px] font-mono text-muted">Sorted by Est. 1RM</p>
      </div>
      {records.length > 0 ? (
        <div className="space-y-1.5">
          {records.map(rec => (
            <div
              key={rec.id}
              className={`flex items-center gap-3 bg-bg border rounded-lg px-3 py-2.5 ${getDaysBg(rec.days)}`}
            >
              <Trophy size={13} className={getDaysColor(rec.days) + ' shrink-0'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium text-text truncate">{rec.name}</p>
                <p className="text-[10px] font-mono text-muted mt-0.5">
                  {rec.weight === 0 ? 'BW' : `${displayWeight(rec.weight, unit)} ${unit}`} × {rec.reps} reps
                  {rec.rpe && <span className="text-accent-secondary/70 ml-1">@ RPE {rec.rpe}</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono font-medium text-accent">
                  {Math.round(displayWeight(rec.e1rm, unit))}
                </p>
                <p className="text-[9px] font-mono text-muted">est. 1RM</p>
              </div>
              <div className={`text-right shrink-0 ${getDaysColor(rec.days)}`}>
                <p className="text-[10px] font-mono">{rec.days}d</p>
                <p className="text-[9px] font-mono text-muted">ago</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs font-mono text-muted text-center py-6">No records yet.</p>
      )}
    </div>
  )
}
