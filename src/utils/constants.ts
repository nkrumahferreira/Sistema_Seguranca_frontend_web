export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000'

export const TRACK_POLL_INTERVAL_MS = 1000
export const EVENTS_POLL_INTERVAL_MS = 7000
export const OVERLAY_MAX_AGE_MS = 5000
export const TRACK_TTL_MS = 4000
export const DELAY_COMPENSATION_MS = 2000
export const OVERLAY_LERP_ALPHA = 0.2

