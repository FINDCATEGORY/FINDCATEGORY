"use client"

import type React from "react"

import { useState } from "react"
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

export function Dock({ onAppClick, onQuitApp, minimizedWindows, onUnminimize, onLaunchpadClick, openApps }: DockProps) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ app: AppType; x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, app: AppType) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ app, x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[var(--macos-dock-bg)] macos-blur macos-dock-shadow rounded-2xl p-1.5 md:p-2 flex items-end gap-1 md:gap-1.5 border border-white/20 dark:border-white/15 transition-colors max-w-[calc(100vw-1rem)]">
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
                transform: hoveredApp === "launchpad" ? "scale(1.2) translateY(-8px)" : "scale(1)",
              }}
              onClick={onLaunchpadClick}
              onMouseEnter={() => setHoveredApp("launchpad")}
              onMouseLeave={() => setHoveredApp(null)}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl shadow-lg overflow-hidden">
                <LaunchpadIcon />
              </div>
            </button>
          </div>

          <div className="w-px h-9 md:h-12 bg-white/30 dark:bg-white/15 mx-0.5 md:mx-1 shrink-0" />

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
                    transform: isHovered ? "scale(1.2) translateY(-8px)" : "scale(1)",
                  }}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  onClick={() => onAppClick(app.id, app.label)}
                  onContextMenu={(e) => handleContextMenu(e, app.id)}
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl shadow-lg overflow-hidden">
                    <IconComponent />
                  </div>

                  {/* Running indicator */}
                  {isOpen && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-700 dark:bg-white/80 rounded-full" />
                  )}
                </button>
              </div>
            )
          })}

          {/* Divider */}
          {minimizedWindows.length > 0 && <div className="w-px h-12 bg-white/30 dark:bg-white/15 mx-1" />}

          {/* Minimized windows */}
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
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-white/50 dark:bg-zinc-800/70 flex items-center justify-center text-xl md:text-2xl shadow-lg transition-transform duration-200 ease-out"
                  style={{
                    transform: isHovered ? "scale(1.2) translateY(-8px)" : "scale(1)",
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
