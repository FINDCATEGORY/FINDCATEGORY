"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import type { AppType, WindowState } from "./macos-desktop"
import {
  FinderIcon,
  SafariIcon,
  MessagesIcon,
  NotesIcon,
  TerminalIcon,
  SettingsIcon,
  LaunchpadIcon,
} from "./app-icons"

interface DockProps {
  onAppClick: (app: AppType, title: string) => void
  onQuitApp?: (app: AppType) => void
  minimizedWindows: WindowState[]
  onUnminimize: (id: string) => void
  onLaunchpadClick: () => void
  openApps: AppType[]
}

export const dockApps = [
  { id: "finder" as AppType, icon: FinderIcon, label: "Finder", subLabel: "브랜드영상보기" },
  { id: "safari" as AppType, icon: SafariIcon, label: "Safari", subLabel: "게시판" },
  { id: "messages" as AppType, icon: MessagesIcon, label: "Messages", subLabel: "채팅" },
  { id: "notes" as AppType, icon: NotesIcon, label: "Notes", subLabel: "공지" },
  { id: "terminal" as AppType, icon: TerminalIcon, label: "Terminal", subLabel: "터미널" },
  { id: "settings" as AppType, icon: SettingsIcon, label: "Settings", subLabel: "설정" },
]

export function Dock({
  onAppClick,
  onQuitApp,
  minimizedWindows,
  onUnminimize,
  onLaunchpadClick,
  openApps,
}: DockProps) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ app: AppType; x: number; y: number } | null>(null)

  // 화면 양옆 여백 기반 자동 크기 계산 + 양옆 드래그 수동 미세 조절
  const [autoIconSize, setAutoIconSize] = useState<number>(56)
  const [userDelta, setUserDelta] = useState<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; delta: number; side: "left" | "right" } | null>(null)

  // 화면 너비 감지 및 양옆 여백에 맞춘 자동 아이콘 크기 계산
  useEffect(() => {
    const calculateOptimalSize = () => {
      if (typeof window === "undefined") return
      const screenWidth = window.innerWidth
      const isMobile = screenWidth < 768

      // 모바일에서는 노트 앱이 시계 위로 이동하므로 독에서 숨김 -> 앱 5개 + 런치패드 1개 = 6개
      // PC(md 이상)에서는 앱 6개 + 런치패드 1개 = 7개
      const visibleAppsCount = isMobile ? 5 : 6
      const totalItems = 1 + visibleAppsCount + minimizedWindows.length

      // 양옆 여백(모바일 좌우 14px씩 총 28px, PC 좌우 32px씩 총 64px)을 확보한 사용 가능 너비
      const maxAvailableWidth = Math.min(
        screenWidth - (isMobile ? 28 : 64),
        isMobile ? 480 : 860,
      )

      // 핸들(좌우 각 8px) + 패딩(16px) + 구분선(10px) + 아이템 사이 간격
      const gap = isMobile ? 6 : 8
      const overhead = 16 + 16 + 10 + (totalItems - 1) * gap

      const computedSize = Math.floor((maxAvailableWidth - overhead) / totalItems)

      // 모바일에서는 50px ~ 62px, PC에서는 56px ~ 68px로 자동 클램핑하여 시원시원한 크기 유지
      const minSize = isMobile ? 50 : 56
      const maxSize = isMobile ? 62 : 68
      const clamped = Math.max(minSize, Math.min(maxSize, computedSize))

      setAutoIconSize(clamped)
    }

    calculateOptimalSize()
    window.addEventListener("resize", calculateOptimalSize)
    return () => window.removeEventListener("resize", calculateOptimalSize)
  }, [minimizedWindows.length])

  // 최종 아이콘 크기 (자동 크기 + 사용자 조절 델타)
  const currentIconSize = useMemo(() => {
    return Math.max(44, Math.min(74, autoIconSize + userDelta))
  }, [autoIconSize, userDelta])

  // 양옆 핸들 마우스/터치 드래그 리사이즈 핸들러
  const startDrag = (e: React.MouseEvent | React.TouchEvent, side: "left" | "right") => {
    e.preventDefault()
    e.stopPropagation()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    dragStartRef.current = { x: clientX, delta: userDelta, side }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const diffX = clientX - dragStartRef.current.x
      const factor = dragStartRef.current.side === "right" ? 1 : -1
      const addedDelta = Math.round((diffX * factor) / 4)
      const nextDelta = Math.max(-16, Math.min(20, dragStartRef.current.delta + addedDelta))
      setUserDelta(nextDelta)
    }

    const handleEnd = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", handleEnd)
    window.addEventListener("touchcancel", handleEnd)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
      window.removeEventListener("touchcancel", handleEnd)
    }
  }, [isDragging])

  const resetToAuto = () => {
    setUserDelta(0)
  }

  const handleContextMenu = (e: React.MouseEvent, app: AppType) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ app, x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div
          className={`bg-[var(--macos-dock-bg)] macos-blur macos-dock-shadow rounded-2xl p-1.5 md:p-2 flex items-end gap-1 md:gap-1.5 border border-white/20 dark:border-white/15 transition-all duration-150 max-w-[calc(100vw-1rem)] ${
            isDragging ? "select-none ring-2 ring-blue-500/40" : ""
          }`}
        >
          {/* 좌측 크기 조절 핸들 (드래그하여 크기 조절 / 더블클릭 시 자동 맞춤) */}
          <div
            className="flex items-center justify-center h-full px-1 py-1 cursor-ew-resize select-none touch-none group/handle shrink-0 self-center"
            title="좌우로 드래그: 독 크기 조절 / 더블클릭: 자동 맞춤"
            onMouseDown={(e) => startDrag(e, "left")}
            onTouchStart={(e) => startDrag(e, "left")}
            onDoubleClick={resetToAuto}
          >
            <div className="w-1 h-5 rounded-full bg-white/20 group-hover/handle:bg-white/60 transition-colors" />
          </div>

          {/* Launchpad icon */}
          <div className="relative group flex flex-col items-center">
            {/* macOS Tooltip / 말풍선 */}
            <div
              className={`pointer-events-none absolute -top-12 z-50 flex flex-col items-center transition-all duration-150 ease-out ${
                hoveredApp === "launchpad"
                  ? "opacity-100 -translate-y-1"
                  : "opacity-0 translate-y-0"
              }`}
            >
              <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                <span>Launchpad</span>
                <span className="text-[11px] font-normal text-white/70">모아보기</span>
              </div>
              <div className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-gray-900/85" />
            </div>

            <button
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: hoveredApp === "launchpad" ? "scale(1.15) translateY(-6px)" : "scale(1)",
              }}
              onClick={onLaunchpadClick}
              onMouseEnter={() => setHoveredApp("launchpad")}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <div
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-150"
                style={{ width: `${currentIconSize}px`, height: `${currentIconSize}px` }}
              >
                <LaunchpadIcon />
              </div>
            </button>
          </div>

          {/* 구분선 */}
          <div
            className="w-px bg-white/30 dark:bg-white/15 mx-0.5 md:mx-1 shrink-0 self-center transition-all duration-150"
            style={{ height: `${Math.max(26, currentIconSize - 12)}px` }}
          />

          {/* 앱 아이콘들 */}
          {dockApps.map((app) => {
            const isHovered = hoveredApp === app.id
            const isOpen = openApps.includes(app.id)
            const IconComponent = app.icon

            return (
              <div
                key={app.id}
                className={`relative group flex-col items-center ${
                  app.id === "notes" ? "hidden md:flex" : "flex"
                }`}
              >
                {/* macOS Tooltip / 말풍선 */}
                <div
                  className={`pointer-events-none absolute -top-12 z-50 flex flex-col items-center transition-all duration-150 ease-out ${
                    isHovered ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"
                  }`}
                >
                  <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <span>{app.label}</span>
                    <span className="text-[11px] font-normal text-white/70">{app.subLabel}</span>
                  </div>
                  <div className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-gray-900/85" />
                </div>

                <button
                  data-app={app.id}
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: isHovered ? "scale(1.15) translateY(-6px)" : "scale(1)",
                  }}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  onClick={() => onAppClick(app.id, app.label)}
                  onContextMenu={(e) => handleContextMenu(e, app.id)}
                >
                  <div
                    className="rounded-xl shadow-lg overflow-hidden transition-all duration-150"
                    style={{ width: `${currentIconSize}px`, height: `${currentIconSize}px` }}
                  >
                    <IconComponent />
                  </div>

                  {/* 실행 중 표시 점 */}
                  {isOpen && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-700 dark:bg-white/80 rounded-full" />
                  )}
                </button>
              </div>
            )
          })}

          {/* 최소화된 윈도우 구분선 */}
          {minimizedWindows.length > 0 && (
            <div
              className="w-px bg-white/30 dark:bg-white/15 mx-0.5 md:mx-1 shrink-0 self-center transition-all duration-150"
              style={{ height: `${Math.max(26, currentIconSize - 12)}px` }}
            />
          )}

          {/* 최소화된 윈도우들 */}
          {minimizedWindows.map((window) => {
            const isHovered = hoveredApp === window.id

            return (
              <div key={window.id} className="relative group flex flex-col items-center">
                {/* macOS Tooltip / 말풍선 */}
                <div
                  className={`pointer-events-none absolute -top-12 z-50 flex flex-col items-center transition-all duration-150 ease-out ${
                    isHovered ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"
                  }`}
                >
                  <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10">
                    {window.title}
                  </div>
                  <div className="h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-gray-900/85" />
                </div>

                <button
                  className="rounded-xl bg-white/50 dark:bg-zinc-800/70 flex items-center justify-center text-xl md:text-2xl shadow-lg transition-transform duration-200 ease-out"
                  style={{
                    width: `${currentIconSize}px`,
                    height: `${currentIconSize}px`,
                    transform: isHovered ? "scale(1.15) translateY(-6px)" : "scale(1)",
                  }}
                  onMouseEnter={() => setHoveredApp(window.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  onClick={() => onUnminimize(window.id)}
                >
                  📄
                </button>
              </div>
            )
          })}

          {/* 우측 크기 조절 핸들 (드래그하여 크기 조절 / 더블클릭 시 자동 맞춤) */}
          <div
            className="flex items-center justify-center h-full px-1 py-1 cursor-ew-resize select-none touch-none group/handle shrink-0 self-center"
            title="좌우로 드래그: 독 크기 조절 / 더블클릭: 자동 맞춤"
            onMouseDown={(e) => startDrag(e, "right")}
            onTouchStart={(e) => startDrag(e, "right")}
            onDoubleClick={resetToAuto}
          >
            <div className="w-1 h-5 rounded-full bg-white/20 group-hover/handle:bg-white/60 transition-colors" />
          </div>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed bg-[var(--macos-menu-bg)] macos-blur border border-black/10 dark:border-white/10 rounded-lg shadow-lg py-1 z-[60] min-w-[140px] text-slate-900 dark:text-zinc-100"
            style={{ left: contextMenu.x, top: Math.max(8, contextMenu.y - 48) }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                onQuitApp?.(contextMenu.app)
                setContextMenu(null)
              }}
              className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
            >
              Quit
            </button>
          </div>
        </>
      )}
    </>
  )
}
