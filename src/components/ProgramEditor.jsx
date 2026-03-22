import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, RotateCcw, X, Search } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { DEFAULT_PROGRAM, EXERCISE_LIBRARY } from '../data/workouts'
import { formatRepRange, formatRestTime } from '../utils/calculations'
import ConfirmDialog from './ConfirmDialog'

export default function ProgramEditor({ dayKey, onClose }) {
  const { program, setProgram } = useWorkout()
  const workout = program[dayKey]
  const [addingExercise, setAddingExercise] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const updateExercises = (newExercises) => {
    setProgram(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], exercises: newExercises },
    }))
  }

  const moveExercise = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= workout.exercises.length) return
    const ex = [...workout.exercises]
    ;[ex[index], ex[newIndex]] = [ex[newIndex], ex[index]]
    updateExercises(ex)
  }

  const removeExercise = (index) => {
    setConfirmAction({ type: 'remove', index })
  }

  const resetToDefault = () => {
    setConfirmAction({ type: 'reset' })
  }

  const addExercise = (exercise) => {
    updateExercises([...workout.exercises, exercise])
    setAddingExercise(false)
  }

  const updateExercise = (index, updates) => {
    const ex = [...workout.exercises]
    ex[index] = { ...ex[index], ...updates }
    updateExercises(ex)
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg/95 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-bg border-b border-border px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-wider text-text">EDIT WORKOUT</h2>
          <p className="text-xs font-mono text-muted mt-0.5">{workout.name}</p>
        </div>
        <button onClick={onClose} className="p-2 text-muted hover:text-text active:opacity-70 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-2 pb-32">
        {workout.exercises.map((exercise, index) => (
          <div key={`${exercise.id}-${index}`}>
            {editingIndex === index ? (
              <ExerciseEditForm
                exercise={exercise}
                onSave={(updates) => {
                  updateExercise(index, updates)
                  setEditingIndex(null)
                }}
                onCancel={() => setEditingIndex(null)}
              />
            ) : (
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-3">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveExercise(index, -1)}
                    disabled={index === 0}
                    className="p-2.5 text-muted hover:text-text disabled:opacity-20 active:opacity-70 transition-colors"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => moveExercise(index, 1)}
                    disabled={index === workout.exercises.length - 1}
                    className="p-2.5 text-muted hover:text-text disabled:opacity-20 active:opacity-70 transition-colors"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Exercise info */}
                <button
                  onClick={() => setEditingIndex(index)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-sm font-body font-medium text-text truncate">
                    {exercise.name}
                  </p>
                  <p className="text-[11px] font-mono text-muted mt-0.5">
                    {exercise.sets}×{formatRepRange(exercise.repsMin, exercise.repsMax)} · {formatRestTime(exercise.restSeconds)}
                  </p>
                </button>

                {/* Delete */}
                <button
                  onClick={() => removeExercise(index)}
                  className="p-2 text-muted hover:text-accent-secondary active:opacity-70 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add exercise button */}
        {addingExercise ? (
          <AddExercisePanel
            onAdd={addExercise}
            onCancel={() => setAddingExercise(false)}
            existingIds={workout.exercises.map(e => e.id)}
            dayKey={dayKey}
          />
        ) : (
          <button
            onClick={() => setAddingExercise(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-accent/30 text-accent text-xs font-mono uppercase tracking-wider hover:bg-accent/5 active:opacity-70 transition-colors"
          >
            <Plus size={14} /> Add Exercise
          </button>
        )}

        {/* Reset to default */}
        <button
          onClick={resetToDefault}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted text-xs font-mono uppercase tracking-wider hover:text-text hover:border-border active:opacity-70 transition-colors mt-4"
        >
          <RotateCcw size={14} /> Reset to Default
        </button>
      </div>

      {confirmAction?.type === 'remove' && (
        <ConfirmDialog
          title="Remove Exercise"
          message={`Remove "${workout.exercises[confirmAction.index].name}" from this workout?`}
          confirmLabel="Remove"
          danger
          onConfirm={() => {
            updateExercises(workout.exercises.filter((_, i) => i !== confirmAction.index))
            setConfirmAction(null)
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction?.type === 'reset' && (
        <ConfirmDialog
          title="Reset to Default"
          message="Reset this day to the default program? Your customizations will be lost."
          confirmLabel="Reset"
          danger
          onConfirm={() => {
            setProgram(prev => ({
              ...prev,
              [dayKey]: DEFAULT_PROGRAM[dayKey],
            }))
            setConfirmAction(null)
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

function ExerciseEditForm({ exercise, onSave, onCancel }) {
  const [name, setName] = useState(exercise.name)
  const [sets, setSets] = useState(String(exercise.sets))
  const [repsMin, setRepsMin] = useState(String(exercise.repsMin))
  const [repsMax, setRepsMax] = useState(String(exercise.repsMax))
  const [restSeconds, setRestSeconds] = useState(String(exercise.restSeconds))

  const handleSave = () => {
    onSave({
      name: name.trim() || exercise.name,
      sets: Number(sets) || exercise.sets,
      repsMin: Number(repsMin) || exercise.repsMin,
      repsMax: Number(repsMax) || exercise.repsMax,
      restSeconds: Number(restSeconds) || exercise.restSeconds,
    })
  }

  return (
    <div className="bg-card border border-accent/30 rounded-xl px-4 py-4 space-y-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-body text-text focus:outline-none focus:border-accent/50"
        placeholder="Exercise name"
      />
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="text-[10px] font-mono text-muted block mb-1">Sets</label>
          <input type="number" inputMode="numeric" value={sets} onChange={e => setSets(e.target.value)}
            className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted block mb-1">Min reps</label>
          <input type="number" inputMode="numeric" value={repsMin} onChange={e => setRepsMin(e.target.value)}
            className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted block mb-1">Max reps</label>
          <input type="number" inputMode="numeric" value={repsMax} onChange={e => setRepsMax(e.target.value)}
            className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted block mb-1">Rest (s)</label>
          <input type="number" inputMode="numeric" value={restSeconds} onChange={e => setRestSeconds(e.target.value)}
            className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-bg border border-border text-xs font-mono text-muted hover:text-text active:opacity-70 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent hover:bg-accent/20 active:opacity-70 transition-colors">
          Save
        </button>
      </div>
    </div>
  )
}

function AddExercisePanel({ onAdd, onCancel, existingIds, dayKey }) {
  const [search, setSearch] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customSets, setCustomSets] = useState('3')
  const [customRepsMin, setCustomRepsMin] = useState('10')
  const [customRepsMax, setCustomRepsMax] = useState('12')
  const [customRest, setCustomRest] = useState('90')

  // Filter library by muscle groups matching the current day
  const { program } = useWorkout()
  const relevantExercises = useMemo(() => {
    const dayMuscles = program[dayKey]?.muscleGroups || []
    return EXERCISE_LIBRARY.filter(ex =>
      ex.muscleGroups.some(g => dayMuscles.includes(g))
    )
  }, [dayKey, program])

  const filtered = relevantExercises
    .filter(ex => !existingIds.includes(ex.id) && ex.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.isCore ? 1 : 0) - (b.isCore ? 1 : 0))

  const handleAddCustom = () => {
    if (!customName.trim()) return
    onAdd({
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      sets: Number(customSets) || 3,
      repsMin: Number(customRepsMin) || 10,
      repsMax: Number(customRepsMax) || 12,
      restSeconds: Number(customRest) || 90,
      isBuiltIn: false,
      isCompound: false,
    })
  }

  if (customMode) {
    return (
      <div className="bg-card border border-accent/30 rounded-xl px-4 py-4 space-y-3">
        <p className="text-xs font-mono text-accent uppercase tracking-wider">Custom Exercise</p>
        <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Exercise name"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-body text-text focus:outline-none focus:border-accent/50" />
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] font-mono text-muted block mb-1">Sets</label>
            <input type="number" inputMode="numeric" value={customSets} onChange={e => setCustomSets(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted block mb-1">Min</label>
            <input type="number" inputMode="numeric" value={customRepsMin} onChange={e => setCustomRepsMin(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted block mb-1">Max</label>
            <input type="number" inputMode="numeric" value={customRepsMax} onChange={e => setCustomRepsMax(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted block mb-1">Rest</label>
            <input type="number" inputMode="numeric" value={customRest} onChange={e => setCustomRest(e.target.value)}
              className="w-full bg-bg border border-border rounded px-2 py-1.5 text-xs font-mono text-text text-center focus:outline-none focus:border-accent/50" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-bg border border-border text-xs font-mono text-muted active:opacity-70">Cancel</button>
          <button onClick={handleAddCustom} disabled={!customName.trim()} className="flex-1 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent disabled:opacity-30 active:opacity-70">Add</button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-accent/30 rounded-xl px-4 py-4 space-y-3">
      <p className="text-xs font-mono text-accent uppercase tracking-wider">Add Exercise</p>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-bg border border-border rounded-lg pl-8 pr-3 py-2 text-sm font-body text-text focus:outline-none focus:border-accent/50 placeholder:text-muted/40"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => onAdd({ ...ex })}
            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent/5 active:opacity-70 transition-colors ${ex.isCore ? 'border border-accent/20 bg-accent/5' : ''}`}
          >
            <p className={`text-xs font-body ${ex.isCore ? 'text-accent' : 'text-text'}`}>
              {ex.isCore ? '⚡ ' : ''}{ex.name}
            </p>
            <p className="text-[10px] font-mono text-muted">
              {ex.isCore ? 'CORE · ' : ''}{ex.sets}×{formatRepRange(ex.repsMin, ex.repsMax)}
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs font-mono text-muted text-center py-2">No matches</p>
        )}
      </div>
      <div className="flex gap-2 border-t border-border pt-3">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg bg-bg border border-border text-xs font-mono text-muted active:opacity-70">Cancel</button>
        <button onClick={() => setCustomMode(true)} className="flex-1 py-2 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent active:opacity-70">Custom</button>
      </div>
    </div>
  )
}
