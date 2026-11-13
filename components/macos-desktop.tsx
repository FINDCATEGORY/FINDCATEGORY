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
import { NotificationBanner, showNotification } from "./NotificationBanner"
import { AUTH_CHANGED_EVENT, OPEN_SAFARI_LOGIN_EVENT } from "@/lib/auth"
import { syncMessagesAutoJoin } from "@/lib/messages-room"
import { triggerTemplateNotification } from "@/lib/notification-templates"
import { useSystemControls } from "@/lib/system-controls"
import { Finder } from "./apps/finder"
import { Safari } from "./apps/safari"
import { Messages } from "./apps/messages"
import { Settings } from "./apps/settings"
import { Calendar } from "./apps/calendar"
import { Sound } from "./apps/sound"
import { Notes } from "./apps/notes"
import { VSCode } from "./apps/vscode"
import { Terminal } from "./apps/terminal"
import { Docker } from "./apps/docker"
import { GitBash } from "./apps/git-bash"
import { QuickTimePlayer } from "./apps/quicktime-player"
import { DownloadsIcon, NotesIcon } from "./app-icons"
import { ClockWidget } from "./widgets/clock-widget"
import { CalendarWidget } from "./widgets/calendar-widget"
import { AnimatedWallpaper } from "./animated-wallpaper"

export type AppType =
  | "finder"
  | "safari"
  | "messages"
  | "settings"
  | "calendar"
  | "sound"
  | "music"
  | "notes"
  | "vscode"
  | "terminal"
  | "docker"
  | "git"
  | "quicktime"

export interface WindowState {
  id: string
  app: AppType
  title: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  videoUrl?: string
  initialUrl?: string
  tabTitle?: string
  settingsCategory?: string
  settingsCategoryNonce?: number
  finderFolderId?: string
  finderFolderNonce?: number
}

interface ContextMenuState {
  x: number
  y: number
  items: Array<{ label: string; subLabel?: string; action: () => void; divider?: boolean }>
}

interface MacOSDesktopProps {
  onRestart?: () => void
}

