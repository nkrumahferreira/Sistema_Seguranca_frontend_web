import { useMemo } from 'react'
import type { Camera, EventItem } from '../../types'
import { riskColor, riskLabel } from '../../utils/risk'

interface AlertsPanelProps {
  events: EventItem[]
  cameras: Camera[]
  filters: {
    cameraId: string
    risk: string
    worker: string
  }
  onFilterChange: (next: AlertsPanelProps['filters']) => void
  seenIds: Set<number>
  onMarkAllSeen: () => void
}

export function AlertsPanel({
  events,
  cameras,
  filters,
  onFilterChange,
  seenIds,
  onMarkAllSeen,
}: AlertsPanelProps) {
  const workers = useMemo(
    () =>
      Array.from(new Set(events.map((e) => e.worker_name).filter((w): w is string => Boolean(w)))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [events],
  )

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.cameraId && e.camera_id !== Number(filters.cameraId)) return false
      if (filters.risk && e.risk_level !== filters.risk) return false
      if (filters.worker && e.worker_name !== filters.worker) return false
      return true
    })
  }, [events, filters])

  const unseen = filtered.filter((e) => !seenIds.has(e.id)).length

  return (
    <aside className="alerts">
      <div className="alerts-head">
        <h3>Alertas</h3>
        <span className="badge">{unseen} novos</span>
      </div>
      <div className="filters">
        <select
          value={filters.cameraId}
          onChange={(e) => onFilterChange({ ...filters, cameraId: e.target.value })}
        >
          <option value="">Todas câmeras</option>
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.name}
            </option>
          ))}
        </select>
        <select value={filters.risk} onChange={(e) => onFilterChange({ ...filters, risk: e.target.value })}>
          <option value="">Todos riscos</option>
          <option value="normal">Normal</option>
          <option value="suspicious">Suspeito</option>
          <option value="critical">Crítico</option>
        </select>
        <select
          value={filters.worker}
          onChange={(e) => onFilterChange({ ...filters, worker: e.target.value })}
        >
          <option value="">Todos trabalhadores</option>
          {workers.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>
      <button className="ghost-btn" onClick={onMarkAllSeen}>
        Marcar todos como vistos
      </button>
      <ul>
        {filtered.slice(0, 30).map((ev) => (
          <li key={ev.id} className={seenIds.has(ev.id) ? '' : 'unseen'}>
            <span style={{ color: riskColor(ev.risk_level) }}>{riskLabel(ev.risk_level)}</span>
            <strong>{ev.worker_name || ev.person_type || 'Pessoa'}</strong>
            <small>{new Date(ev.occurred_at).toLocaleString('pt-PT')}</small>
          </li>
        ))}
      </ul>
    </aside>
  )
}

