import { useState, useCallback } from 'react'
import type { PipelineEntry } from '../types'

export function usePipeline() {
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([])

  const sync = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline')
      if (!res.ok) return
      const data = await res.json()
      setPipeline(Array.isArray(data) ? data : [])
    } catch { /* silent */ }
  }, [])

  const add = useCallback(async (entry: Omit<PipelineEntry, 'addedAt'>) => {
    await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    await sync()
  }, [sync])

  const move = useCallback(async (idx: number, status: string) => {
    await fetch(`/api/pipeline/${idx}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await sync()
  }, [sync])

  return { pipeline, sync, add, move }
}
