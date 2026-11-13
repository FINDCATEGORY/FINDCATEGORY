"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"

interface DesktopIconProps {
  icon: string | React.ComponentType
  label: string
  onDoubleClick?: () => void
  onClick?: () => void
  singleClick?: boolean
}

export function DesktopIcon({ icon, label, onDoubleClick, onClick, singleClick }: DesktopIconProps) {
  const [clicks, setClicks] = useState(0)
  const [isSelected, setIsSelected] = useState(false)
  const touchHandledRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  // 모바일 또는 터치 디바이스 판별 (화면 너비 768px 미만 또는 터치 중심 환경)
  const isMobileOrTouch = useCallback(() => {
    if (typeof window === "undefined") return false
    return (
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    )
  }, [])

  // 터치 시작 시 좌표 기록
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  // 모바일 터치 이벤트 핸들러: 한 번의 터치로 즉시 실행
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation()
      if (touchStartRef.current && e.changedTouches.length > 0) {
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x)
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y)
        // 10px 이상 스와이프/스크롤 이동 시 탭 무시
        if (dx > 10 || dy > 10) {
          touchStartRef.current = null
          return
        }
      }
      touchStartRef.current = null

      // 플래그를 세워 이어지는 마우스 클릭 합성 이벤트 방지
      touchHandledRef.current = true
      setIsSelected(true)
      if (onClick) {
        onClick()
      } else {
        onDoubleClick?.()
      }

      setTimeout(() => {
        setIsSelected(false)
        touchHandledRef.current = false
      }, 350)
    },
    [onClick, onDoubleClick]
  )

  // 클릭 이벤트 핸들러
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      // 터치 이벤트로 이미 실행된 경우 중복 실행 방지
      if (touchHandledRef.current) return

      // singleClick(런치패드 등)이거나 모바일/터치 환경인 경우 1회 클릭으로 즉시 열림
      if (singleClick || isMobileOrTouch()) {
        setIsSelected(true)
        if (onClick) {
          onClick()
        } else {
          onDoubleClick?.()
        }
        setTimeout(() => setIsSelected(false), 350)
        return
      }

      // PC 데스크톱 마우스 환경: 1회 클릭 시 아이콘 선택(파란 박스), 더블 클릭 시 실행
      setIsSelected(true)
      onClick?.()

      const newClicks = clicks + 1
      setClicks(newClicks)

      if (newClicks >= 2) {
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
        onDoubleClick?.()
        setIsSelected(false)
        setClicks(0)
      } else {
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
        clickTimerRef.current = setTimeout(() => {
          setClicks(0)
        }, 300)
      }
    },
    [clicks, isMobileOrTouch, onClick, onDoubleClick, singleClick]
  )

  const IconComponent = typeof icon === "string" ? null : icon

  return (
    <button
      type="button"
      className={`w-[88px] h-[92px] flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer focus:outline-none select-none ${isSelected ? "bg-blue-500/25 ring-1 ring-blue-500/40" : "hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onBlur={() => setIsSelected(false)}
    >
      {IconComponent ? (
        <div className="w-16 h-14 shrink-0 flex items-center justify-center">
          <div className="shrink-0 flex items-center justify-center [&>div:not(.macos-folder)]:w-[50px] [&>div:not(.macos-folder)]:h-[50px]">
            <IconComponent />
          </div>
        </div>
      ) : (
        <div className="text-5xl">{typeof icon === "string" ? icon : null}</div>
      )}
      <span className="mt-1.5 h-5 flex items-center justify-center text-xs font-semibold text-slate-800 dark:text-zinc-100 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-center leading-tight transition-colors truncate max-w-full px-0.5">
        {label}
      </span>
    </button>
  )
}
