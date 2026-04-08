import { useMemo, useState } from 'react'
import { useCameras } from '../hooks/useCameras'
import { useEvents } from '../hooks/useEvents'
import { riskColor, riskLabel } from '../utils/risk'

export function EventsPage() {
  const { data: cameras } = useCameras()
  const { data: events, loading } = useEvents()
  const [riskFilter, setRiskFilter] = useState('')
  const [cameraFilter, setCameraFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (riskFilter && ev.risk_level !== riskFilter) return false
      if (cameraFilter && ev.camera_id !== Number(cameraFilter)) return false
      if (dateFilter && !ev.occurred_at.startsWith(dateFilter)) return false
      return true
    })
  }, [cameraFilter, dateFilter, events, riskFilter])

  return (
    <section>
      <h1>Eventos</h1>
      <div className="toolbar">
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="">Todos os riscos</option>
          <option value="normal">Normal</option>
          <option value="suspicious">Suspeito</option>
          <option value="critical">Crítico</option>
        </select>
        <select value={cameraFilter} onChange={(e) => setCameraFilter(e.target.value)}>
          <option value="">Todas as câmeras</option>
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.name}
            </option>
          ))}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>
      {loading ? (
        <p>Carregando eventos...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Câmera</th>
                <th>Pessoa</th>
                <th>Trabalhador</th>
                <th>Risco</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id}>
                  <td>{new Date(ev.occurred_at).toLocaleString('pt-PT')}</td>
                  <td>{cameras.find((c) => c.id === ev.camera_id)?.name || ev.camera_id}</td>
                  <td>{ev.person_type || '-'}</td>
                  <td>{ev.worker_name || '-'}</td>
                  <td style={{ color: riskColor(ev.risk_level) }}>{riskLabel(ev.risk_level)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

