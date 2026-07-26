import { useState, useCallback } from 'react'

// `transform` runs once on the value loaded from storage (used for schema migration).
// If it returns something new, the upgraded value is written back immediately.
export default function useLocalStorage(key, initialValue, transform) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return initialValue
      const parsed = JSON.parse(item)
      if (!transform) return parsed
      const upgraded = transform(parsed)
      if (upgraded !== parsed) {
        try {
          localStorage.setItem(key, JSON.stringify(upgraded))
        } catch (e) {
          console.error(`[useLocalStorage] Failed to persist migrated "${key}":`, e)
        }
      }
      return upgraded
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const nextValue = typeof value === 'function' ? value(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(nextValue))
      } catch (e) {
        console.error(`[useLocalStorage] Failed to persist "${key}":`, e)
      }
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
