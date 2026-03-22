import { useState } from 'react'
import { useWorkout } from '../WorkoutContext'
import { supabase } from '../lib/supabase'

export default function AuthButton() {
  const { user, loading, signIn } = useWorkout()
  const [showInput, setShowInput] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!supabase) return null
  if (loading) return null

  if (user) {
    return (
      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
        <span className="text-xs font-mono text-accent">
          {user.email?.split('@')[0] || '?'}
        </span>
      </div>
    )
  }

  if (showInput) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!pin.trim()) return
          setSubmitting(true)
          setError('')
          const result = await signIn(pin.trim())
          if (result?.error) {
            setError(result.error)
            setSubmitting(false)
          }
        }}
        className="flex items-center gap-1.5"
      >
        <input
          type="text"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          autoFocus
          className="w-16 bg-bg border border-accent/30 rounded-lg px-2 py-1 text-xs font-mono text-accent text-center focus:outline-none focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent hover:bg-accent/20 active:opacity-70 transition-colors"
        >
          {submitting ? '...' : 'Go'}
        </button>
        <button
          type="button"
          onClick={() => { setShowInput(false); setPin(''); setError('') }}
          className="px-1.5 py-1 text-xs font-mono text-muted"
        >
          ✕
        </button>
      </form>
    )
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent hover:bg-accent/20 active:opacity-70 transition-colors"
    >
      Sign In
    </button>
  )
}
