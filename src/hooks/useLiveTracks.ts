import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchLiveTracks } from '../services/tracks'
import {
  DELAY_COMPENSATION_MS,
  OVERLAY_MAX_AGE_MS,
  TRACK_POLL_INTERVAL_MS,
  TRACK_TTL_MS,
} from '../utils/constants'
import type { LiveTrack } from '../types'
import type { OverlayTrackState } from '../utils/tracks'
import { lerpBbox } from '../utils/tracks'

export function useLiveTracks(cameraId?: number) {
  const [tracks, setTracks] = useState<OverlayTrackState[]>([])
  const [rawTracks, setRawTracks] = useState<LiveTrack[]>([])
  const memRef = useRef<Map<string, OverlayTrackState>>(new Map())

  const upsert = useCallback((arr: LiveTrack[]) => {
    const now = Date.now()
    const memory = memRef.current
    for (const t of arr) {
      if (!t.track_id || !t.bbox || t.bbox.length < 4) continue
      const nextBbox: [number, number, number, number] = t.bbox
      const prev = memory.get(t.track_id)
      const display = prev ? lerpBbox(prev.displayBbox, nextBbox) : nextBbox
      memory.set(t.track_id, {
        track_id: t.track_id,
        person_type: t.person_type,
        worker_name: t.worker_name,
        risk_level: t.risk_level ?? 'normal',
        occurred_at: t.occurred_at,
        bbox: nextBbox,
        displayBbox: display,
        lastSeenMs: now,
      })
    }

    for (const [key, value] of memory.entries()) {
      if (now - value.lastSeenMs > TRACK_TTL_MS) {
        memory.delete(key)
      }
    }

    setTracks(Array.from(memory.values()))
  }, [])

  const poll = useCallback(async () => {
    if (!cameraId) return
    try {
      const data = await fetchLiveTracks(cameraId)
      setRawTracks(data)
      upsert(data)
    } catch {
      // fallback silencioso: mantém estado anterior até próximo ciclo
    }
  }, [cameraId, upsert])

  useEffect(() => {
    memRef.current.clear()
    setTracks([])
    if (!cameraId) return
    void poll()
    const id = window.setInterval(() => void poll(), TRACK_POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [cameraId, poll])

  const visibleTracks = useMemo(() => {
    const now = Date.now()
    return tracks.filter((item) => {
      const occurred = item.occurred_at ? Date.parse(item.occurred_at) : now
      if (Number.isNaN(occurred)) return true
      const age = now - occurred
      return age >= DELAY_COMPENSATION_MS && age <= OVERLAY_MAX_AGE_MS
    })
  }, [tracks])

  return { tracks: visibleTracks, rawTracks }
}

