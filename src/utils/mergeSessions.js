// Union two lists of sessions by id instead of letting one side win outright.
//
// Both sync and backup-import need this. A straight overwrite silently discards
// whatever was logged on the device while it was signed out — which is exactly
// the data that mattered when the Supabase project sat paused for six weeks and
// every workout in that stretch existed only in this browser's localStorage.
//
// Where both sides hold the same session id, keep the one with more logged sets:
// a half-logged copy from one device should never replace a full one.

export function loggedSetCount(session) {
  return [...(session.exercises || []), ...(session.warmupExercises || [])]
    .reduce((total, ex) => total + (ex.sets || []).filter(s => s.completed).length, 0)
}

export function mergeSessions(localSessions, incomingSessions) {
  const byId = new Map()
  for (const session of incomingSessions || []) byId.set(session.id, session)
  for (const session of localSessions || []) {
    const incoming = byId.get(session.id)
    if (!incoming || loggedSetCount(session) > loggedSetCount(incoming)) {
      byId.set(session.id, session)
    }
  }
  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date))
}
