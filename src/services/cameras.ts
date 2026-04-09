import { api } from './api'
import type { Camera } from '../types'

export async function fetchCameras(): Promise<Camera[]> {
  const { data } = await api.get<Camera[]>('/api/v1/cameras')
  return data
}

export interface CreateCameraPayload {
  name: string
  location_id?: number | null
  rtsp_url?: string | null
  location?: string | null
  map_x?: number | null
  map_y?: number | null
  hls_playlist_name?: string | null
  enabled_for_ai: boolean
  enabled_for_recording: boolean
  status: 'unknown' | 'online' | 'offline' | 'error'
}

export async function createCamera(payload: CreateCameraPayload): Promise<Camera> {
  const { data } = await api.post<Camera>('/api/v1/cameras', payload)
  return data
}

export type UpdateCameraPayload = Partial<CreateCameraPayload> & {
  is_active?: boolean
}

export async function updateCamera(
  cameraId: number,
  payload: UpdateCameraPayload,
): Promise<Camera> {
  const { data } = await api.patch<Camera>(`/api/v1/cameras/${cameraId}`, payload)
  return data
}