export function MacOSDesktop({ onRestart }: MacOSDesktopProps = {}) {
  const { controls: systemControls } = useSystemControls()
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

  // 데스크톱 진입 시 시스템 환영 알림 배너 및 Messages 자동 참여 동기화
  useEffect(() => {
    syncMessagesAutoJoin()
    const handleAuthSync = () => {
      syncMessagesAutoJoin()
    }
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthSync)
    window.addEventListener("storage", handleAuthSync)

    const welcomeTimer = setTimeout(() => {
      triggerTemplateNotification("welcome", {}, {
        app: "FIND_CATEGORY",
        title: "FINDCATEGORY에 오신 것을 환영합니다",
        message: "비주얼 기반의 브랜드 아카이브를 경험해 보세요.",
        iconType: "findcategory",
      })
    }, 1200)
    return () => {
      clearTimeout(welcomeTimer)
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthSync)
      window.removeEventListener("storage", handleAuthSync)
    }
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

  const openApp = (
    app: AppType,
    title: string,
    options?: {
      videoUrl?: string
      initialUrl?: string
      tabTitle?: string
      settingsCategory?: string
      finderFolderId?: string
    }
  ) => {
    setLaunchpadOpen(false)
    setActiveApp(title)
    const existingWindow = windows.find((w) => w.app === app && !w.isMinimized)

    if (existingWindow) {
      if (options?.videoUrl && existingWindow.videoUrl !== options.videoUrl) {
        setWindows(
          windows.map((w) =>
            w.id === existingWindow.id ? { ...w, title, videoUrl: options.videoUrl, zIndex: highestZIndex + 1 } : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
      if (options?.initialUrl && existingWindow.initialUrl !== options.initialUrl) {
        setWindows(
          windows.map((w) =>
            w.id === existingWindow.id
              ? { ...w, title, initialUrl: options.initialUrl, tabTitle: options.tabTitle, zIndex: highestZIndex + 1 }
              : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
      if (options?.settingsCategory) {
        setWindows(
          windows.map((w) =>
            w.id === existingWindow.id
              ? {
                ...w,
                settingsCategory: options.settingsCategory,
                settingsCategoryNonce: Date.now(),
                zIndex: highestZIndex + 1,
              }
              : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
      if (options?.finderFolderId) {
        setWindows(
          windows.map((w) =>
            w.id === existingWindow.id
              ? {
                ...w,
                finderFolderId: options.finderFolderId,
                finderFolderNonce: Date.now(),
                zIndex: highestZIndex + 1,
              }
              : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
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
      if (options?.settingsCategory) {
        setWindows(
          windows.map((w) =>
            w.id === minimizedWindow.id
              ? {
                ...w,
                isMinimized: false,
                settingsCategory: options.settingsCategory,
                settingsCategoryNonce: Date.now(),
                zIndex: highestZIndex + 1,
              }
              : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
      if (options?.finderFolderId) {
        setWindows(
          windows.map((w) =>
            w.id === minimizedWindow.id
              ? {
                ...w,
                isMinimized: false,
                finderFolderId: options.finderFolderId,
                finderFolderNonce: Date.now(),
                zIndex: highestZIndex + 1,
              }
              : w
          )
        )
        setHighestZIndex(highestZIndex + 1)
        return
      }
      unminimizeWindow(minimizedWindow.id)
      return
    }

    const isQuickTime = app === "quicktime"
    const isSafari = app === "safari"
    const newWindow: WindowState = {
      id: `${app}-${Date.now()}`,
      app,
      title,
      isMinimized: false,
      isMaximized: false,
      position: isQuickTime ? { x: 180, y: 90 } : { x: 100 + windows.length * 30, y: 80 + windows.length * 30 },
      size: isQuickTime ? { width: 760, height: 500 } : isSafari ? { width: 940, height: 640 } : { width: 900, height: 600 },
      zIndex: highestZIndex + 1,
      videoUrl: options?.videoUrl,
      initialUrl: options?.initialUrl,
      tabTitle: options?.tabTitle,
      settingsCategory: options?.settingsCategory,
      settingsCategoryNonce: options?.settingsCategory ? Date.now() : undefined,
      finderFolderId: options?.finderFolderId,
      finderFolderNonce: options?.finderFolderId ? Date.now() : undefined,
    }

    setWindows([...windows, newWindow])
    setHighestZIndex(highestZIndex + 1)
  }

  // 로그인 유도 이벤트 수신 시 Settings 로그인 창 열기 및 포커스
  useEffect(() => {
    const handleOpenLogin = () => {
      openApp("settings", "Settings")
    }
    window.addEventListener(OPEN_SAFARI_LOGIN_EVENT, handleOpenLogin)
    return () => window.removeEventListener(OPEN_SAFARI_LOGIN_EVENT, handleOpenLogin)
  }, [windows, highestZIndex])

  const closeWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id))
  }

  const closeAppWindows = (app: AppType) => {
    setWindows((prev) => prev.filter((w) => w.app !== app))
  }

  const handleRestart = () => {
    setWindows([])
    setSpotlightOpen(false)
    setContextMenu(null)
    setNotificationCenterOpen(false)
    setLaunchpadOpen(false)
    setAboutThisMacOpen(false)
    setControlCenterOpen(false)
    onRestart?.()
  }

  const minimizeWindow = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const handleDockAppClick = (app: AppType, title: string) => {
    setLaunchpadOpen(false)
    const openWindow = windows.find((w) => w.app === app && !w.isMinimized)
    if (openWindow) {
      minimizeWindow(openWindow.id)
      return
    }
    openApp(app, title)
  }

  const unminimizeWindow = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)))
    setHighestZIndex(highestZIndex + 1)
  }

  const maximizeWindow = (id: string) => {
    setWindows(
      windows.map((w) => {
        if (w.id !== id) return w
        const topBarHeight = typeof window !== "undefined" && window.innerWidth < 768 ? 42 : 28
        return {
          ...w,
          isMaximized: !w.isMaximized,
          position: w.isMaximized ? w.position : { x: 0, y: topBarHeight },
          size: w.isMaximized ? w.size : { width: window.innerWidth, height: window.innerHeight - topBarHeight - 80 },
        }
      }),
    )
  }

  const focusWindow = (id: string) => {
    const target = windows.find((w) => w.id === id)
    if (!target) return
    setActiveApp(target.title)
    if (target.zIndex === highestZIndex) return
    const newZIndex = highestZIndex + 1
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w)))
    setHighestZIndex(newZIndex)
  }

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)))
  }

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, size } : w)))
  }

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "Launchpad", subLabel: "모아보기", action: () => setLaunchpadOpen(true) },
        { divider: true, label: "", action: () => { } },
        { label: "Finder", subLabel: "브랜드영상보기", action: () => openApp("finder", "Finder") },
        { label: "Safari", subLabel: "게시판", action: () => openApp("safari", "Safari") },
        { label: "Messages", subLabel: "채팅", action: () => openApp("messages", "Messages") },
        { label: "Notes", subLabel: "공지", action: () => openApp("notes", "Notes") },
        { label: "Terminal", subLabel: "터미널", action: () => openApp("terminal", "Terminal") },
      ],
    })
  }

  const renderAppContent = (app: AppType, title: string, windowObj?: WindowState) => {
    switch (app) {
      case "finder":
        return (
          <Finder
            initialFolder={windowObj?.finderFolderId || title}
            navigationRequestId={windowObj?.finderFolderNonce}
            onOpenVideo={(video) => openApp("quicktime", video.name, { videoUrl: video.url })}
            onOpenUrl={(url, tabTitle) => openApp("safari", "Safari", { initialUrl: url, tabTitle })}
          />
        )
      case "quicktime":
        return <QuickTimePlayer videoUrl={windowObj?.videoUrl} title={title} />
      case "safari":
        return (
          <Safari
            initialUrl={windowObj?.initialUrl}
            initialTab={windowObj?.tabTitle}
            onClose={() => windowObj && closeWindow(windowObj.id)}
            onOpenSettings={(category) => openApp("settings", "Settings", { settingsCategory: category })}
            onOpenFinderBrand={(folderId) => openApp("finder", "Finder", { finderFolderId: folderId })}
          />
        )
      case "messages":
        return <Messages />
      case "settings":
        return (
          <Settings
            initialCategory={windowObj?.settingsCategory}
            navigationRequestId={windowObj?.settingsCategoryNonce}
          />
        )
      case "calendar":
        return <Calendar />
      case "sound":
      case "music":
        return <Sound />
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
    <div className="h-screen w-screen overflow-hidden relative bg-gradient-to-br from-white via-slate-100 to-gray-200">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f1f3f6] to-[#d8dce2]" />
      <AnimatedWallpaper />

      <div className="absolute inset-0" onContextMenu={handleDesktopContextMenu}>
        <div className="absolute top-20 md:top-32 right-4 md:right-8 flex flex-col gap-4 md:gap-6">
          <DesktopIcon icon={DownloadsIcon} label="브랜드 영상" onDoubleClick={() => openApp("finder", "브랜드 영상")} />
          <DesktopIcon icon={DownloadsIcon} label="브랜드 조사 신청" onDoubleClick={() => openApp("finder", "브랜드 조사 신청")} />
        </div>

        <div className="absolute bottom-20 md:bottom-32 left-4 md:left-8 flex flex-col gap-3 md:gap-4 items-start">
          {/* 모바일 화면에서 하단 독 대신 시계 위로 이동 배치되는 노트(공지) 앱 (우측 아이콘과 동일한 DesktopIcon 컴포넌트 및 크기 적용) */}
          <div className="md:hidden">
            <DesktopIcon
              icon={NotesIcon}
              label="공지"
              onDoubleClick={() => openApp("notes", "Notes")}
              onClick={() => openApp("notes", "Notes")}
            />
          </div>
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
        onRestart={handleRestart}
        onControlCenterClick={() => setControlCenterOpen(!controlCenterOpen)}
        onOpenApp={openApp}
        onLaunchpadClick={() => setLaunchpadOpen((prev) => !prev)}
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
              {renderAppContent(window.app, window.title, window)}
            </Window>
          ),
      )}

      <Dock
        onAppClick={handleDockAppClick}
        onQuitApp={closeAppWindows}
        minimizedWindows={windows.filter((w) => w.isMinimized)}
        onUnminimize={unminimizeWindow}
        onLaunchpadClick={() => setLaunchpadOpen(!launchpadOpen)}
        openApps={windows.map((w) => w.app)}
      />

      {spotlightOpen && (
        <Spotlight
          onClose={() => setSpotlightOpen(false)}
          onOpenApp={openApp}
          onLaunchpadClick={() => setLaunchpadOpen(true)}
          onControlCenterClick={() => setControlCenterOpen(true)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {notificationCenterOpen && <NotificationCenter onClose={() => setNotificationCenterOpen(false)} />}

      {launchpadOpen && <Launchpad onClose={() => setLaunchpadOpen(false)} onOpenApp={openApp} />}

      {aboutThisMacOpen && <AboutThisMac onClose={() => setAboutThisMacOpen(false)} />}

      {controlCenterOpen && <ControlCenter onClose={() => setControlCenterOpen(false)} />}

      {/* macOS 실시간 알림 배너 */}
      <NotificationBanner />

      {/* 화면 밝기(Brightness) 조절 오버레이 */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black pointer-events-none z-[120] transition-opacity duration-100"
        style={{
          opacity: Math.max(0, Math.min(0.75, ((100 - systemControls.brightness) / 100) * 0.75)),
        }}
      />
    </div>
  )
}
