import { useEffect, useRef, type RefObject } from 'react'
import { riskColor } from '../../utils/risk'
import type { OverlayTrackState } from '../../utils/tracks'

interface CanvasOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
  tracks: OverlayTrackState[]
}

export function CanvasOverlay({ videoRef, tracks }: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let raf = 0
    const draw = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video) {
        raf = requestAnimationFrame(draw)
        return
      }

      const rect = video.getBoundingClientRect()
      if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
        canvas.width = Math.max(1, Math.floor(rect.width))
        canvas.height = Math.max(1, Math.floor(rect.height))
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        raf = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const vw = video.videoWidth || 0
      const vh = video.videoHeight || 0
      if (!vw || !vh) {
        raf = requestAnimationFrame(draw)
        return
      }
      const sx = canvas.width / vw
      const sy = canvas.height / vh

      for (const trk of tracks) {
        const [x, y, w, h] = trk.displayBbox
        const color = riskColor(trk.risk_level)
        const label = `${trk.person_type || 'person'}${trk.worker_name ? ` (${trk.worker_name})` : ''} | ${
          trk.risk_level || 'normal'
        }`
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.strokeRect(x * sx, y * sy, w * sx, h * sy)
        ctx.fillStyle = color
        ctx.fillRect(x * sx, y * sy - 20, Math.max(90, label.length * 7), 20)
        ctx.fillStyle = '#081019'
        ctx.font = '12px sans-serif'
        ctx.fillText(label, x * sx + 5, y * sy - 6)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [tracks, videoRef])

  return <canvas className="overlay" ref={canvasRef} />
}

