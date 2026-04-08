import { OVERLAY_LERP_ALPHA } from './constants'

export interface OverlayTrackState {
  track_id: string
  person_type: string | null
  worker_name: string | null
  risk_level: string | null
  occurred_at: string | null
  bbox: [number, number, number, number]
  displayBbox: [number, number, number, number]
  lastSeenMs: number
}

export function lerp(a: number, b: number, alpha = OVERLAY_LERP_ALPHA): number {
  return a + (b - a) * alpha
}

export function lerpBbox(
  from: [number, number, number, number],
  to: [number, number, number, number],
): [number, number, number, number] {
  return [
    lerp(from[0], to[0]),
    lerp(from[1], to[1]),
    lerp(from[2], to[2]),
    lerp(from[3], to[3]),
  ]
}

