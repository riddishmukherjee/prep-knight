import { useState, useCallback } from 'react'

export function useClaude() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')

  const call = useCallback(async (prompt: string): Promise<string> => {
    setLoading(true)
    setError(null)
    setText('')
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setText(data.text)
      return data.text as string
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  /** Streams text character-by-character at 8ms into `onChunk` callback */
  const stream = useCallback(
    async (prompt: string, onChunk: (t: string) => void): Promise<string> => {
      setLoading(true)
      setError(null)
      setText('')
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        if (!res.ok) throw new Error(`API error ${res.status}`)
        const data = await res.json()
        const full: string = data.text
        let current = ''
        for (let i = 0; i < full.length; i++) {
          current += full[i]
          onChunk(current)
          setText(current)
          await new Promise<void>(r => setTimeout(r, 8))
        }
        return full
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setText('')
  }, [])

  return { loading, error, text, call, stream, reset }
}
