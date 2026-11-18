import { useCallback, useEffect, useState } from 'react'
import { allLabs } from '../data/modules'

const STORAGE_KEY = 'oslab.visitedLabs'
const EVENT_NAME = 'oslab:progress'

function readVisited(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function markLabVisited(path: string) {
  const visited = readVisited()
  if (visited.includes(path)) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited, path]))
  } catch {
    return
  }
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function useLabProgress() {
  const [visited, setVisited] = useState<string[]>(readVisited)

  const refresh = useCallback(() => setVisited(readVisited()), [])

  useEffect(() => {
    window.addEventListener(EVENT_NAME, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(EVENT_NAME, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return { visited, total: allLabs.length, refresh }
}
