import { api } from './api'
import type { EventItem } from '../types'

export interface EventsFilter {
  camera_id?: number
  limit?: number
  min_level?: 'normal' | 'suspicious' | 'suspicious_visit' | 'critical'
}

export async function fetchEvents(filters: EventsFilter = {}): Promise<EventItem[]> {
  const { data } = await api.get<EventItem[]>('/api/v1/events', { params: filters })
  return data
}

