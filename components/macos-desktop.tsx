"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MenuBar } from "./menu-bar"
import { Dock } from "./dock"
import { Window } from "./window"
import { DesktopIcon } from "./desktop-icon"
import { Spotlight } from "./spotlight"
import { ContextMenu } from "./context-menu"
import { NotificationCenter } from "./notification-center"
import { Launchpad } from "./launchpad"
import { AboutThisMac } from "./about-this-mac"
import { ControlCenter } from "./control-center"
import { Finder } from "./apps/finder"
import { Safari } from "./apps/safari"
import { Messages } from "./apps/messages"
import { Settings } from "./apps/settings"
import { Calendar } from "./apps/calendar"
import { Photos } from "./apps/photos"
import { Music } from "./apps/music"
import { Notes } from "./apps/notes"
import { VSCode } from "./apps/vscode"
import { Terminal } from "./apps/terminal"
import { Docker } from "./apps/docker"
import { GitBash } from "./apps/git-bash"
import { DownloadsIcon } from "./app-icons"
import { ClockWidget } from "./widgets/clock-widget"
import { CalendarWidget } from "./widgets/calendar-widget"
import { AnimatedWallpaper } from "./animated-wallpaper"

export type AppType =
  | "finder"
  | "safari"
  | "messages"
  | "settings"
  | "calendar"
  | "photos"
  | "music"
  | "notes"
  | "vscode"
  | "terminal"
  | "docker"
  | "git"

export interface WindowState {
  id: string
  app: AppType
  title: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

interface ContextMenuState {
  x: number
  y: number
  items: Array<{ label: string; action: () => void; divider?: boolean }>
}

export function MacOSDesktop() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(10)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)
  const [launchpadOpen, setLaunchpadOpen] = useState(false)
  const [activeApp, setActiveApp] = useState<string>("Finder")
  const [aboutThisMacOpen, setAboutThisMacOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault()
        setSpotlightOpen(true)
      }
      if (e.key === "Escape") {
        setSpotlightOpen(false)
        setLaunchpadOpen(false)
        setContextMenu(null)
      }
      if (e.key === "F4" || (e.ctrlKey && e.key === "ArrowUp")) {
        e.preventDefault()
        setLaunchpadOpen(!launchpadOpen)
      }
    }

    const handleClick = () => {
      setContextMenu(null)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleClick)
    }
  }, [launchpadOpen])

  const openApp = (app: AppType, title: string) => {
    setLaunchpadOpen(false)
    setActiveApp(title)
    const existingWindow = windows.find((w) => w.app === app && !w.isMinimized)

    if (existingWindow) {
      focusWindow(existingWindow.id)
      const dockIcon = document.querySelector(`[data-app="${app}"]`)
      if (dockIcon) {
        dockIcon.classList.add("animate-bounce")
        setTimeout(() => dockIcon.classList.remove("animate-bounce"), 500)
      }
      return
    }

    const minimizedWindow = windows.find((w) => w.app === app && w.isMinimized)
    if (minimizedWindow) {
      unminimizeWindow(minimizedWindow.id)
      return
    }

    const newWindow: WindowState = {
      id: `${app}-${Date.now()}`,
      app,
      title,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + windows.length * 30, y: 80 + windows.length * 30 },
      size: { width: 900, height: 600 },
      zIndex: highestZIndex + 1,
    }

    setWindows([...windows, newWindow])
    setHighestZIndex(highestZIndex + 1)
  }

  const closeWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const unminimizeWindow = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)))
    setHighestZIndex(highestZIndex + 1)
  }

  const maximizeWindow = (id: string) => {
    setWindows(
      windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: !w.isMaximized,
              position: w.isMaximized ? w.position : { x: 0, y: 28 },
              size: w.isMaximized ? w.size : { width: window.innerWidth, height: window.innerHeight - 28 - 80 },
            }
          : w,
      ),
    )
  }

  const focusWindow = (id: string) => {
    const newZIndex = highestZIndex + 1
    setWindows(windows.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w)))
    setHighestZIndex(newZIndex)
    const window = windows.find((w) => w.id === id)
    if (window) {
      setActiveApp(window.title)
    }
  }

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, position } : w)))
  }

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, size } : w)))
  }

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "New Folder", action: () => console.log("New folder") },
        { label: "Get Info", action: () => console.log("Get info") },
        { divider: true, label: "", action: () => {} },
        { label: "Change Desktop Background...", action: () => openApp("settings", "Settings") },
        { divider: true, label: "", action: () => {} },
        { label: "Show View Options", action: () => console.log("View options") },
      ],
    })
  }

  const renderAppContent = (app: AppType, title: string) => {
    switch (app) {
      case "finder":
        return <Finder initialFolder={title} />
      case "safari":
        return <Safari />
      case "messages":
        return <Messages />
      case "settings":
        return <Settings />
      case "calendar":
        return <Calendar />
      case "photos":
        return <Photos />
      case "music":
        return <Music />
      case "notes":
        return <Notes />
      case "vscode":
        return <VSCode />
      case "terminal":
        return <Terminal />
      case "docker":
        return <Docker />
      case "git":
        return <GitBash />
      default:
        return <div className="p-8">App content</div>
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#2d5a7b]" />
      <AnimatedWallpaper />

      <div className="absolute inset-0" onContextMenu={handleDesktopContextMenu}>
        <div className="absolute top-20 md:top-32 right-4 md:right-8 flex flex-col gap-4 md:gap-6">
          <DesktopIcon icon={DownloadsIcon} label="Downloads" onDoubleClick={() => openApp("finder", "Downloads")} />
        </div>

        <div className="absolute bottom-24 md:bottom-32 left-4 md:left-8 flex flex-col gap-4">
          <ClockWidget />
          <CalendarWidget />
        </div>
      </div>

      <MenuBar
        currentTime={currentTime}
        activeApp={activeApp}
        onSpotlightClick={() => setSpotlightOpen(true)}
        onNotificationClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
        onAboutThisMac={() => setAboutThisMacOpen(true)}
        onControlCenterClick={() => setControlCenterOpen(!controlCenterOpen)}
      />

      {windows.map(
        (window) =>
          !window.isMinimized && (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              position={window.position}
              size={window.size}
              zIndex={window.zIndex}
              isMaximized={window.isMaximized}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => focusWindow(window.id)}
              onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
              onSizeChange={(size) => updateWindowSize(window.id, size)}
            >
              {renderAppContent(window.app, window.title)}
            </Window>
          ),
      )}

      <Dock
        onAppClick={openApp}
        minimizedWindows={windows.filter((w) => w.isMinimized)}
        onUnminimize={unminimizeWindow}
        onLaunchpadClick={() => setLaunchpadOpen(!launchpadOpen)}
        openApps={windows.map((w) => w.app)}
      />

      {spotlightOpen && <Spotlight onClose={() => setSpotlightOpen(false)} onOpenApp={openApp} />}

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} />}

      {notificationCenterOpen && <NotificationCenter onClose={() => setNotificationCenterOpen(false)} />}

      {launchpadOpen && <Launchpad onClose={() => setLaunchpadOpen(false)} onOpenApp={openApp} />}

      {aboutThisMacOpen && <AboutThisMac onClose={() => setAboutThisMacOpen(false)} />}

      {controlCenterOpen && <ControlCenter onClose={() => setControlCenterOpen(false)} />}
    </div>
  )
}
