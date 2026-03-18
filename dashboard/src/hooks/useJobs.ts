import { useState, useCallback } from 'react'
import type { Job } from '../types'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState(false)

  const sync = useCallback(async () => {
    setSyncing(true)
    setSyncError(false)
    try {
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
      setLastSynced(new Date())
    } catch {
      setSyncError(true)
    } finally {
      setSyncing(false)
    }
  }, [])

  return { jobs, setJobs, syncing, lastSynced, syncError, sync }
}
