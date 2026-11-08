"use client"

import type React from "react"

import { useState } from "react"
import type { AppType, WindowState } from "./macos-desktop"
import {
  FinderIcon,
  SafariIcon,
  MessagesIcon,
  CalendarIcon,
  PhotosIcon,
  MusicIcon,
  NotesIcon,
  VSCodeIcon,
  TerminalIcon,
  DockerIcon,
  GitIcon,
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
  { id: "calendar" as AppType, icon: CalendarIcon, label: "Calendar" },
  { id: "photos" as AppType, icon: PhotosIcon, label: "Photos" },
  { id: "music" as AppType, icon: MusicIcon, label: "Music" },
  { id: "notes" as AppType, icon: NotesIcon, label: "Notes" },
  { id: "vscode" as AppType, icon: VSCodeIcon, label: "VS Code" },
  { id: "terminal" as AppType, icon: TerminalIcon, label: "Terminal" },
  { id: "docker" as AppType, icon: DockerIcon, label: "Docker" },
  { id: "git" as AppType, icon: GitIcon, label: "Git Bash" },
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
          <button
            className="relative group transition-transform duration-200 ease-out"
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
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Launchpad
            </div>
          </button>

          <div className="w-px h-12 bg-white/30 mx-1" />

          {dockApps.map((app, index) => {
            const isHovered = hoveredApp === app.id
            const isOpen = openApps.includes(app.id)
            const IconComponent = app.icon

            return (
              <button
                key={app.id}
                data-app={app.id}
                className="relative group transition-transform duration-200 ease-out"
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

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {app.label}
                </div>

                {/* Running indicator */}
                {isOpen && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-700 rounded-full" />
                )}
              </button>
            )
          })}

          {/* Divider */}
          {minimizedWindows.length > 0 && <div className="w-px h-12 bg-white/30 mx-1" />}

          {/* Minimized windows */}
          {minimizedWindows.map((window) => (
            <button
              key={window.id}
              className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
              onClick={() => onUnminimize(window.id)}
            >
              📄
            </button>
          ))}
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
