"use client"

import { useState } from "react"
import { Search, BellIcon, LayoutGrid } from "lucide-react"

interface MenuBarProps {
  currentTime: Date
  activeApp: string
  onSpotlightClick: () => void
  onNotificationClick: () => void
  onAboutThisMac?: () => void
  onControlCenterClick?: () => void
}

interface MenuDropdownProps {
  items: Array<{ label: string; shortcut?: string; divider?: boolean; action?: () => void }>
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
            className="w-full px-4 py-1.5 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-between"
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
  onControlCenterClick,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const appleMenuItems = [
    { label: "About This Mac", action: onAboutThisMac },
    { divider: true },
    { label: "System Settings...", shortcut: "⌘,", action: () => console.log("Opening System Settings") },
    { label: "App Store...", action: () => console.log("Opening App Store") },
    { divider: true },
    { label: "Recent Items", action: () => console.log("Recent Items") },
    { divider: true },
    { label: "Sleep", action: () => console.log("Sleep") },
    { label: "Restart...", action: () => console.log("Restart") },
    { label: "Shut Down...", action: () => console.log("Shut Down") },
  ]

  const fileMenuItems = [
    { label: "New Finder Window", shortcut: "⌘N", action: () => console.log("New Finder Window") },
    { label: "New Folder", shortcut: "⇧⌘N", action: () => console.log("New Folder") },
    { label: "New Smart Folder", shortcut: "⌥⌘N", action: () => console.log("New Smart Folder") },
    { divider: true },
    { label: "Open", shortcut: "⌘O", action: () => console.log("Open") },
    { label: "Close Window", shortcut: "⌘W", action: () => console.log("Close Window") },
  ]

  const editMenuItems = [
    { label: "Undo", shortcut: "⌘Z", action: () => console.log("Undo") },
    { label: "Redo", shortcut: "⇧⌘Z", action: () => console.log("Redo") },
    { divider: true },
    { label: "Cut", shortcut: "⌘X", action: () => console.log("Cut") },
    { label: "Copy", shortcut: "⌘C", action: () => console.log("Copy") },
    { label: "Paste", shortcut: "⌘V", action: () => console.log("Paste") },
    { label: "Select All", shortcut: "⌘A", action: () => console.log("Select All") },
  ]

  const viewMenuItems = [
    { label: "as Icons", shortcut: "⌘1", action: () => console.log("View as Icons") },
    { label: "as List", shortcut: "⌘2", action: () => console.log("View as List") },
    { label: "as Columns", shortcut: "⌘3", action: () => console.log("View as Columns") },
    { label: "as Gallery", shortcut: "⌘4", action: () => console.log("View as Gallery") },
    { divider: true },
    { label: "Show Toolbar", action: () => console.log("Show Toolbar") },
    { label: "Show Sidebar", shortcut: "⌥⌘S", action: () => console.log("Show Sidebar") },
    { label: "Show Status Bar", action: () => console.log("Show Status Bar") },
  ]

  const goMenuItems = [
    { label: "Back", shortcut: "⌘[", action: () => console.log("Go Back") },
    { label: "Forward", shortcut: "⌘]", action: () => console.log("Go Forward") },
    { label: "Enclosing Folder", shortcut: "⌘↑", action: () => console.log("Enclosing Folder") },
    { divider: true },
    { label: "Documents", shortcut: "⇧⌘O", action: () => console.log("Go to Documents") },
    { label: "Desktop", shortcut: "⇧⌘D", action: () => console.log("Go to Desktop") },
    { label: "Downloads", shortcut: "⌥⌘L", action: () => console.log("Go to Downloads") },
    { label: "Home", shortcut: "⇧⌘H", action: () => console.log("Go to Home") },
    { label: "Applications", shortcut: "⇧⌘A", action: () => console.log("Go to Applications") },
  ]

  const helpMenuItems = [
    { label: "Search", action: () => console.log("Help Search") },
    { divider: true },
    { label: `${activeApp} Help`, action: () => console.log(`${activeApp} Help`) },
    { label: "Tips for Mac", action: () => console.log("Tips for Mac") },
    { label: "macOS Support", action: () => console.log("macOS Support") },
  ]

  const menus = [
    {
      id: "apple",
      label: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
      items: appleMenuItems,
    },
    { id: "app", label: activeApp, items: fileMenuItems },
    { id: "file", label: "File", items: fileMenuItems },
    { id: "edit", label: "Edit", items: editMenuItems },
    { id: "view", label: "View", items: viewMenuItems },
    { id: "go", label: "Go", items: goMenuItems },
    { id: "window", label: "Window", items: [] },
    { id: "help", label: "Help", items: helpMenuItems },
  ]

  return (
    <div className="h-7 bg-[var(--macos-menu-bg)] macos-blur border-b border-black/10 flex items-center justify-between px-4 relative z-50 text-sm select-none">
      <div className="flex items-center gap-1">
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              className={`px-2 py-0.5 rounded transition-colors font-medium ${
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
      </div>

      <div className="flex items-center gap-3">
        <button className="hover:bg-white/30 p-1 rounded transition-colors" onClick={onSpotlightClick}>
          <Search className="w-4 h-4" />
        </button>
        <button className="hover:bg-white/30 p-1 rounded transition-colors" onClick={onControlCenterClick}>
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button className="hover:bg-white/30 p-1 rounded transition-colors" onClick={onNotificationClick}>
          <BellIcon className="w-4 h-4" />
        </button>
        <span className="font-medium">{formatTime(currentTime)}</span>
      </div>
    </div>
  )
}
