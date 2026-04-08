import { useCallback, useEffect, useState } from 'react'
import type { EventItem, RiskLevel } from '../types'
import { fetchEvents } from '../services/events'
import { EVENTS_POLL_INTERVAL_MS } from '../utils/constants'

interface UseEventsOptions {
  cameraId?: number
  minLevel?: RiskLevel
}

export function useEvents(options: UseEventsOptions = {}) {
  const [data, setData] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const rows = await fetchEvents({
        camera_id: options.cameraId,
        min_level: options.minLevel,
        limit: 120,
      })
      setData(rows)
    } catch {
      setError('Falha ao carregar eventos.')
    } finally {
      setLoading(false)
    }
  }, [options.cameraId, options.minLevel])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), EVENTS_POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [load])

  return { data, loading, error, reload: load }
}

