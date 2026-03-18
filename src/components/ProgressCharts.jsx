import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Trophy, BarChart3 } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { findPR, displayWeight, formatDate } from '../utils/calculations'

export default function ProgressCharts() {
  const { sessions, program, settings } = useWorkout()
  const [activeSection, setActiveSection] = useState('exercise')
  const [selectedExercise, setSelectedExercise] = useState('')

  // Get all unique exercises ever logged
  const allExercises = useMemo(() => {
    const map = new Map()
    sessions.forEach(s => {
      s.exercises.forEach(ex => {
        if (!map.has(ex.exerciseId)) {
          map.set(ex.exerciseId, ex.name)
        }
      })
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [sessions])

  // Auto-select first exercise
  const exerciseId = selectedExercise || allExercises[0]?.id || ''

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

      {/* Section tabs */}
      <div className="px-5 flex gap-2 mb-4">
        {[
          { id: 'exercise', label: 'Exercise', icon: TrendingUp },
          { id: 'volume', label: 'Volume', icon: BarChart3 },
          { id: 'records', label: 'Records', icon: Trophy },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              activeSection === id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-card border border-border text-muted'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'exercise' && (
        <ExerciseChart
          sessions={sessions}
          exercises={allExercises}
          selectedId={exerciseId}
          onSelect={setSelectedExercise}
          unit={settings.unit}
        />
      )}
      {activeSection === 'volume' && (
        <VolumeChart sessions={sessions} program={program} unit={settings.unit} />
      )}
      {activeSection === 'records' && (
        <PersonalRecords sessions={sessions} exercises={allExercises} unit={settings.unit} />
      )}
    </div>
  )
}

function ExerciseChart({ sessions, exercises, selectedId, onSelect, unit }) {
  const chartData = useMemo(() => {
    return sessions
      .filter(s => s.exercises.some(e => e.exerciseId === selectedId))
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === selectedId)
        const bestSet = ex.sets.reduce((best, set) => {
          if (!set.completed) return best
          return (!best || set.weight > best.weight) ? set : best
        }, null)
        return bestSet ? {
          date: formatDate(s.date),
          weight: displayWeight(bestSet.weight, unit),
          reps: bestSet.reps,
        } : null
      })
      .filter(Boolean)
  }, [sessions, selectedId, unit])

  return (
    <div className="px-4">
      {/* Exercise selector */}
      <select
        value={selectedId}
        onChange={e => onSelect(e.target.value)}
        className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm font-body text-text mb-4 focus:outline-none focus:border-accent/30 appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b6e72\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name}</option>
        ))}
      </select>

      {chartData.length > 1 ? (
        <div className="bg-card border border-border rounded-xl p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222527" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }}
                stroke="#222527"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }}
                stroke="#222527"
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161819',
                  border: '1px solid #222527',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'DM Mono',
                }}
                labelStyle={{ color: '#e2e2e2' }}
                itemStyle={{ color: '#e8ff47' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#e8ff47"
                strokeWidth={2}
                dot={{ fill: '#e8ff47', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-xs font-mono text-muted">
            Need at least 2 sessions to show a chart.
          </p>
        </div>
      )}
    </div>
  )
}

function VolumeChart({ sessions, program, unit }) {
  const weeklyData = useMemo(() => {
    const weeks = new Map()
    sessions.forEach(s => {
      const d = new Date(s.date + 'T12:00:00')
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeks.has(weekKey)) weeks.set(weekKey, { week: formatDate(weekKey), total: 0 })
      const entry = weeks.get(weekKey)

      s.exercises.forEach(ex => {
        ex.sets.filter(set => set.completed).forEach(set => {
          entry.total += displayWeight(set.weight * set.reps, unit)
        })
      })
    })

    return Array.from(weeks.values()).slice(-8)
  }, [sessions, unit])

  return (
    <div className="px-4">
      {weeklyData.length > 0 ? (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">
            Weekly Total Volume ({unit})
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222527" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }}
                stroke="#222527"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b6e72', fontFamily: 'DM Mono' }}
                stroke="#222527"
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161819',
                  border: '1px solid #222527',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'DM Mono',
                }}
                labelStyle={{ color: '#e2e2e2' }}
                itemStyle={{ color: '#e8ff47' }}
              />
              <Bar dataKey="total" fill="#e8ff47" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-xs font-mono text-muted">No volume data yet.</p>
        </div>
      )}
    </div>
  )
}

function PersonalRecords({ sessions, exercises, unit }) {
  const records = useMemo(() => {
    return exercises
      .map(ex => {
        const pr = findPR(sessions, ex.id)
        return pr ? { ...ex, ...pr } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.weight - a.weight)
  }, [sessions, exercises])

  return (
    <div className="px-4">
      {records.length > 0 ? (
        <div className="space-y-1.5">
          {records.map(rec => (
            <div
              key={rec.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
            >
              <Trophy size={14} className="text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium text-text truncate">{rec.name}</p>
                <p className="text-[10px] font-mono text-muted mt-0.5">{formatDate(rec.date)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono font-medium text-accent">
                  {displayWeight(rec.weight, unit)} {unit}
                </p>
                <p className="text-[10px] font-mono text-muted">{rec.reps} reps</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-xs font-mono text-muted">No personal records yet.</p>
        </div>
      )}
    </div>
  )
}
