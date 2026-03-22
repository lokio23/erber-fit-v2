import { createContext, useContext } from 'react'
import useWorkoutSession from './hooks/useWorkoutSession'
import useAuth from './hooks/useAuth'
import useSupabaseSync from './hooks/useSupabaseSync'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const workout = useWorkoutSession()
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { syncStatus } = useSupabaseSync(
    user,
    workout.program, workout.setProgram,
    workout.sessions, workout.setSessions,
    workout.settings, workout.setSettings,
  )

  return (
    <WorkoutContext.Provider value={{
      ...workout,
      user,
      authLoading,
      signIn,
      signOut,
      syncStatus,
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider')
  return ctx
}
