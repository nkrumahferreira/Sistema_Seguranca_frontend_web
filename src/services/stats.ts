import { api } from './api'
import type { DashboardOverview, StatsCameraItem, StatsRiskItem, StatsTimePoint } from '../types'

export async function fetchDashboardOverview(activeWindowMinutes = 30): Promise<DashboardOverview> {
  const { data } = await api.get<DashboardOverview>('/api/v1/stats/overview', {
    params: { active_window_minutes: activeWindowMinutes },
  })
  return data
}

export async function fetchEventsTimeline(days = 7): Promise<StatsTimePoint[]> {
  const { data } = await api.get<StatsTimePoint[]>('/api/v1/stats/events/timeline', { params: { days } })
  return data
}

export async function fetchEventsByRisk(days = 7): Promise<StatsRiskItem[]> {
  const { data } = await api.get<StatsRiskItem[]>('/api/v1/stats/events/by-risk', { params: { days } })
  return data
}

export async function fetchEventsByCamera(days = 7, limit = 6): Promise<StatsCameraItem[]> {
  const { data } = await api.get<StatsCameraItem[]>('/api/v1/stats/events/by-camera', {
    params: { days, limit },
  })
  return data
}
