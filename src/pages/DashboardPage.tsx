import { useMemo } from 'react'
import { useCameras } from '../hooks/useCameras'
import { useEvents } from '../hooks/useEvents'

export function DashboardPage() {
  const { data: cameras } = useCameras()
  const { data: events } = useEvents()

  const kpis = useMemo(() => {
    const critical = events.filter((e) => e.risk_level === 'critical').length
    const suspicious = events.filter((e) => e.risk_level === 'suspicious').length
    const activeCameras = cameras.filter((c) => c.is_active).length
    return {
      totalEvents: events.length,
      critical,
      suspicious,
      activeCameras,
    }
  }, [cameras, events])

  return (
    <section>
      <h1>Dashboard Operacional</h1>
      <div className="kpi-grid">
        <article>
          <span>Eventos recentes</span>
          <strong>{kpis.totalEvents}</strong>
        </article>
        <article>
          <span>Câmeras ativas</span>
          <strong>{kpis.activeCameras}</strong>
        </article>
        <article>
          <span>Alertas críticos</span>
          <strong>{kpis.critical}</strong>
        </article>
        <article>
          <span>Alertas suspeitos</span>
          <strong>{kpis.suspicious}</strong>
        </article>
      </div>
    </section>
  )
}

