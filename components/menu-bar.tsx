"use client"

import { useState, useEffect } from "react"
import { Search, BellIcon, LayoutGrid, Volume2, Volume1, VolumeX } from "lucide-react"
import { CustomLogoIcon } from "./custom-logo"
import type { AppType } from "./macos-desktop"
import { useSystemControls } from "@/lib/system-controls"
import {
  NOTIFICATION_CENTER_UPDATED_EVENT,
  getStoredNotificationCenterItems,
} from "./NotificationBanner"

interface MenuBarProps {
  currentTime: Date
  activeApp: string
  onSpotlightClick: () => void
  onNotificationClick: () => void
  onAboutThisMac?: () => void
  onRestart?: () => void
  onControlCenterClick?: () => void
  onOpenApp?: (app: AppType, title: string, options?: { settingsCategory?: string }) => void
  onLaunchpadClick?: () => void
}

interface MenuDropdownProps {
  items: Array<{ label?: string; shortcut?: string; divider?: boolean; action?: () => void }>
  onClose: () => void
}

function MenuDropdown({ items, onClose }: MenuDropdownProps) {
  return (
    <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-[var(--macos-menu-bg)] macos-blur border border-black/10 rounded-lg shadow-lg py-1 z-50">
      {items.map((item, index) =>
        item.divider ? (
          <div key={index} className="h-px bg-black/10 my-1" />
        ) : (
          <button
            key={index}
            className="w-full px-4 py-1.5 text-left text-sm whitespace-nowrap hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-between gap-4"
            onClick={() => {
              item.action?.()
              onClose()
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="text-xs opacity-60">{item.shortcut}</span>}
          </button>
        ),
      )}
    </div>
  )
}

export function MenuBar({
  currentTime,
  activeApp,
  onSpotlightClick,
  onNotificationClick,
  onAboutThisMac,
  onRestart,
  onControlCenterClick,
  onOpenApp,
  onLaunchpadClick,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hasNotifications, setHasNotifications] = useState(false)
  const { controls } = useSystemControls()

  const StatusVolumeIcon =
    controls.isMuted || controls.volume === 0
      ? VolumeX
      : controls.volume < 50
      ? Volume1
      : Volume2

  useEffect(() => {
    const checkCount = () => {
      const items = getStoredNotificationCenterItems()
      setHasNotifications(items.length > 0)
    }

    checkCount()
    window.addEventListener(NOTIFICATION_CENTER_UPDATED_EVENT, checkCount)
    window.addEventListener("storage", checkCount)
    return () => {
      window.removeEventListener(NOTIFICATION_CENTER_UPDATED_EVENT, checkCount)
      window.removeEventListener("storage", checkCount)
    }
  }, [])

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const appleMenuItems = [
    { label: "About FINDCATEGORY", action: onAboutThisMac },
    { divider: true },
    { label: "Restart", action: onRestart },
  ]

  const appMenuItems = [
    { label: "로그인", action: () => onOpenApp?.("settings", "Settings", { settingsCategory: "로그인" }) },
    { label: "회원가입", action: () => onOpenApp?.("settings", "Settings", { settingsCategory: "회원가입" }) },
    { label: "공지", action: () => onOpenApp?.("notes", "Notes") },
    { label: "설정", action: () => onOpenApp?.("settings", "Settings") },
  ]

  const menus = [
    {
      id: "apple",
      label: <CustomLogoIcon />,
      items: appleMenuItems,
    },
    { id: "app", label: <span className="font-bold tracking-tight text-[15px] md:text-sm">FINDCATEGORY</span>, items: appMenuItems },
  ]

  const quickAppMenus = [
    { id: "launchpad", label: "Launchpad", tooltip: "모아보기", action: () => onLaunchpadClick?.() },
    { id: "finder", label: "Finder", tooltip: "브랜드영상보기", action: () => onOpenApp?.("finder", "Finder") },
    { id: "safari", label: "Safari", tooltip: "게시판", action: () => onOpenApp?.("safari", "Safari") },
    { id: "messages", label: "Messages", tooltip: "채팅", action: () => onOpenApp?.("messages", "Messages") },
    { id: "notes", label: "Notes", tooltip: "공지", action: () => onOpenApp?.("notes", "Notes") },
    { id: "terminal", label: "Terminal", tooltip: "터미널", action: () => onOpenApp?.("terminal", "Terminal") },
  ]

  return (
    <div className="h-[42px] md:h-7 bg-[var(--macos-menu-bg)] macos-blur border-b border-black/10 dark:border-white/10 flex items-center justify-between px-2.5 md:px-4 relative z-50 text-slate-900 dark:text-zinc-100 select-none">
      <div className="flex items-center gap-1.5 md:gap-1 shrink-0">
        {menus.map((menu) => (
          <div key={menu.id} className="relative shrink-0">
            <button
              className={`px-2 py-1 md:py-0.5 rounded-md md:rounded transition-colors font-medium flex items-center shrink-0 ${
                activeMenu === menu.id ? "bg-blue-500 text-white" : "hover:bg-white/30"
              }`}
              onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
            >
              {menu.label}
            </button>
            {activeMenu === menu.id && menu.items.length > 0 && (
              <MenuDropdown items={menu.items} onClose={() => setActiveMenu(null)} />
            )}
          </div>
        ))}

        {/* 모바일 화면에서는 공간 확보를 위해 상단 바 텍스트 메뉴 숨김 (PC 화면 md 이상에서만 표시) */}
        <div className="hidden md:flex items-center gap-1">
          {quickAppMenus.map((item) => (
            <div key={item.id} className="relative group flex items-center">
              <button
                type="button"
                className="px-2 py-0.5 rounded transition-colors font-medium hover:bg-white/30 cursor-pointer"
                onClick={() => {
                  setActiveMenu(null)
                  item.action()
                }}
              >
                {item.label}
              </button>
              {/* 한글 말풍선 (상단바 아래로 표시) */}
              <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 flex flex-col items-center opacity-0 translate-y-0 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-150 ease-out">
                <div className="h-0 w-0 border-x-4 border-b-4 border-x-transparent border-b-gray-900/85" />
                <div className="whitespace-nowrap rounded-md bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md border border-white/10">
                  {item.tooltip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        <button
          className="hover:bg-white/30 dark:hover:bg-white/10 p-1.5 md:p-1 rounded transition-colors"
          onClick={onControlCenterClick}
          title={controls.isMuted || controls.volume === 0 ? "Volume: Muted" : `Volume: ${controls.volume}%`}
        >
          <StatusVolumeIcon className={`w-5 h-5 md:w-4 md:h-4 ${controls.isMuted || controls.volume === 0 ? "opacity-50" : ""}`} />
        </button>
        <button className="hover:bg-white/30 dark:hover:bg-white/10 p-1.5 md:p-1 rounded transition-colors" onClick={onSpotlightClick} title="Spotlight">
          <Search className="w-5 h-5 md:w-4 md:h-4" />
        </button>
        <button className="hover:bg-white/30 dark:hover:bg-white/10 p-1.5 md:p-1 rounded transition-colors" onClick={onControlCenterClick} title="Control Center">
          <LayoutGrid className="w-5 h-5 md:w-4 md:h-4" />
        </button>
        <button
          className="hover:bg-white/30 dark:hover:bg-white/10 p-1.5 md:p-1 rounded transition-colors relative"
          onClick={onNotificationClick}
          title="알림"
        >
          <BellIcon className="w-5 h-5 md:w-4 md:h-4" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 md:top-1 md:right-1 w-2 h-2 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full ring-1 ring-white" />
          )}
        </button>
        <span className="font-medium text-xs md:text-sm whitespace-nowrap">
          <span className="hidden sm:inline">{formatDate(currentTime)} </span>
          <span>{formatTime(currentTime)}</span>
        </span>
      </div>
    </div>
  )
}
