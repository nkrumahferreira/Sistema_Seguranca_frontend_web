import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useCameras } from '../hooks/useCameras'
import { useLocations } from '../hooks/useLocations'
import { cameraStatusLabel, locationTypeLabel } from '../utils/labels'
import { API_BASE_URL } from '../utils/constants'

function resolveMapImageUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`
  return path
}

function MapCoordinatePicker({
  mapImagePath,
  mapX,
  mapY,
  onPick,
  onClear,
}: {
  mapImagePath: string | null | undefined
  mapX: string
  mapY: string
  onPick: (x: string, y: string) => void
  onClear: () => void
}) {
  if (!mapImagePath) {
    return (
      <div className="camera-map-picker-empty">
        Selecione uma localização que tenha imagem de mapa para marcar a posição da câmera.
      </div>
    )
  }

  const xNum = mapX.trim() ? Number(mapX) : null
  const yNum = mapY.trim() ? Number(mapY) : null
  const hasPoint = xNum != null && yNum != null && !Number.isNaN(xNum) && !Number.isNaN(yNum)

  return (
    <div className="camera-map-picker-wrap">
      <div
        className="camera-map-picker"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const rawX = (e.clientX - rect.left) / rect.width
          const rawY = (e.clientY - rect.top) / rect.height
          const x = Math.min(1, Math.max(0, rawX))
          const y = Math.min(1, Math.max(0, rawY))
          onPick(x.toFixed(4), y.toFixed(4))
        }}
        title="Clique no mapa para definir a posição da câmera"
      >
        <img src={resolveMapImageUrl(mapImagePath)} alt="Mapa da localização" className="camera-map-picker-image" />
        {hasPoint && (
          <span
            className="camera-map-picker-marker"
            style={{ left: `${xNum * 100}%`, top: `${yNum * 100}%` }}
            title={`X=${xNum.toFixed(4)} | Y=${yNum.toFixed(4)}`}
          />
        )}
      </div>
      <div className="camera-map-picker-meta">
        <span>
          Coordenadas: X {hasPoint ? xNum!.toFixed(4) : '-'} | Y {hasPoint ? yNum!.toFixed(4) : '-'}
        </span>
        <button type="button" onClick={onClear}>
          Limpar ponto
        </button>
      </div>
    </div>
  )
}

export function CamerasPage() {
  const { data: cameras, loading, submitting, error, addCamera, editCamera } = useCameras()
  const { data: locations } = useLocations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCameraId, setEditingCameraId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [locationId, setLocationId] = useState<number | ''>('')
  const [rtspUrl, setRtspUrl] = useState('')
  const [location, setLocation] = useState('')
  const [mapX, setMapX] = useState('')
  const [mapY, setMapY] = useState('')
  const [hlsPlaylistName, setHlsPlaylistName] = useState('')
  const [enabledForAi, setEnabledForAi] = useState(true)
  const [enabledForRecording, setEnabledForRecording] = useState(true)
  const [status, setStatus] = useState<'unknown' | 'online' | 'offline' | 'error'>('unknown')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const totalPages = Math.max(1, Math.ceil(cameras.length / PAGE_SIZE))
  const locationsById = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations])
  const selectedLocationMapImage =
    locationId === '' ? null : (locationsById.get(Number(locationId))?.map_image ?? null)
  const paginatedCameras = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return cameras.slice(start, start + PAGE_SIZE)
  }, [cameras, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await addCamera({
      name,
      location_id: locationId === '' ? null : Number(locationId),
      rtsp_url: rtspUrl.trim() || null,
      location: location.trim() || null,
      map_x: mapX.trim() ? Number(mapX) : null,
      map_y: mapY.trim() ? Number(mapY) : null,
      hls_playlist_name: hlsPlaylistName.trim() || null,
      enabled_for_ai: enabledForAi,
      enabled_for_recording: enabledForRecording,
      status,
    })
    setName('')
    setLocationId('')
    setRtspUrl('')
    setLocation('')
    setMapX('')
    setMapY('')
    setHlsPlaylistName('')
    setEnabledForAi(true)
    setEnabledForRecording(true)
    setStatus('unknown')
    setIsModalOpen(false)
  }

  function openEditModal(cameraId: number) {
    const camera = cameras.find((c) => c.id === cameraId)
    if (!camera) return
    setEditingCameraId(camera.id)
    setName(camera.name)
    setLocationId(camera.location_id ?? '')
    setRtspUrl(camera.rtsp_url || '')
    setLocation(camera.location || '')
    setMapX(camera.map_x == null ? '' : String(camera.map_x))
    setMapY(camera.map_y == null ? '' : String(camera.map_y))
    setHlsPlaylistName(camera.hls_playlist_name || '')
    setEnabledForAi(camera.enabled_for_ai)
    setEnabledForRecording(camera.enabled_for_recording)
    setStatus((camera.status as 'unknown' | 'online' | 'offline' | 'error') || 'unknown')
    setIsEditModalOpen(true)
  }

  async function onSubmitEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingCameraId) return
    await editCamera(editingCameraId, {
      name,
      location_id: locationId === '' ? null : Number(locationId),
      rtsp_url: rtspUrl.trim() || null,
      location: location.trim() || null,
      map_x: mapX.trim() ? Number(mapX) : null,
      map_y: mapY.trim() ? Number(mapY) : null,
      hls_playlist_name: hlsPlaylistName.trim() || null,
      enabled_for_ai: enabledForAi,
      enabled_for_recording: enabledForRecording,
      status,
    })
    setIsEditModalOpen(false)
    setEditingCameraId(null)
    setName('')
    setLocationId('')
    setRtspUrl('')
    setLocation('')
    setMapX('')
    setMapY('')
    setHlsPlaylistName('')
    setEnabledForAi(true)
    setEnabledForRecording(true)
    setStatus('unknown')
  }

  return (
    <section className="workers-page">
      <h1>GESTÃO DE CÂMERAS</h1>

      <div className="workers-card">
        <div className="workers-toolbar">
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Cadastrar Câmera
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-wrap workers-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Local</th>
                  <th>RTSP/URL</th>
                  <th>Localização</th>
                  <th>Playlist HLS</th>
                  <th>IA</th>
                  <th>Gravação</th>
                  <th>Status</th>
                  <th>Ativa</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCameras.map((camera, index) => (
                  <tr key={camera.id}>
                    <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td>{camera.name}</td>
                    <td>
                      {camera.location_id
                        ? `${locationsById.get(camera.location_id)?.name || `#${camera.location_id}`}`
                        : '-'}
                    </td>
                    <td className="table-truncate" title={camera.rtsp_url || '-'}>
                      {camera.rtsp_url || '-'}
                    </td>
                    <td>{camera.location || '-'}</td>
                    <td>{camera.hls_playlist_name || '-'}</td>
                    <td>{camera.enabled_for_ai ? 'Sim' : 'Não'}</td>
                    <td>{camera.enabled_for_recording ? 'Sim' : 'Não'}</td>
                    <td>{cameraStatusLabel(camera.status)}</td>
                    <td>{camera.is_active ? 'Sim' : 'Não'}</td>
                    <td>
                      <button type="button" className="secondary-btn" onClick={() => openEditModal(camera.id)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {cameras.length === 0 && (
                  <tr>
                    <td colSpan={11}>Nenhuma câmera encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {cameras.length > 0 && (
          <div className="table-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Cadastrar câmera</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                X
              </button>
            </div>
            <form className="modal-form" onSubmit={onSubmit}>
              <input
                placeholder="Nome da câmera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>
                Localização hierárquica
                <select value={locationId} onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sem vínculo</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({locationTypeLabel(loc.type)})
                    </option>
                  ))}
                </select>
              </label>
              <input
                placeholder="RTSP/URL (opcional)"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
              />
              <input
                placeholder="Localização (opcional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <label>Posição da câmera no mapa (clique para marcar)</label>
              <MapCoordinatePicker
                mapImagePath={selectedLocationMapImage}
                mapX={mapX}
                mapY={mapY}
                onPick={(x, y) => {
                  setMapX(x)
                  setMapY(y)
                }}
                onClear={() => {
                  setMapX('')
                  setMapY('')
                }}
              />
              <input
                placeholder="Playlist HLS (opcional)"
                value={hlsPlaylistName}
                onChange={(e) => setHlsPlaylistName(e.target.value)}
              />
              <label>
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="unknown">Desconhecido</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="error">Erro</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enabledForAi}
                  onChange={(e) => setEnabledForAi(e.target.checked)}
                />
                Habilitar para IA
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enabledForRecording}
                  onChange={(e) => setEnabledForRecording(e.target.checked)}
                />
                Habilitar gravação
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={submitting || !name.trim()}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Editar câmera</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                X
              </button>
            </div>
            <form className="modal-form" onSubmit={onSubmitEdit}>
              <input
                placeholder="Nome da câmera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>
                Localização hierárquica
                <select value={locationId} onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sem vínculo</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({locationTypeLabel(loc.type)})
                    </option>
                  ))}
                </select>
              </label>
              <input
                placeholder="RTSP/URL (opcional)"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
              />
              <input
                placeholder="Localização (opcional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <label>Posição da câmera no mapa (clique para marcar)</label>
              <MapCoordinatePicker
                mapImagePath={selectedLocationMapImage}
                mapX={mapX}
                mapY={mapY}
                onPick={(x, y) => {
                  setMapX(x)
                  setMapY(y)
                }}
                onClear={() => {
                  setMapX('')
                  setMapY('')
                }}
              />
              <input
                placeholder="Playlist HLS (opcional)"
                value={hlsPlaylistName}
                onChange={(e) => setHlsPlaylistName(e.target.value)}
              />
              <label>
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="unknown">Desconhecido</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="error">Erro</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enabledForAi}
                  onChange={(e) => setEnabledForAi(e.target.checked)}
                />
                Habilitar para IA
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enabledForRecording}
                  onChange={(e) => setEnabledForRecording(e.target.checked)}
                />
                Habilitar gravação
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={submitting || !name.trim()}>
                  {submitting ? 'Atualizando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

