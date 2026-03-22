import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DEBOUNCE_MS = 2000
const MAX_SYNC_INTERVAL_MS = 10000

export default function useSupabaseSync(user, program, setProgram, sessions, setSessions, settings, setSettings) {
  const [syncStatus, setSyncStatus] = useState('idle')
  const hasSynced = useRef(false)
  const debounceTimer = useRef(null)
  const maxIntervalTimer = useRef(null)
  const isDirty = useRef(false)
  const latestData = useRef({ program, sessions, settings })

  // Keep latest data in ref for max-interval flush
  latestData.current = { program, sessions, settings }

  // Load data from Supabase on sign-in
  useEffect(() => {
    if (!supabase || !user) {
      hasSynced.current = false
      return
    }

    let cancelled = false

    async function loadRemoteData() {
      try {
        setSyncStatus('syncing')
        const { data, error } = await supabase
          .from('user_data')
          .select('program, sessions, settings, updated_at')
          .eq('user_id', user.id)
          .single()

        if (cancelled) return

        if (error && error.code === 'PGRST116') {
          await supabase.from('user_data').insert({
            user_id: user.id,
            program,
            sessions,
            settings,
          })
          hasSynced.current = true
          setSyncStatus('synced')
          return
        }

        if (error) throw error

        if (data.program && Object.keys(data.program).length > 0) setProgram(data.program)
        if (data.sessions && Array.isArray(data.sessions)) setSessions(data.sessions)
        if (data.settings && Object.keys(data.settings).length > 0) setSettings(data.settings)

        hasSynced.current = true
        setSyncStatus('synced')
      } catch (err) {
        console.error('Supabase sync load error:', err)
        hasSynced.current = true
        setSyncStatus(navigator.onLine ? 'error' : 'offline')
      }
    }

    loadRemoteData()
    return () => { cancelled = true }
  }, [user?.id])

  // Sync function
  async function doSync() {
    if (!supabase || !user || !isDirty.current) return
    if (!navigator.onLine) {
      setSyncStatus('offline')
      return
    }
    try {
      isDirty.current = false
      setSyncStatus('syncing')
      const { error } = await supabase.from('user_data').upsert({
        user_id: user.id,
        ...latestData.current,
      })
      if (error) throw error
      setSyncStatus('synced')
    } catch (err) {
      console.error('Supabase sync write error:', err)
      isDirty.current = true
      setSyncStatus(navigator.onLine ? 'error' : 'offline')
    }
  }

  // Debounced sync on data changes + max interval guarantee
  useEffect(() => {
    if (!supabase || !user || !hasSynced.current) return

    isDirty.current = true

    // Reset debounce
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(doSync, DEBOUNCE_MS)

    // Max interval: ensure sync fires at least every 10s during active use
    if (!maxIntervalTimer.current) {
      maxIntervalTimer.current = setTimeout(() => {
        maxIntervalTimer.current = null
        doSync()
      }, MAX_SYNC_INTERVAL_MS)
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [user?.id, program, sessions, settings])

  // Cleanup max interval on unmount
  useEffect(() => {
    return () => {
      if (maxIntervalTimer.current) clearTimeout(maxIntervalTimer.current)
    }
  }, [])

  // Warn before closing if sync is pending
  useEffect(() => {
    if (!isDirty.current && syncStatus !== 'syncing') return

    const handleBeforeUnload = (e) => {
      if (isDirty.current || syncStatus === 'syncing') {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [syncStatus, program, sessions, settings])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      if (isDirty.current) doSync()
      else if (syncStatus === 'offline') setSyncStatus('synced')
    }
    const handleOffline = () => setSyncStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user?.id])

  return { syncStatus }
}
