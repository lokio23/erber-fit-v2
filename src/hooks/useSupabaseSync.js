import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useSupabaseSync(user, program, setProgram, sessions, setSessions, settings, setSettings) {
  const [syncStatus, setSyncStatus] = useState('idle')
  const hasSynced = useRef(false)
  const debounceTimer = useRef(null)

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
          // No row exists — first-time user, push local data up
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

        // Row exists — load remote data into local state
        if (data.program && Object.keys(data.program).length > 0) setProgram(data.program)
        if (data.sessions && Array.isArray(data.sessions)) setSessions(data.sessions)
        if (data.settings && Object.keys(data.settings).length > 0) setSettings(data.settings)

        hasSynced.current = true
        setSyncStatus('synced')
      } catch (err) {
        console.error('Supabase sync load error:', err)
        hasSynced.current = true
        setSyncStatus('error')
      }
    }

    loadRemoteData()
    return () => { cancelled = true }
  }, [user?.id])

  // Debounced sync on data changes
  useEffect(() => {
    if (!supabase || !user || !hasSynced.current) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing')
        const { error } = await supabase.from('user_data').upsert({
          user_id: user.id,
          program,
          sessions,
          settings,
        })
        if (error) throw error
        setSyncStatus('synced')
      } catch (err) {
        console.error('Supabase sync write error:', err)
        setSyncStatus('error')
      }
    }, 2000)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [user?.id, program, sessions, settings])

  return { syncStatus }
}
