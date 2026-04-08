import { api } from './api'
import type { HlsCameraResponse } from '../types'

export async function fetchHlsUrl(cameraId: number): Promise<string> {
  const { data } = await api.get<HlsCameraResponse>(`/api/v1/streams/cameras/${cameraId}/hls`)
  return data.playlist_url
}

