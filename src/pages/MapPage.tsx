import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCameras } from '../hooks/useCameras'
import { useLiveTracks } from '../hooks/useLiveTracks'
import { riskColor } from '../utils/risk'

const FALLBACK_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0.35, y: 0.62 },
  2: { x: 0.58, y: 0.42 },
  3: { x: 0.22, y: 0.33 },
}

export function MapPage() {
  const { data: cameras } = useCameras()
  const navigate = useNavigate()
  const selectedCameraId = cameras[0]?.id
  const { rawTracks } = useLiveTracks(selectedCameraId)

  const cameraRisk = useMemo(() => {
    const hasCritical = rawTracks.some((t) => t.risk_level === 'critical')
    const hasSuspicious = rawTracks.some(
      (t) => t.risk_level === 'suspicious' || t.risk_level === 'suspicious_visit',
    )
    if (hasCritical) return 'critical'
    if (hasSuspicious) return 'suspicious'
    return 'normal'
  }, [rawTracks])

  return (
    <section>
      <h1>Mapa da Fazenda</h1>
      <div className="map-card">
        <img src="/imagens/logo-com-fundo.jpeg" alt="Mapa da propriedade" className="map-image" />
        {cameras.map((cam) => {
          const p = FALLBACK_POSITIONS[cam.id] || { x: 0.5, y: 0.5 }
          const risk = cameraRisk
          return (
            <button
              key={cam.id}
              className={`map-marker ${risk === 'critical' ? 'pulse' : ''}`}
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                borderColor: riskColor(risk),
              }}
              onClick={() => navigate(`/watch?camera_id=${cam.id}`)}
              title={cam.name}
            >
              {cam.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}

