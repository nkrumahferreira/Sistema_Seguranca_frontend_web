import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertsPanel } from '../components/watch/AlertsPanel'
import { CanvasOverlay } from '../components/watch/CanvasOverlay'
import { HlsPlayer } from '../components/watch/HlsPlayer'
import { useCameras } from '../hooks/useCameras'
import { useEvents } from '../hooks/useEvents'
import { useLiveTracks } from '../hooks/useLiveTracks'
import { fetchHlsUrl } from '../services/streams'

export function WatchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: cameras } = useCameras()
  const initialCameraId = Number(searchParams.get('camera_id') || 0) || cameras[0]?.id
  const [cameraId, setCameraId] = useState<number | undefined>(initialCameraId)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({ cameraId: '', risk: '', worker: '' })
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { tracks } = useLiveTracks(cameraId)
  const { data: events } = useEvents({ cameraId })

  useEffect(() => {
    if (!cameraId && cameras[0]?.id) setCameraId(cameras[0].id)
  }, [cameraId, cameras])

  useEffect(() => {
    if (!cameraId) return
    setSearchParams({ camera_id: String(cameraId) })
    fetchHlsUrl(cameraId)
      .then((url) => setStreamUrl(url))
      .catch(() => setStreamUrl(null))
  }, [cameraId, setSearchParams])

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at)),
    [events],
  )

  return (
    <section>
      <div className="watch-header">
        <h1>Monitoramento</h1>
        <select value={cameraId || ''} onChange={(e) => setCameraId(Number(e.target.value))}>
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.name}
            </option>
          ))}
        </select>
      </div>
      <div className="watch-layout">
        <article className="video-card">
          <div className="video-wrap">
            <HlsPlayer src={streamUrl} videoRef={videoRef} />
            <CanvasOverlay videoRef={videoRef} tracks={tracks} />
          </div>
        </article>
        <AlertsPanel
          events={sortedEvents}
          cameras={cameras}
          filters={filters}
          onFilterChange={setFilters}
          seenIds={seenIds}
          onMarkAllSeen={() => setSeenIds(new Set(sortedEvents.map((ev) => ev.id)))}
        />
      </div>
    </section>
  )
}

