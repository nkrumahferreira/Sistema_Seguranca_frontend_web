import { api } from './api'
import type { Camera } from '../types'

export async function fetchCameras(): Promise<Camera[]> {
  const { data } = await api.get<Camera[]>('/api/v1/cameras')
  return data
}

