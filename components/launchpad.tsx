"use client"

import type { AppType } from "./macos-desktop"
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
} from "./app-icons"

interface LaunchpadProps {
  onClose: () => void
  onOpenApp: (app: AppType, title: string) => void
}

const apps = [
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

export function Launchpad({ onClose, onOpenApp }: LaunchpadProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[90] flex items-center justify-center p-8 md:p-20"
      onClick={onClose}
    >
      <div
        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-6 md:gap-8 max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        {apps.map((app, index) => {
          const IconComponent = app.icon
          return (
            <button
              key={index}
              className="flex flex-col items-center gap-2 group"
              onClick={() => {
                if ("id" in app) {
                  onOpenApp(app.id, app.label)
                }
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform overflow-hidden">
                <IconComponent />
              </div>
              <span className="text-white text-xs sm:text-sm font-medium max-w-full truncate px-1">{app.label}</span>
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
