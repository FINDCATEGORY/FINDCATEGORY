"use client"

import { useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, Film, Share2 } from "lucide-react"

interface QuickTimePlayerProps {
  videoUrl?: string
  title?: string
  onClose?: () => void
}

export function QuickTimePlayer({
  videoUrl = "https://www.youtube.com/embed/p1oE_mI9FkE?autoplay=1&rel=0",
  title = "Product_Review.mp4",
  onClose,
}: QuickTimePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  // YouTube Embed URL 변환
  const getEmbedSrc = (url: string) => {
    if (url.includes("embed/")) {
      return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1&rel=0`
    }
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`
    }
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`
    }
    return url
  }

  const embedSrc = getEmbedSrc(videoUrl)

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white font-sans select-none overflow-hidden">
      {/* QuickTime Player 컨트롤 상단 바 */}
      <div className="h-8 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Film className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-medium truncate max-w-[280px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-rose-600/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 font-semibold">
            QuickTime • YouTube Stream
          </span>
          <button
            onClick={() => window.open(videoUrl.replace("/embed/", "/watch?v="), "_blank")}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
            title="유튜브 웹페이지에서 열기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 비디오 프레임 영역 (데스크톱 위에서 재생) */}
      <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden">
        <iframe
          src={embedSrc}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* QuickTime Player 하단 컨트롤 바 */}
      <div className="h-10 bg-zinc-900/95 border-t border-zinc-800/80 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>HD 1080p</span>
            <span>•</span>
            <span className="text-zinc-500">macOS Desktop Player</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

