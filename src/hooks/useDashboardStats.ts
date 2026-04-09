import { useCallback, useEffect, useState } from 'react'
import type { DashboardOverview, StatsCameraItem, StatsRiskItem, StatsTimePoint } from '../types'
import {
  fetchDashboardOverview,
  fetchEventsByCamera,
  fetchEventsByRisk,
  fetchEventsTimeline,
} from '../services/stats'

const DASHBOARD_POLL_MS = 15000

export function useDashboardStats(days = 7) {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [timeline, setTimeline] = useState<StatsTimePoint[]>([])
  const [risk, setRisk] = useState<StatsRiskItem[]>([])
  const [byCamera, setByCamera] = useState<StatsCameraItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [ov, tl, rk, cam] = await Promise.all([
        fetchDashboardOverview(),
        fetchEventsTimeline(days),
        fetchEventsByRisk(days),
        fetchEventsByCamera(days, 6),
      ])
      setOverview(ov)
      setTimeline(tl)
      setRisk(rk)
      setByCamera(cam)
    } catch {
      setError('Falha ao carregar estatísticas da dashboard.')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), DASHBOARD_POLL_MS)
    return () => window.clearInterval(id)
  }, [load])

  return { overview, timeline, risk, byCamera, loading, error, reload: load }
}
