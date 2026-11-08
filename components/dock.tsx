"use client"

import type React from "react"

import { useState } from "react"
import type { AppType, WindowState } from "./macos-desktop"
import {
  FinderIcon,
  SafariIcon,
  MessagesIcon,
  PhotosIcon,
  MusicIcon,
  NotesIcon,
  TerminalIcon,
  SettingsIcon,
  LaunchpadIcon,
} from "./app-icons"

interface DockProps {
  onAppClick: (app: AppType, title: string) => void
  minimizedWindows: WindowState[]
  onUnminimize: (id: string) => void
  onLaunchpadClick: () => void
  openApps: AppType[]
}

const dockApps = [
  { id: "finder" as AppType, icon: FinderIcon, label: "Finder" },
  { id: "safari" as AppType, icon: SafariIcon, label: "Safari" },
  { id: "messages" as AppType, icon: MessagesIcon, label: "Messages" },
  { id: "photos" as AppType, icon: PhotosIcon, label: "Photos" },
  { id: "music" as AppType, icon: MusicIcon, label: "Music" },
  { id: "notes" as AppType, icon: NotesIcon, label: "Notes" },
  { id: "terminal" as AppType, icon: TerminalIcon, label: "Terminal" },
  { id: "settings" as AppType, icon: SettingsIcon, label: "Settings" },
]

export function Dock({ onAppClick, minimizedWindows, onUnminimize, onLaunchpadClick, openApps }: DockProps) {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ app: AppType; x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, app: AppType) => {
    e.preventDefault()
    setContextMenu({ app, x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/30 macos-blur macos-dock-shadow rounded-2xl px-2 py-2 flex items-end gap-1 border border-white/20">
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
              <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10">
                Launchpad
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
              <div className="w-14 h-14 rounded-xl shadow-lg overflow-hidden">
                <LaunchpadIcon />
              </div>
            </button>
          </div>

          <div className="w-px h-12 bg-white/30 mx-1" />

          {dockApps.map((app) => {
            const isHovered = hoveredApp === app.id
            const isOpen = openApps.includes(app.id)
            const IconComponent = app.icon

            return (
              <div key={app.id} className="relative group flex flex-col items-center">
                {/* macOS Tooltip / 말풍선 */}
                <div
                  className={`pointer-events-none absolute -top-12 z-50 flex flex-col items-center transition-all duration-150 ease-out ${
                    isHovered ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"
                  }`}
                >
                  <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10">
                    {app.label}
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
                  <div className="w-14 h-14 rounded-xl shadow-lg overflow-hidden">
                    <IconComponent />
                  </div>

                  {/* Running indicator */}
                  {isOpen && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-700 rounded-full" />
                  )}
                </button>
              </div>
            )
          })}

          {/* Divider */}
          {minimizedWindows.length > 0 && <div className="w-px h-12 bg-white/30 mx-1" />}

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
                  className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center text-2xl shadow-lg transition-transform duration-200 ease-out"
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
        <div
          className="fixed bg-[var(--macos-menu-bg)] macos-blur border border-black/10 rounded-lg shadow-lg py-1 z-[60] min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y - 100 }}
          onClick={() => setContextMenu(null)}
        >
          <button className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors">
            Options
          </button>
          <button className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors">
            Show in Finder
          </button>
          <div className="h-px bg-black/10 my-1" />
          <button className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors">
            Quit
          </button>
        </div>
      )}
    </>
  )
}
