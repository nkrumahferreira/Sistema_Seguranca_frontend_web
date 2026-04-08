import { api } from './api'
import type { LiveTrack } from '../types'

export async function fetchLiveTracks(cameraId: number): Promise<LiveTrack[]> {
  const { data } = await api.get<LiveTrack[]>('/api/v1/tracks/live', {
    params: { camera_id: cameraId, limit: 80, max_age_ms: 90000 },
  })
  return data
}

