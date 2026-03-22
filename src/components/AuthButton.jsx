import { useWorkout } from '../WorkoutContext'
import { supabase } from '../lib/supabase'

export default function AuthButton() {
  if (!supabase) return null

  const { user, loading, signIn } = useWorkout()

  if (loading) return null

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url
    return avatarUrl ? (
      <img
        src={avatarUrl}
        alt=""
        className="w-8 h-8 rounded-full border border-accent/30"
        referrerPolicy="no-referrer"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
        <span className="text-xs font-mono text-accent">
          {user.email?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={signIn}
      className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent hover:bg-accent/20 active:opacity-70 transition-colors"
    >
      Sign In
    </button>
  )
}
