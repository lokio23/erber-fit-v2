import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const noop = () => {}

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(() => {
    if (!supabase) return
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/erber-fit-v2/',
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  if (!supabase) return { user: null, loading: false, signIn: noop, signOut: noop }

  return { user, loading, signIn, signOut }
}
