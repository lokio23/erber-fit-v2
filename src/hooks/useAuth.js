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

  const signIn = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/erber-fit-v2/',
        skipBrowserRedirect: false,
      },
    })
    // Fallback: if the browser wasn't redirected automatically, do it manually
    if (data?.url) {
      window.location.href = data.url
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  if (!supabase) return { user: null, loading: false, signIn: noop, signOut: noop }

  return { user, loading, signIn, signOut }
}
