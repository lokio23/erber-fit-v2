import { useRef } from 'react'
import { Download, Upload, Volume2, VolumeX, Smartphone, Zap, ZapOff } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { getWeeksSinceDate, isDeloadActive, getTodayStr, formatDate } from '../utils/calculations'

export default function Settings() {
  const { settings, setSettings, program, sessions, setProgram, setSessions } = useWorkout()
  const fileInputRef = useRef(null)

  const deloadActive = isDeloadActive(settings)
  const weeksSinceDeload = getWeeksSinceDate(settings.lastDeloadDate || sessions[0]?.date)
  const nextDeloadWeeks = Math.max(0, 6 - weeksSinceDeload)

  const handleExport = () => {
    const data = {
      erberfit_program: program,
      erberfit_sessions: sessions,
      erberfit_settings: settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `erberfit-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.erberfit_program) setProgram(data.erberfit_program)
        if (data.erberfit_sessions) setSessions(data.erberfit_sessions)
        if (data.erberfit_settings) setSettings(data.erberfit_settings)
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-3">
        <h2 className="font-display text-2xl tracking-wider text-text">SETTINGS</h2>
      </div>

      <div className="px-4 space-y-2">
        {/* Unit toggle */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-medium text-text">Weight Unit</p>
              <p className="text-xs font-mono text-muted mt-0.5">Display weights in pounds or kilograms</p>
            </div>
            <div className="flex bg-bg border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => update('unit', 'lbs')}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  settings.unit === 'lbs' ? 'bg-accent/10 text-accent' : 'text-muted'
                }`}
              >
                LBS
              </button>
              <button
                onClick={() => update('unit', 'kg')}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  settings.unit === 'kg' ? 'bg-accent/10 text-accent' : 'text-muted'
                }`}
              >
                KG
              </button>
            </div>
          </div>
        </SettingCard>

        {/* Bodyweight */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-medium text-text">Bodyweight</p>
              <p className="text-xs font-mono text-muted mt-0.5">For weighted bodyweight exercises</p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="decimal"
                value={settings.bodyweight}
                onChange={e => update('bodyweight', Number(e.target.value))}
                className="w-16 bg-bg border border-border rounded px-2 py-1.5 text-sm font-mono text-text text-center focus:outline-none focus:border-accent/50"
              />
              <span className="text-xs font-mono text-muted">{settings.unit}</span>
            </div>
          </div>
        </SettingCard>

        {/* Deload Week */}
        <SettingCard>
          {deloadActive ? (
            <>
              <div className="flex items-center gap-2.5 mb-2">
                <Zap size={16} className="text-accent-secondary" />
                <div>
                  <p className="text-sm font-body font-medium text-accent-secondary">Deload Week Active</p>
                  <p className="text-xs font-mono text-muted mt-0.5">
                    Sets halved until {formatDate(settings.deloadActiveUntil)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, deloadActiveUntil: null, lastDeloadDate: getTodayStr() }))}
                className="w-full py-2 rounded-lg border border-accent-secondary/30 text-xs font-mono text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
              >
                End Deload Early
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body font-medium text-text">Deload Week</p>
                  <p className="text-xs font-mono text-muted mt-0.5">
                    {settings.deloadReminderEnabled
                      ? nextDeloadWeeks <= 0
                        ? 'Deload recommended now'
                        : `Auto-reminder in ~${nextDeloadWeeks} week${nextDeloadWeeks !== 1 ? 's' : ''}`
                      : 'Halve sets for a recovery week'
                    }
                  </p>
                </div>
                <Toggle
                  checked={settings.deloadReminderEnabled}
                  onChange={v => update('deloadReminderEnabled', v)}
                />
              </div>
              <button
                onClick={() => {
                  if (confirm('Start a deload week? All exercises will show half the normal sets for 7 days.')) {
                    const end = new Date()
                    end.setDate(end.getDate() + 7)
                    setSettings(prev => ({ ...prev, deloadActiveUntil: end.toISOString().split('T')[0], lastDeloadDate: getTodayStr() }))
                  }
                }}
                className="mt-3 w-full py-2.5 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 text-xs font-mono text-accent-secondary hover:bg-accent-secondary/20 transition-colors"
              >
                Start Deload Week
              </button>
            </>
          )}
        </SettingCard>

        {/* Sound */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? <Volume2 size={16} className="text-accent" /> : <VolumeX size={16} className="text-muted" />}
              <div>
                <p className="text-sm font-body font-medium text-text">Timer Sound</p>
                <p className="text-xs font-mono text-muted mt-0.5">Beep when rest timer ends</p>
              </div>
            </div>
            <Toggle checked={settings.soundEnabled} onChange={v => update('soundEnabled', v)} />
          </div>
        </SettingCard>

        {/* Vibration */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone size={16} className={settings.vibrationEnabled ? 'text-accent' : 'text-muted'} />
              <div>
                <p className="text-sm font-body font-medium text-text">Vibration</p>
                <p className="text-xs font-mono text-muted mt-0.5">Vibrate when rest timer ends</p>
              </div>
            </div>
            <Toggle checked={settings.vibrationEnabled} onChange={v => update('vibrationEnabled', v)} />
          </div>
        </SettingCard>

        {/* Data Management */}
        <div className="pt-4">
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider px-1 mb-2">Data</p>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-accent/20 transition-colors"
            >
              <Download size={16} className="text-accent" />
              <div className="text-left">
                <p className="text-sm font-body font-medium text-text">Export Data</p>
                <p className="text-xs font-mono text-muted mt-0.5">Download all workout data as JSON</p>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-accent/20 transition-colors"
            >
              <Upload size={16} className="text-accent" />
              <div className="text-left">
                <p className="text-sm font-body font-medium text-text">Import Data</p>
                <p className="text-xs font-mono text-muted mt-0.5">Restore from a JSON backup</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </div>

        {/* Branding */}
        <div className="pt-8 pb-4 text-center">
          <p className="font-display text-lg tracking-wider text-accent/40">ERBER FIT</p>
          <p className="text-[10px] font-mono text-muted/40 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

function SettingCard({ children }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors active:opacity-70 ${
        checked ? '' : 'bg-border'
      }`}
      style={checked ? { background: 'linear-gradient(to right, #c8dd35, #e8ff47)', boxShadow: '0 0 8px rgba(232,255,71,0.35), inset 0 1px 2px rgba(255,255,255,0.1)' } : undefined}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
        style={{ background: 'radial-gradient(circle at 35% 35%, #ffffff, #e8e8e8)' }}
      />
    </button>
  )
}
