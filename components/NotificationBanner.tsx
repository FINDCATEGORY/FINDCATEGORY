"use client"

import React, { useState, useEffect, useCallback } from "react"
import { X, Bell, Sparkles } from "lucide-react"
import {
  FinderIcon,
  MessagesIcon,
  SafariIcon,
  SettingsIcon,
  NotesIcon,
} from "./app-icons"

export type NotificationAppType =
  | "finder"
  | "messages"
  | "safari"
  | "settings"
  | "notes"
  | "system"
  | "findcategory"

export type NotificationCenterAppType =
  | NotificationAppType
  | "mail"
  | "calendar"

export interface NotificationCenterItem {
  id: string
  app: string
  title: string
  message: string
  time?: string
  createdAt?: number
  iconType?: NotificationCenterAppType
  read?: boolean
}

export const NOTIFICATION_CENTER_UPDATED_EVENT = "macos_notification_center_updated"
export const NOTIFICATION_CENTER_STORAGE_KEY = "findcategory_notification_center_history"

const LEGACY_MOCK_NOTIFICATION_IDS = new Set(["nc-init-1", "nc-init-2", "nc-init-3"])

export const INITIAL_NOTIFICATION_CENTER_ITEMS: NotificationCenterItem[] = []

export function getStoredNotificationCenterItems(): NotificationCenterItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATION_CENTER_ITEMS
  try {
    const saved = localStorage.getItem(NOTIFICATION_CENTER_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (item: NotificationCenterItem) => item && !LEGACY_MOCK_NOTIFICATION_IDS.has(item.id)
        )
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(NOTIFICATION_CENTER_STORAGE_KEY, JSON.stringify(cleaned))
        }
        return cleaned
      }
    }
  } catch {}
  return INITIAL_NOTIFICATION_CENTER_ITEMS
}

export function saveNotificationCenterItems(items: NotificationCenterItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTIFICATION_CENTER_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(NOTIFICATION_CENTER_UPDATED_EVENT, { detail: items }))
  } catch {}
}

export function addNotificationToCenter(item: NotificationCenterItem) {
  if (typeof window === "undefined") return
  const current = getStoredNotificationCenterItems()
  const updated = [item, ...current.filter((n) => n.id !== item.id)].slice(0, 40)
  saveNotificationCenterItems(updated)
}

export function removeNotificationFromCenter(id: string) {
  if (typeof window === "undefined") return
  const current = getStoredNotificationCenterItems()
  const updated = current.filter((n) => n.id !== id)
  saveNotificationCenterItems(updated)
}

export function clearAllNotificationCenterItems() {
  if (typeof window === "undefined") return
  saveNotificationCenterItems([])
}

export interface MacOSNotification {
  id: string
  app: string
  title: string
  message: string
  time?: string
  iconType?: NotificationAppType
  duration?: number
  onClick?: () => void
}

import {
  type NotificationTriggerId,
  getStoredNotificationPreferences,
  inferNotificationTriggerId,
  isNotificationTriggerEnabled,
} from "@/lib/notification-triggers"

export interface ShowNotificationOptions {
  app?: string
  title: string
  message: string
  time?: string
  iconType?: NotificationAppType
  duration?: number
  triggerId?: NotificationTriggerId
  onClick?: () => void
}

export const MACOS_NOTIFICATION_EVENT = "macos_show_notification"

/**
 * 전역 어디서든 호출 가능한 macOS 스타일 실시간 알림 트리거 함수
 * 예시:
 * showNotification("신규 한 줄 평 등록", "새로운 브랜드 대표 상품 한 줄 평이 등록되었습니다.")
 * showNotification({ app: "Finder", title: "브랜드 신청 완료", message: "신청서가 접수되었습니다.", iconType: "finder" })
 */
export function showNotification(
  titleOrOptions: string | ShowNotificationOptions,
  optionalMessage?: string,
  optionalApp?: string
) {
  if (typeof window === "undefined") return

  let payload: ShowNotificationOptions
  if (typeof titleOrOptions === "string") {
    payload = {
      title: titleOrOptions,
      message: optionalMessage || "",
      app: optionalApp || "FIND_CATEGORY",
      iconType: (optionalApp?.toLowerCase() as NotificationAppType) || "findcategory",
    }
  } else {
    payload = titleOrOptions
  }

  const resolvedTriggerId =
    payload.triggerId ??
    inferNotificationTriggerId({ app: payload.app, title: payload.title })

  if (!isNotificationTriggerEnabled(resolvedTriggerId)) {
    return
  }

  const prefs = getStoredNotificationPreferences()

  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  const notification: MacOSNotification = {
    id: notifId,
    app: payload.app || "FIND_CATEGORY",
    title: payload.title,
    message: payload.message,
    time: payload.time || "방금 전",
    iconType: payload.iconType || "findcategory",
    duration: payload.duration,
    onClick: payload.onClick,
  }

  // 1. 우측 상단 플로팅 배너 토스트 띄우기 (클릭 시 닫힘)
  if (prefs.enableBanners !== false) {
    window.dispatchEvent(
      new CustomEvent(MACOS_NOTIFICATION_EVENT, { detail: notification })
    )
  }

  // 2. Notification Center에 알림 영구 보관 (사용자가 토스트를 닫아도 Notification Center에 계속 남아있음)
  if (prefs.saveToHistory !== false) {
    addNotificationToCenter({
      id: notifId,
      app: notification.app,
      title: notification.title,
      message: notification.message,
      time: notification.time || "방금 전",
      createdAt: Date.now(),
      iconType: notification.iconType,
    })
  }
}

