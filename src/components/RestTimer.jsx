import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Minus, Timer } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'

export default function RestTimer({ seconds, onDone, onSkip }) {
  const { settings } = useWorkout()
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [expanded, setExpanded] = useState(true)
  const intervalRef = useRef(null)
  const audioCtxRef = useRef(null)
  const endTimeRef = useRef(Date.now() + seconds * 1000)

  useEffect(() => {
    endTimeRef.current = Date.now() + seconds * 1000

    const tick = () => {
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000)
      setTimeLeft(remaining <= 0 ? 0 : remaining)
    }

    intervalRef.current = setInterval(tick, 1000)

    const handleVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [seconds])

  useEffect(() => {
    if (timeLeft !== 0) return
    // Vibrate
    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
    // Beep
    if (settings.soundEnabled) {
      try {
        const ctx = audioCtxRef.current || new AudioContext()
        audioCtxRef.current = ctx
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.value = 0.3
        osc.start()
        osc.stop(ctx.currentTime + 0.2)
        setTimeout(() => {
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.connect(gain2)
          gain2.connect(ctx.destination)
          osc2.frequency.value = 1100
          gain2.gain.value = 0.3
          osc2.start()
          osc2.stop(ctx.currentTime + 0.3)
        }, 250)
      } catch {}
    }
    const doneTimer = setTimeout(onDone, 1500)
    return () => clearTimeout(doneTimer)
  }, [timeLeft, onDone, settings])

  const extend = useCallback((amt) => {
    endTimeRef.current += amt * 1000
    setTimeLeft(prev => Math.max(0, prev + amt))
  }, [])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const progressPct = seconds > 0 ? ((seconds - timeLeft) / seconds) * 100 : 0

  // Floating pill (minimized)
  if (!expanded) {
    return (
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-4 pb-2">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-between bg-card border border-transparent rounded-full px-4 py-2.5 shadow-lg shadow-black/50"
          style={{ borderColor: 'rgba(232,255,71,0.4)', boxShadow: '0 0 12px rgba(232,255,71,0.15), 0 4px 8px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-accent" />
            <span className="text-sm font-mono text-accent">
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted uppercase">Rest</span>
        </button>
      </div>
    )
  }

  // Expanded timer
  return (
    <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-4 pb-2">
      <div className="bg-card border border-transparent rounded-2xl px-5 py-4 shadow-xl shadow-black/60" style={{ background: 'linear-gradient(to bottom, #1c1e1f, #161819)', borderColor: 'rgba(232,255,71,0.18)', boxShadow: '0 0 0 1px rgba(232,255,71,0.06), 0 20px 40px rgba(0,0,0,0.7), 0 0 30px rgba(232,255,71,0.06)' }}>
        {/* Progress bar */}
        <div className="h-0.5 bg-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-accent rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, rgba(232,255,71,0.7), #e8ff47)', boxShadow: '0 0 6px rgba(232,255,71,0.5)' }}
          />
        </div>

        {/* Timer display */}
        <div className="text-center">
          <p className="font-display text-6xl text-accent tracking-wider leading-none" style={{ textShadow: timeLeft <= 10 ? '0 0 25px rgba(232,255,71,0.8), 0 0 50px rgba(255,107,53,0.4)' : timeLeft <= 30 ? '0 0 30px rgba(232,255,71,0.55), 0 0 60px rgba(232,255,71,0.2)' : '0 0 20px rgba(232,255,71,0.3)' }}>
            {formatTime(timeLeft)}
          </p>
          <p className="text-[11px] font-mono text-muted uppercase tracking-wider mt-2">
            {timeLeft === 0 ? 'Time\u2019s up — next set' : 'Rest'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => extend(-30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg border border-border text-xs font-mono text-muted hover:text-text transition-colors active:opacity-70"
          >
            <Minus size={12} /> 30s
          </button>
          <button
            onClick={onSkip}
            className="px-5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-xs font-mono text-accent hover:bg-accent/20 transition-colors active:opacity-70"
          >
            Skip
          </button>
          <button
            onClick={() => extend(30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bg border border-border text-xs font-mono text-muted hover:text-text transition-colors active:opacity-70"
          >
            <Plus size={12} /> 30s
          </button>
        </div>

        {/* Minimize */}
        <button
          onClick={() => setExpanded(false)}
          className="absolute top-3 right-3 text-muted hover:text-text transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
