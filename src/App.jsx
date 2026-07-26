import { useState, useCallback, lazy, Suspense } from 'react'
import { Dumbbell, CalendarDays, TrendingUp, Settings as SettingsIcon } from 'lucide-react'
import { WorkoutProvider } from './WorkoutContext'
import TodayWorkout from './components/TodayWorkout'
import WorkoutHistory from './components/WorkoutHistory'
import Settings from './components/Settings'
import RestTimer from './components/RestTimer'
import AuthButton from './components/AuthButton'
import ErrorBoundary from './components/ErrorBoundary'

const ProgressCharts = lazy(() => import('./components/ProgressCharts'))

const TABS = [
  { id: 'today', label: 'Today', icon: Dumbbell },
  { id: 'history', label: 'History', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  // runId increments on every start so logging two sets with the same rest
  // period still restarts the countdown — the duration alone doesn't change.
  const [timer, setTimer] = useState({ seconds: 0, runId: 0, active: false })

  const handleStartTimer = useCallback((seconds) => {
    setTimer(prev => ({ seconds, runId: prev.runId + 1, active: true }))
  }, [])

  const handleTimerDone = useCallback(() => {
    setTimer(prev => ({ ...prev, active: false, seconds: 0 }))
  }, [])

  return (
    <WorkoutProvider>
      <div className="flex flex-col min-h-dvh bg-bg">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] bg-bg border-b border-transparent" style={{ boxShadow: '0 1px 0 0 rgba(232,255,71,0.12)' }}>
          <div className="py-4">
            <h1 className="font-display text-2xl tracking-wider text-accent leading-none" style={{ textShadow: '0 0 20px rgba(232,255,71,0.4), 0 0 8px rgba(232,255,71,0.2)' }}>
              ERBER FIT
            </h1>
          </div>
          <AuthButton />
        </header>

        {/* Main content */}
        <ErrorBoundary>
        <main className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'today' && <TodayWorkout onStartTimer={handleStartTimer} />}
          {activeTab === 'history' && <WorkoutHistory />}
          {activeTab === 'progress' && (
            <Suspense fallback={<div className="p-5 text-muted font-mono text-sm">Loading...</div>}>
              <ProgressCharts />
            </Suspense>
          )}
          {activeTab === 'settings' && <Settings />}
        </main>
        </ErrorBoundary>

        {/* Rest timer floating pill */}
        {timer.active && (
          <RestTimer
            seconds={timer.seconds}
            runId={timer.runId}
            onDone={handleTimerDone}
            onSkip={handleTimerDone}
          />
        )}

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(232,255,71,0.5))' } : undefined}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[10px] font-medium tracking-wide uppercase">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </WorkoutProvider>
  )
}
