import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCameras } from '../hooks/useCameras'
import { useLocations } from '../hooks/useLocations'
import { useLiveTracks } from '../hooks/useLiveTracks'
import { riskColor } from '../utils/risk'
import { API_BASE_URL } from '../utils/constants'

export function MapPage() {
  const { data: cameras } = useCameras()
  const { tree: locationsTree } = useLocations()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const selectedLocationId = Number(searchParams.get('location_id') || 0) || null

  const flatLocations = useMemo(() => {
    const byId = new Map<number, { id: number; name: string; parent_id: number | null; map_image: string | null }>()
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        byId.set(n.id, { id: n.id, name: n.name, parent_id: n.parent_id, map_image: n.map_image })
        walk(n.children || [])
      }
    }
    walk(locationsTree as any[])
    return byId
  }, [locationsTree])

  const currentLocation = useMemo(() => {
    if (!selectedLocationId) {
      return locationsTree[0] ?? null
    }
    return flatLocations.get(selectedLocationId) ?? locationsTree[0] ?? null
  }, [selectedLocationId, locationsTree, flatLocations])

  const children = useMemo(() => {
    if (!currentLocation) return []
    return Array.from(flatLocations.values()).filter((l) => l.parent_id === currentLocation.id)
  }, [currentLocation, flatLocations])

  const breadcrumb = useMemo(() => {
    if (!currentLocation) return []
    const out: Array<{ id: number; name: string }> = []
    let cursor: any = currentLocation
    while (cursor) {
      out.push({ id: cursor.id, name: cursor.name })
      cursor = cursor.parent_id ? flatLocations.get(cursor.parent_id) : null
    }
    return out.reverse()
  }, [currentLocation, flatLocations])

  const locationCameras = useMemo(() => {
    if (!currentLocation) return []
    return cameras.filter((c) => c.location_id === currentLocation.id)
  }, [cameras, currentLocation])

  const selectedCameraId = locationCameras[0]?.id
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
      <h1>Mapa Hierarquico da Fazenda</h1>
      <div className="map-breadcrumb">
        {breadcrumb.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            className="crumb-btn"
            onClick={() => setSearchParams({ location_id: String(b.id) })}
          >
            {idx > 0 ? ' > ' : ''}
            {b.name}
          </button>
        ))}
      </div>
      <div className="map-card">
        <img
          src={currentLocation?.map_image ? resolveMapImageUrl(currentLocation.map_image) : '/imagens/logo-com-fundo.jpeg'}
          alt="Mapa da localizacao"
          className="map-image"
        />
        {locationCameras.map((cam) => {
          const p = {
            x: cam.map_x ?? 0.5,
            y: cam.map_y ?? 0.5,
          }
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
        {children.map((child, idx) => {
          const x = ((idx % 5) + 1) / 6
          const y = 0.14 + Math.floor(idx / 5) * 0.08
          return (
            <button
              key={child.id}
              className="map-marker child-marker"
              style={{ left: `${x * 100}%`, top: `${Math.min(y, 0.9) * 100}%` }}
              onClick={() => setSearchParams({ location_id: String(child.id) })}
              title={`Entrar em ${child.name}`}
            >
              {child.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function resolveMapImageUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return path
}

