import { useCallback, useEffect, useState } from 'react'
import { fetchRecordings } from '../services/recordings'
import type { RecordingItem } from '../types'

export function useRecordings() {
  const [data, setData] = useState<RecordingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const rows = await fetchRecordings({ limit: 200 })
      setData(rows)
    } catch {
      setError('Falha ao carregar gravações.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, reload: load }
}

