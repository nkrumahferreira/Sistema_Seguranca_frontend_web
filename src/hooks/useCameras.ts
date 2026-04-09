import { useCallback, useEffect, useState } from 'react'
import {
  createCamera,
  fetchCameras,
  updateCamera,
  type CreateCameraPayload,
  type UpdateCameraPayload,
} from '../services/cameras'
import type { Camera } from '../types'

export function useCameras() {
  const [data, setData] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const addCamera = useCallback(async (payload: CreateCameraPayload) => {
    setSubmitting(true)
    try {
      setError(null)
      const created = await createCamera(payload)
      setData((prev) => [...prev, created])
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Falha ao cadastrar câmera.')
    } finally {
      setSubmitting(false)
    }
  }, [])

  const editCamera = useCallback(async (cameraId: number, payload: UpdateCameraPayload) => {
    setSubmitting(true)
    try {
      setError(null)
      const updated = await updateCamera(cameraId, payload)
      setData((prev) => prev.map((c) => (c.id === cameraId ? updated : c)))
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Falha ao atualizar câmera.')
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { data, loading, submitting, error, reload: load, addCamera, editCamera }
}