/**
 * React 컴포넌트 내에서 사용할 수 있는 커스텀 훅
 */
export function useNotification() {
  return {
    notify: showNotification,
  }
}

/**
 * macOS 알림 효과음 (Web Audio API)
 */
function playMacOSChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 부드럽고 영롱한 macOS Glass 차임 벨소리 (듀얼 하모닉 사인파)
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(830.61, now) // G#5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1) // C6

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1318.51, now + 0.04) // E6
    osc2.frequency.exponentialRampToValueAtTime(1661.22, now + 0.22) // G#6

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.2)
    osc2.start(now + 0.04)
    osc2.stop(now + 0.4)
  } catch {}
}

/**
 * 앱 타입에 따른 미니 아이콘 렌더링 헬퍼
 */
function renderAppIcon(iconType?: NotificationAppType) {
  switch (iconType) {
    case "finder":
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
          <FinderIcon />
        </div>
      )
    case "messages":
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
          <MessagesIcon />
        </div>
      )
    case "safari":
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
          <SafariIcon />
        </div>
      )
    case "settings":
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
          <SettingsIcon />
        </div>
      )
    case "notes":
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 shadow-xs">
          <NotesIcon />
        </div>
      )
    default:
      return (
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Sparkles className="w-3 h-3" />
        </div>
      )
  }
}

/**
 * macOS 스타일 실시간 알림 배너 (Notification Banner Container)
 */
export function NotificationBanner() {
  const [notifications, setNotifications] = useState<MacOSNotification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<MacOSNotification>
      if (!customEvent.detail) return

      const notif = customEvent.detail
      setNotifications((prev) => [notif, ...prev.slice(0, 4)]) // 최대 5개까지 유지
      if (getStoredNotificationPreferences().enableSound !== false) {
        playMacOSChime()
      }

      // 사용자가 클릭해서 닫을 때까지 화면에 유지 (자동 소멸 타이머 제거)
      if (notif.duration && notif.duration > 0) {
        setTimeout(() => {
          removeNotification(notif.id)
        }, notif.duration)
      }
    }

    window.addEventListener(MACOS_NOTIFICATION_EVENT, handleNewNotification)
    return () => {
      window.removeEventListener(MACOS_NOTIFICATION_EVENT, handleNewNotification)
    }
  }, [removeNotification])

  if (notifications.length === 0) return null

  return (
    <aside
      aria-label="macOS 실시간 알림 센터"
      className="fixed top-10 right-4 z-[9999] flex flex-col items-end gap-2.5 pointer-events-none select-none max-w-[360px] w-full"
    >
      {/* 2개 이상일 때 '모두 지우기' 옵션 제공 */}
      {notifications.length > 1 && (
        <button
          type="button"
          onClick={clearAllNotifications}
          className="pointer-events-auto text-[11px] font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          모두 지우기
        </button>
      )}

      {notifications.map((notif) => (
        <div
          key={notif.id}
          onClick={() => {
            if (notif.onClick) notif.onClick()
            removeNotification(notif.id)
          }}
          className="group pointer-events-auto w-full rounded-2xl bg-white/85 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.25)] p-3.5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer animate-in slide-in-from-right-8 fade-in-0 duration-300 relative select-none"
          title="클릭하면 알림이 닫힙니다"
        >
          {/* 알림 카드 상단: 앱 아이콘, 카테고리/앱 이름, 시간, 닫기 버튼 */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {renderAppIcon(notif.iconType)}
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tracking-wide uppercase truncate">
                {notif.app}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                {notif.time || "방금 전"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notif.id)
                }}
                className="opacity-60 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full p-1 transition-all cursor-pointer"
                title="알림 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 알림 카드 본문: 타이틀 & 메시지 */}
          <div className="pl-7 pr-1">
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug mb-0.5">
              {notif.title}
            </div>
            <div className="text-[11.5px] text-slate-600 dark:text-zinc-300 leading-relaxed break-words">
              {notif.message}
            </div>
          </div>
        </div>
      ))}
    </aside>
  )
}

