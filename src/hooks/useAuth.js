import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const noop = () => Promise.resolve()

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

  const signIn = useCallback(async (pin) => {
    if (!supabase || !pin) return { error: 'No PIN provided' }

    const email = `${pin}@erberfit.app`
    const password = `erberfit_${pin}_secure`

    // Try sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      // If user doesn't exist, sign up
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) return { error: signUpError.message }
    }

    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  if (!supabase) return { user: null, loading: false, signIn: noop, signOut: noop }

  return { user, loading, signIn, signOut }
}
