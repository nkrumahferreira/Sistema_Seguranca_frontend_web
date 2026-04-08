import { useCallback, useEffect, useState } from 'react'
import { fetchCameras } from '../services/cameras'
import type { Camera } from '../types'

export function useCameras() {
  const [data, setData] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const rows = await fetchCameras()
      setData(rows)
    } catch (err) {
      setError('Falha ao carregar câmeras.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, reload: load }
}

