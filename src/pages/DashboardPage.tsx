import { useMemo } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'

function riskLabel(v: string) {
  if (v === 'critical') return 'Crítico'
  if (v === 'suspicious') return 'Suspeito'
  if (v === 'suspicious_visit') return 'Visita suspeita'
  if (v === 'normal') return 'Normal'
  return v
}

export function DashboardPage() {
  const { overview, timeline, risk, byCamera, loading, error } = useDashboardStats(7)

  const kpis = useMemo(() => {
    if (!overview) {
      return {
        workers: 0,
        activeCameras: 0,
        activeAlerts: 0,
        critical24h: 0,
        suspicious24h: 0,
        recordings24h: 0,
      }
    }
    return {
      workers: overview.workers_total,
      activeCameras: overview.cameras_active,
      activeAlerts: overview.active_alerts,
      critical24h: overview.critical_alerts_24h,
      suspicious24h: overview.suspicious_alerts_24h,
      recordings24h: overview.recordings_24h,
    }
  }, [overview])

  const timelineMax = useMemo(() => Math.max(1, ...timeline.map((i) => i.total)), [timeline])
  const riskTotal = useMemo(() => Math.max(1, risk.reduce((acc, r) => acc + r.total, 0)), [risk])
  const byCameraMax = useMemo(() => Math.max(1, ...byCamera.map((i) => i.total)), [byCamera])
  const timelineWithFallback = useMemo(() => {
    if (timeline.length > 0) return timeline
    const out: Array<{ bucket: string; total: number }> = []
    const now = new Date()
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      out.push({
        bucket: d.toISOString().slice(5, 10),
        total: 0,
      })
    }
    return out
  }, [timeline])
  const riskWithFallback = useMemo(
    () =>
      risk.length > 0
        ? risk
        : [
            { risk_level: 'normal', total: 0 },
            { risk_level: 'suspicious', total: 0 },
            { risk_level: 'suspicious_visit', total: 0 },
            { risk_level: 'critical', total: 0 },
          ],
    [risk],
  )
  const camerasWithFallback = useMemo(
    () =>
      byCamera.length > 0
        ? byCamera
        : [
            { camera_id: 0, camera_name: 'Sem dados', total: 0 },
            { camera_id: -1, camera_name: 'Sem dados', total: 0 },
            { camera_id: -2, camera_name: 'Sem dados', total: 0 },
          ],
    [byCamera],
  )
  const totalForPie = Math.max(1, riskWithFallback.reduce((acc, item) => acc + item.total, 0))

  return (
    <section className="dashboard-page">
      <h1>Dashboard Operacional</h1>
      {error && <p className="error">{error}</p>}
      <div className="kpi-grid">
        <article>
          <span>Trabalhadores</span>
          <strong>{kpis.workers}</strong>
        </article>
        <article>
          <span>Câmeras ativas</span>
          <strong>{kpis.activeCameras}</strong>
        </article>
        <article>
          <span>Alertas ativos</span>
          <strong>{kpis.activeAlerts}</strong>
        </article>
        <article>
          <span>Críticos (24h)</span>
          <strong>{kpis.critical24h}</strong>
        </article>
        <article>
          <span>Suspeitos (24h)</span>
          <strong>{kpis.suspicious24h}</strong>
        </article>
        <article>
          <span>Gravações (24h)</span>
          <strong>{kpis.recordings24h}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Eventos por dia (7 dias)</h3>
          {loading && <p>Carregando...</p>}
          <div className="stats-bars">
            {timelineWithFallback.map((item) => (
              <div key={item.bucket} className="stats-row">
                <span className="stats-label">{item.bucket}</span>
                <div className="stats-bar-track">
                  <div className="stats-bar-fill" style={{ width: `${(item.total / timelineMax) * 100}%` }} />
                </div>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <h3>Distribuição por risco (7 dias)</h3>
          {loading && <p>Carregando...</p>}
          <div className="risk-grid">
            <div className="risk-pie" aria-label="Gráfico de pizza por risco">
              {riskWithFallback.map((item, idx) => {
                const colors = ['#37c6ff', '#ff9f1a', '#f97316', '#ff4d4f']
                const pct = (item.total / totalForPie) * 100
                return (
                  <div
                    key={`${item.risk_level}-${idx}`}
                    className="risk-pie-slice"
                    style={{ width: `${Math.max(8, pct)}%`, background: colors[idx % colors.length] }}
                    title={`${riskLabel(item.risk_level)}: ${item.total}`}
                  />
                )
              })}
            </div>
            <div className="stats-bars">
              {riskWithFallback.map((item) => (
                <div key={item.risk_level} className="stats-row">
                  <span className="stats-label">{riskLabel(item.risk_level)}</span>
                  <div className="stats-bar-track">
                    <div className="stats-bar-fill risk" style={{ width: `${(item.total / riskTotal) * 100}%` }} />
                  </div>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-card">
          <h3>Top câmeras por eventos (7 dias)</h3>
          {loading && <p>Carregando...</p>}
          <div className="stats-bars">
            {camerasWithFallback.map((item, idx) => (
              <div key={`${item.camera_id}-${idx}`} className="stats-row">
                <span className="stats-label">{item.camera_name}</span>
                <div className="stats-bar-track">
                  <div className="stats-bar-fill camera" style={{ width: `${(item.total / byCameraMax) * 100}%` }} />
                </div>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

