export type RiskLevel = 'normal' | 'suspicious' | 'suspicious_visit' | 'critical'

export interface UserMe {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  bi: string | null
  role: 'owner' | 'authority'
  farm_id: number | null
}

export interface Camera {
  id: number
  farm_id: number
  location_id: number | null
  name: string
  rtsp_url: string | null
  location: string | null
  map_x: number | null
  map_y: number | null
  hls_playlist_name: string | null
  is_active: boolean
  enabled_for_ai: boolean
  enabled_for_recording: boolean
  status: string
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface EventItem {
  id: number
  farm_id: number
  camera_id: number
  track_id: string | null
  person_type: string | null
  worker_id: number | null
  worker_name: string | null
  bbox: { x1: number; y1: number; x2: number; y2: number } | null
  risk_score: number
  risk_level: RiskLevel
  occurred_at: string
  summary: string | null
  alert_owner: boolean
  alert_authorities: boolean
  should_record: boolean
  should_stream_priority: boolean
}

export interface LiveTrack {
  track_id: string
  person_type: string | null
  worker_name: string | null
  bbox: [number, number, number, number] | null
  risk_level: RiskLevel | string | null
  occurred_at: string | null
}

export interface HlsCameraResponse {
  camera_id: number
  playlist_url: string
}

export interface Worker {
  id: number
  farm_id: number
  name: string
  worker_type: string
  document_id: string | null
  photo_path: string | null
  extra_photo_paths: string[]
  has_embedding: boolean
  is_active: boolean
}

export interface WorkerDetail {
  id: number
  farm_id: number
  name: string
  worker_type: string
  document_id: string | null
  photo: {
    mime_type: string
    base64: string
  } | null
  extra_photos: Array<{
    mime_type: string
    base64: string
  }>
  has_embedding: boolean
  is_active: boolean
}

export interface RecordingItem {
  id: number
  event_id: number | null
  camera_id: number
  file_path: string
  duration_seconds: number | null
  started_at: string
  created_at: string
}

export type LocationType = 'property' | 'building' | 'floor' | 'zone'

export interface LocationItem {
  id: number
  farm_id: number
  name: string
  type: LocationType
  parent_id: number | null
  map_image: string | null
  created_at: string
}

export interface LocationTreeItem extends LocationItem {
  children: LocationTreeItem[]
}

export interface DashboardOverview {
  workers_total: number
  workers_active: number
  workers_with_embedding: number
  cameras_total: number
  cameras_active: number
  cameras_online: number
  cameras_offline: number
  cameras_error: number
  active_alerts: number
  critical_alerts_24h: number
  suspicious_alerts_24h: number
  events_24h: number
  recordings_24h: number
  unknown_people_24h: number
}

export interface StatsTimePoint {
  bucket: string
  total: number
}

export interface StatsRiskItem {
  risk_level: string
  total: number
}

export interface StatsCameraItem {
  camera_id: number
  camera_name: string
  total: number
}

