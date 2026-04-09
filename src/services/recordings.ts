import { api } from './api'
import type { RecordingItem } from '../types'

export interface RecordingsFilter {
  limit?: number
}

export async function fetchRecordings(filters: RecordingsFilter = {}): Promise<RecordingItem[]> {
  const { data } = await api.get<RecordingItem[]>('/api/v1/recordings', { params: filters })
  return data
}

