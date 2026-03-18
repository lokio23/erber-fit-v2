import { useState, useCallback } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const nextValue = typeof value === 'function' ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(nextValue))
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
