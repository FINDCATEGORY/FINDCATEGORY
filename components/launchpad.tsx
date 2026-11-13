"use client"

import { useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import type { AppType } from "./macos-desktop"
import {
  FinderIcon,
  SafariIcon,
  MessagesIcon,
  NotesIcon,
  TerminalIcon,
  SettingsIcon,
} from "./app-icons"

interface LaunchpadProps {
  onClose: () => void
  onOpenApp: (app: AppType, title: string) => void
}

const apps = [
  { id: "finder" as AppType, icon: FinderIcon, label: "Finder", koreanLabel: "영상" },
  { id: "safari" as AppType, icon: SafariIcon, label: "Safari", koreanLabel: "게시판" },
  { id: "messages" as AppType, icon: MessagesIcon, label: "Messages", koreanLabel: "채팅" },
  { id: "notes" as AppType, icon: NotesIcon, label: "Notes", koreanLabel: "소식" },
  { id: "terminal" as AppType, icon: TerminalIcon, label: "Terminal", koreanLabel: "터미널" },
  { id: "settings" as AppType, icon: SettingsIcon, label: "Settings", koreanLabel: "설정" },
]

export function Launchpad({ onClose, onOpenApp }: LaunchpadProps) {
  const mountTimeRef = useRef(Date.now())

  useEffect(() => {
    mountTimeRef.current = Date.now()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // 배경 클릭 핸들러 (마운트 직후 300ms 내 잔여 클릭 이벤트 무시 & 배경 자체 클릭 시에만 닫기)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (Date.now() - mountTimeRef.current < 300) {
        return
      }
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 sm:p-8 md:p-16 select-none animate-in fade-in duration-150 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* 우측 상단 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-8 md:right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
        title="닫기 (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-10 max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {apps.map((app, index) => {
          const IconComponent = app.icon
          return (
            <button
              key={index}
              className="flex flex-col items-center gap-2 sm:gap-2.5 group cursor-pointer focus:outline-none"
              onClick={() => {
                if ("id" in app) {
                  onOpenApp(app.id, app.label)
                }
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-[22%] shadow-lg group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
                <IconComponent />
              </div>
              <div className="flex items-center justify-center gap-1 text-white text-[11px] sm:text-xs md:text-sm font-medium max-w-full drop-shadow-md whitespace-nowrap">
                <span>{app.label}</span>
                <span className="text-white/80 font-normal">{app.koreanLabel}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Page indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-white" />
        <div className="w-2 h-2 rounded-full bg-white/40" />
        <div className="w-2 h-2 rounded-full bg-white/40" />
      </div>
    </div>
  )
}
