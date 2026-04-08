import { useCallback, useEffect, useState } from 'react'
import { createWorker, deleteWorker, fetchWorkers, type CreateWorkerPayload } from '../services/workers'
import type { Worker } from '../types'

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const rows = await fetchWorkers()
      setWorkers(rows)
    } catch {
      setError('Falha ao carregar trabalhadores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addWorker = useCallback(
    async (payload: CreateWorkerPayload) => {
      setSubmitting(true)
      try {
        setError(null)
        const created = await createWorker(payload)
        setWorkers((prev) => [...prev, created])
      } catch {
        setError('Falha ao cadastrar trabalhador. Verifique os dados e a foto.')
      } finally {
        setSubmitting(false)
      }
    },
    [],
  )

  const removeWorker = useCallback(async (workerId: number) => {
    try {
      setError(null)
      await deleteWorker(workerId)
      setWorkers((prev) => prev.filter((w) => w.id !== workerId))
    } catch {
      setError('Falha ao remover trabalhador.')
    }
  }, [])

  return { workers, loading, submitting, error, reload: load, addWorker, removeWorker }
}

