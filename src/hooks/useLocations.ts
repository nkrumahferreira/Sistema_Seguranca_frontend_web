import { useCallback, useEffect, useState } from 'react'
import {
  createLocation,
  fetchLocations,
  fetchLocationsTree,
  uploadLocationMapImage,
  type CreateLocationPayload,
} from '../services/locations'
import type { LocationItem, LocationTreeItem } from '../types'

export function useLocations() {
  const [data, setData] = useState<LocationItem[]>([])
  const [tree, setTree] = useState<LocationTreeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [rows, treeRows] = await Promise.all([fetchLocations(), fetchLocationsTree()])
      setData(rows)
      setTree(treeRows)
    } catch {
      setError('Falha ao carregar localizações.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addLocation = useCallback(
    async (payload: CreateLocationPayload, mapImageFile?: File | null) => {
      setSubmitting(true)
      try {
        setError(null)
        const created = await createLocation(payload)
        if (mapImageFile) {
          await uploadLocationMapImage(created.id, mapImageFile)
        }
        await load()
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Falha ao cadastrar localização.')
      } finally {
        setSubmitting(false)
      }
    },
    [load],
  )

  return { data, tree, loading, submitting, error, reload: load, addLocation }
}

