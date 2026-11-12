"use client"

import {
  Volume2,
  Volume1,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react"
import {
  useSystemControls,
  playVolumePreviewTone,
} from "@/lib/system-controls"

interface ControlCenterProps {
  onClose: () => void
}

export function ControlCenter({ onClose }: ControlCenterProps) {
  const { controls, isDarkMode, setSystemControls } = useSystemControls()

  const handleVolumeChange = (nextVal: number) => {
    setSystemControls((prev) => ({
      ...prev,
      volume: nextVal,
      isMuted: nextVal === 0,
    }))
  }

  const handleToggleMute = () => {
    const updated = setSystemControls((prev) => {
      const nextMuted = !prev.isMuted
      const nextVolume = !nextMuted && prev.volume === 0 ? 50 : prev.volume
      return {
        ...prev,
        isMuted: nextMuted,
        volume: nextVolume,
      }
    })
    if (!updated.isMuted) {
      playVolumePreviewTone(updated.volume, false)
    }
    fetch("/api/sound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: updated.isMuted ? "mute" : "unmute" }),
    }).catch(() => { })
  }

  const handleBrightnessChange = (nextBrightness: number) => {
    setSystemControls((prev) => ({
      ...prev,
      brightness: nextBrightness,
    }))
  }

  const handleToggleDarkMode = () => {
    setSystemControls((prev) => ({
      ...prev,
      appearanceMode: isDarkMode ? "light" : "dark",
    }))
  }

  const VolumeIcon =
    controls.isMuted || controls.volume === 0
      ? VolumeX
      : controls.volume < 50
        ? Volume1
        : Volume2

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        className="absolute top-8 right-4 w-80 bg-[var(--macos-menu-bg)] macos-blur border border-black/10 dark:border-white/15 rounded-2xl shadow-2xl p-4 space-y-3 animate-scale-in text-slate-800 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Volume */}
        <div className="p-4 rounded-xl bg-white/60 dark:bg-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="flex items-center gap-2.5 text-gray-700 dark:text-zinc-200 hover:opacity-80 cursor-pointer"
              title={controls.isMuted ? "음소거 해제" : "음소거"}
            >
              <VolumeIcon className="w-5 h-5" />
              <span className="font-semibold">Volume</span>
            </button>
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              {controls.isMuted || controls.volume === 0 ? "Muted" : `${controls.volume}%`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={controls.isMuted ? 0 : controls.volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            onMouseUp={() => playVolumePreviewTone(controls.volume, controls.isMuted)}
            onTouchEnd={() => playVolumePreviewTone(controls.volume, controls.isMuted)}
            onKeyUp={() => playVolumePreviewTone(controls.volume, controls.isMuted)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div className="p-4 rounded-xl bg-white/60 dark:bg-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 text-gray-700 dark:text-zinc-200">
              <Sun className="w-5 h-5" />
              <span className="font-semibold">Brightness</span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
              {controls.brightness}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={controls.brightness}
            onChange={(e) => handleBrightnessChange(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Dark Mode */}
        <button
          type="button"
          className={`w-full text-left p-4 rounded-xl cursor-pointer transition-all ${isDarkMode
              ? "bg-zinc-900 text-white border border-white/10"
              : "bg-white/60 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-200"
            }`}
          onClick={handleToggleDarkMode}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6" />
              <div>
                <div className="font-semibold">Dark Mode</div>
                <div className="text-sm opacity-80">{isDarkMode ? "On" : "Off"}</div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
