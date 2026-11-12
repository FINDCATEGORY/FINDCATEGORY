"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Calendar,
  Mail,
  X,
  Bell,
  Sparkles,
  MapPin,
  RefreshCw,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Droplets,
  Wind,
} from "lucide-react"
import {
  FinderIcon,
  MessagesIcon,
  SafariIcon,
  SettingsIcon,
  NotesIcon,
} from "./app-icons"
import {
  type NotificationCenterItem,
  getStoredNotificationCenterItems,
  removeNotificationFromCenter,
  clearAllNotificationCenterItems,
  NOTIFICATION_CENTER_UPDATED_EVENT,
} from "./NotificationBanner"
import {
  type WeatherConditionCode,
  type WeatherWidgetData,
  fetchIpKmaWeather,
  formatCelsiusOrFahrenheit,
  getCachedWeather,
} from "@/lib/kma-weather"

function WeatherConditionIcon({ code }: { code?: WeatherConditionCode }) {
  switch (code) {
    case "clear":
      return <Sun className="w-9 h-9 text-amber-200 drop-shadow-xs shrink-0" />
    case "cloudy":
      return <Cloud className="w-9 h-9 text-white/90 drop-shadow-xs shrink-0" />
    case "rain":
      return <CloudRain className="w-9 h-9 text-sky-100 drop-shadow-xs shrink-0" />
    case "shower":
      return <CloudDrizzle className="w-9 h-9 text-sky-100 drop-shadow-xs shrink-0" />
    case "rain-snow":
    case "snow":
      return <CloudSnow className="w-9 h-9 text-white drop-shadow-xs shrink-0" />
    case "partly-cloudy":
    default:
      return <CloudSun className="w-9 h-9 text-white drop-shadow-xs shrink-0" />
  }
}

interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [items, setItems] = useState<NotificationCenterItem[]>([])
  const [weatherData, setWeatherData] = useState<WeatherWidgetData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C")

  const loadWeather = useCallback(async (forceRefresh: boolean = false) => {
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const data = await fetchIpKmaWeather(forceRefresh)
      setWeatherData(data)
    } catch (error) {
      setWeatherError(
        error instanceof Error ? error.message : "날씨 정보를 불러오지 못했습니다."
      )
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = getCachedWeather(false)
    if (cached) {
      setWeatherData(cached)
      if (cached.weather.configured && cached.weather.ok) {
        setWeatherLoading(false)
        return
      }
    }
    void loadWeather(false)
  }, [loadWeather])

  useEffect(() => {
    setItems(getStoredNotificationCenterItems())

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationCenterItem[]>
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail)
      } else {
        setItems(getStoredNotificationCenterItems())
      }
    }

    window.addEventListener(NOTIFICATION_CENTER_UPDATED_EVENT, handleUpdate)
    window.addEventListener("storage", handleUpdate)
    return () => {
      window.removeEventListener(NOTIFICATION_CENTER_UPDATED_EVENT, handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeNotificationFromCenter(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearAllNotificationCenterItems()
    setItems([])
  }

  const renderItemIcon = (item: NotificationCenterItem) => {
    const iconType = item.iconType?.toLowerCase() || ""
    const appLower = item.app.toLowerCase()

    if (iconType === "finder" || appLower.includes("finder")) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
          <FinderIcon />
        </div>
      )
    }
    if (iconType === "messages" || appLower.includes("message")) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
          <MessagesIcon />
        </div>
      )
    }
    if (iconType === "safari" || appLower.includes("safari")) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
          <SafariIcon />
        </div>
      )
    }
    if (iconType === "settings" || appLower.includes("setting")) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
          <SettingsIcon />
        </div>
      )
    }
    if (iconType === "notes" || appLower.includes("note")) {
      return (
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs">
          <NotesIcon />
        </div>
      )
    }
    if (iconType === "mail" || appLower.includes("mail")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Mail className="w-5 h-5" />
        </div>
      )
    }
    if (iconType === "calendar" || appLower.includes("calendar")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Calendar className="w-5 h-5" />
        </div>
      )
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
        <Sparkles className="w-5 h-5" />
      </div>
    )
  }

  return (
    <div className="fixed top-7 right-0 w-[380px] h-[calc(100vh-1.75rem)] bg-white/95 dark:bg-zinc-900/95 macos-blur border-l border-gray-200/80 dark:border-zinc-800 shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-zinc-100">알림</h2>
          {items.length > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              모두 지우기
            </button>
          )}
          <button
            onClick={onClose}
            className="hover:bg-gray-200 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800/60 flex items-center justify-center">
              <Bell className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">새로운 알림이 없습니다</p>
            <p className="text-xs text-slate-400/80 dark:text-zinc-500">발생한 알림은 이곳에 보관됩니다.</p>
          </div>
        ) : (
          items.map((notification) => (
            <div
              key={notification.id}
              className="group bg-white dark:bg-zinc-800/80 rounded-xl p-3.5 shadow-sm border border-gray-200/80 dark:border-zinc-700/60 hover:shadow-md transition-all relative"
            >
              <div className="flex items-start gap-3">
                {renderItemIcon(notification)}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200 tracking-wide uppercase truncate">
                      {notification.app}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">
                      {notification.time || "방금 전"}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 mb-0.5 line-clamp-1">
                    {notification.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed break-words">
                    {notification.message}
                  </div>
                </div>
              </div>

              {/* 개별 알림 삭제 버튼 (X) */}
              <button
                type="button"
                onClick={(e) => handleRemove(notification.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full p-1 absolute top-2.5 right-2.5 transition-all cursor-pointer"
                title="알림 지우기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Widgets section */}
      <div className="border-t border-gray-200 dark:border-zinc-800 p-4 shrink-0 bg-white/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 tracking-wider">
            WIDGETS
          </div>
          {weatherData?.weather.ok && (
            <span className="text-[10px] text-gray-400 dark:text-zinc-500">
              기상청 단기예보 ({weatherData.weather.baseTime.slice(0, 2)}:
              {weatherData.weather.baseTime.slice(2, 4)})
            </span>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-md">
          {/* Header: IP-detected location + controls */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-90" />
              <span className="text-xs font-semibold truncate opacity-95">
                {weatherData?.location.regionLabel ||
                  (weatherLoading ? "IP 위치 감지 중..." : "현재 접속 지역")}
              </span>
              {weatherData?.location && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/90 shrink-0">
                  {weatherData.location.nx},{weatherData.location.ny}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                title="섭씨/화씨 전환"
              >
                °{tempUnit}
              </button>
              <button
                type="button"
                onClick={() => void loadWeather(true)}
                disabled={weatherLoading}
                className="p-1 rounded bg-white/15 hover:bg-white/25 disabled:opacity-50 transition-colors cursor-pointer"
                title="날씨 새로고침"
                aria-label="날씨 새로고침"
              >
                <RefreshCw
                  className={`w-3 h-3 ${weatherLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Body */}
          {weatherLoading && !weatherData ? (
            <div className="py-2 space-y-2 animate-pulse">
              <div className="h-7 w-24 rounded bg-white/25" />
              <div className="h-3.5 w-44 rounded bg-white/20" />
            </div>
          ) : weatherData && !weatherData.weather.configured ? (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold">기상청 API 키 설정 필요</div>
                <CloudSun className="w-6 h-6 opacity-80 shrink-0" />
              </div>
              <p className="text-[11px] leading-relaxed text-white/85">
                <code className="px-1 py-0.5 rounded bg-white/15 font-mono text-[10px]">
                  .env.local
                </code>
                에 <code className="font-mono text-[10px]">KMA_API_KEY</code>(공공데이터포털
                단기예보)를 추가하면 현재 IP 지역 날씨가 표시됩니다.
              </p>
            </div>
          ) : weatherError || (weatherData && !weatherData.weather.ok) || !weatherData?.weather.current ? (
            <div className="space-y-2 pt-0.5">
              <div className="text-sm font-semibold">날씨 정보를 가져올 수 없습니다</div>
              <p className="text-[11px] text-white/85 line-clamp-2">
                {weatherError ||
                  weatherData?.weather.message ||
                  "잠시 후 다시 시도해 주세요."}
              </p>
              <button
                type="button"
                onClick={() => void loadWeather(true)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          ) : (
            (() => {
              const current = weatherData.weather.current
              const nextSlot = weatherData.weather.nextSlot
              const { tmn, tmx } = weatherData.weather
              const tempDiff =
                current.tmp !== null && nextSlot?.tmp !== null && nextSlot?.tmp !== undefined
                  ? Math.round(
                      tempUnit === "F"
                        ? ((nextSlot.tmp - current.tmp) * 9) / 5
                        : nextSlot.tmp - current.tmp
                    )
                  : null

              return (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-3xl font-bold tracking-tight leading-none mb-1">
                        {formatCelsiusOrFahrenheit(current.tmp, tempUnit)}
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-95">
                        <span className="font-medium">{current.conditionLabel}</span>
                        {(tmn !== null || tmx !== null) && (
                          <span className="text-[11px] opacity-80">
                            {tmn !== null ? `최저 ${formatCelsiusOrFahrenheit(tmn, tempUnit)}` : ""}
                            {tmn !== null && tmx !== null ? " / " : ""}
                            {tmx !== null ? `최고 ${formatCelsiusOrFahrenheit(tmx, tempUnit)}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <WeatherConditionIcon code={current.conditionCode} />
                  </div>

                  {/* Real-time metrics */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-white/90">
                    {current.pop !== null && <span>강수확률 {current.pop}%</span>}
                    {current.reh !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="w-3 h-3 opacity-85" />
                        습도 {current.reh}%
                      </span>
                    )}
                    {current.wsd !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Wind className="w-3 h-3 opacity-85" />
                        {current.wsd}m/s
                      </span>
                    )}
                  </div>

                  {/* Next forecast comparison strip */}
                  {nextSlot && (
                    <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-[11px] text-white/90">
                      <span className="opacity-80">{nextSlot.fcstLabel} 단기예보 비교</span>
                      <span className="font-medium">
                        {formatCelsiusOrFahrenheit(nextSlot.tmp, tempUnit)}
                        {tempDiff !== null && tempDiff !== 0 && (
                          <span className="ml-1 text-[10px] opacity-85">
                            ({tempDiff > 0 ? `+${tempDiff}` : tempDiff}°{tempUnit})
                          </span>
                        )}
                        {" · "}
                        {nextSlot.conditionLabel}
                      </span>
                    </div>
                  )}
                </>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}
