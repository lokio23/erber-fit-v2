import { useState, useCallback, lazy, Suspense } from 'react'
import { Dumbbell, CalendarDays, TrendingUp, Settings as SettingsIcon } from 'lucide-react'
import { WorkoutProvider } from './WorkoutContext'
import TodayWorkout from './components/TodayWorkout'
import WorkoutHistory from './components/WorkoutHistory'
import Settings from './components/Settings'
import RestTimer from './components/RestTimer'

const ProgressCharts = lazy(() => import('./components/ProgressCharts'))

const TABS = [
  { id: 'today', label: 'Today', icon: Dumbbell },
  { id: 'history', label: 'History', icon: CalendarDays },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const handleStartTimer = useCallback((seconds) => {
    setTimerSeconds(seconds)
    setTimerActive(true)
  }, [])

  const handleTimerDone = useCallback(() => {
    setTimerActive(false)
    setTimerSeconds(0)
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
        </header>

        {/* Main content */}
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

        {/* Rest timer floating pill */}
        {timerActive && (
          <RestTimer
            seconds={timerSeconds}
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
