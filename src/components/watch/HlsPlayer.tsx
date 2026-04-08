import { useEffect, type RefObject } from 'react'
import Hls from 'hls.js'

interface HlsPlayerProps {
  src: string | null
  videoRef: RefObject<HTMLVideoElement | null>
}

export function HlsPlayer({ src, videoRef }: HlsPlayerProps) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveDurationInfinity: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      video.play().catch(() => undefined)
      return () => hls.destroy()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => undefined)
    }
  }, [src, videoRef])

  return <video ref={videoRef} className="video" controls autoPlay muted playsInline />
}

