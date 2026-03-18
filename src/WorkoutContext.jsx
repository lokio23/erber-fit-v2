import { createContext, useContext } from 'react'
import useWorkoutSession from './hooks/useWorkoutSession'

const WorkoutContext = createContext(null)

export function WorkoutProvider({ children }) {
  const workout = useWorkoutSession()
  return (
    <WorkoutContext.Provider value={workout}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider')
  return ctx
}
