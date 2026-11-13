"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { Maximize2, Minimize2 } from "lucide-react"

interface WindowProps {
  id: string
  title: string
  children: ReactNode
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isMaximized: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
}

export function Window({
  id,
  title,
  children,
  position,
  size,
  zIndex,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
}: WindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const windowRef = useRef<HTMLDivElement>(null)

  const onPositionChangeRef = useRef(onPositionChange)
  const onSizeChangeRef = useRef(onSizeChange)
  onPositionChangeRef.current = onPositionChange
  onSizeChangeRef.current = onSizeChange

  const dragStateRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    originX: position.x,
    originY: position.y,
    currentX: position.x,
    currentY: position.y,
  })

  const resizeStateRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    originWidth: size.width,
    originHeight: size.height,
    currentWidth: size.width,
    currentHeight: size.height,
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // GPU translate3d + RAF 기반 부드러운 창 드래그
  useEffect(() => {
    if (!isDragging) return

    let rafId: number | null = null

    const applyDragTransform = () => {
      rafId = null
      const el = windowRef.current
      if (!el) return
      const { currentX, currentY, originX, originY } = dragStateRef.current
      el.style.transform = `translate3d(${currentX - originX}px, ${currentY - originY}px, 0)`
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { startMouseX, startMouseY, originX, originY } = dragStateRef.current
      dragStateRef.current.currentX = originX + (e.clientX - startMouseX)
      const topBarHeight = typeof window !== "undefined" && window.innerWidth < 768 ? 42 : 28
      dragStateRef.current.currentY = Math.max(topBarHeight, originY + (e.clientY - startMouseY))
      if (rafId === null) {
        rafId = requestAnimationFrame(applyDragTransform)
      }
    }

    const finishDrag = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      const { currentX, currentY, originX, originY } = dragStateRef.current
      const el = windowRef.current
      if (el) {
        el.style.left = `${currentX}px`
        el.style.top = `${currentY}px`
        el.style.transform = ""
      }
      setIsDragging(false)
      if (currentX !== originX || currentY !== originY) {
        onPositionChangeRef.current({ x: currentX, y: currentY })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", finishDrag)
    window.addEventListener("blur", finishDrag)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", finishDrag)
      window.removeEventListener("blur", finishDrag)
    }
  }, [isDragging])

  // RAF 기반 부드러운 창 크기 조절
  useEffect(() => {
    if (!isResizing) return

    let rafId: number | null = null

    const applyResize = () => {
      rafId = null
      const el = windowRef.current
      if (!el) return
      const { currentWidth, currentHeight } = resizeStateRef.current
      el.style.width = `${currentWidth}px`
      el.style.height = `${currentHeight}px`
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { startMouseX, startMouseY, originWidth, originHeight } = resizeStateRef.current
      resizeStateRef.current.currentWidth = Math.max(400, originWidth + (e.clientX - startMouseX))
      resizeStateRef.current.currentHeight = Math.max(300, originHeight + (e.clientY - startMouseY))
      if (rafId === null) {
        rafId = requestAnimationFrame(applyResize)
      }
    }

    const finishResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      const { currentWidth, currentHeight, originWidth, originHeight } = resizeStateRef.current
      setIsResizing(false)
      if (currentWidth !== originWidth || currentHeight !== originHeight) {
        onSizeChangeRef.current({ width: currentWidth, height: currentHeight })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", finishResize)
    window.addEventListener("blur", finishResize)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", finishResize)
      window.removeEventListener("blur", finishResize)
    }
  }, [isResizing])

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest("button")) return
    e.stopPropagation()
    onFocus()
    if (isMaximized) return

    dragStateRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      originX: position.x,
      originY: position.y,
      currentX: position.x,
      currentY: position.y,
    }
    setIsDragging(true)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isMaximized) return
    e.stopPropagation()
    onFocus()

    resizeStateRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      originWidth: size.width,
      originHeight: size.height,
      currentWidth: size.width,
      currentHeight: size.height,
    }
    setIsResizing(true)
  }

  return (
    <div
      ref={windowRef}
      className={`absolute macos-window-shadow rounded-lg overflow-hidden bg-white dark:bg-zinc-950 transition-opacity duration-200 ${
        isAnimating ? "animate-scale-in opacity-0" : "opacity-100"
      } ${isDragging ? "cursor-grabbing" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        willChange: isDragging || isResizing ? "transform, width, height" : "auto",
      }}
      onMouseDown={() => onFocus()}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Title bar */}
      <div
        className="window-titlebar h-11 bg-[var(--macos-menu-bg)] macos-blur border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 cursor-move select-none group"
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <button
            className={`w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-all flex items-center justify-center ${
              showControls ? "opacity-100" : "opacity-60"
            }`}
            onClick={onClose}
          >
            {showControls && <span className="text-[8px] text-red-900">✕</span>}
          </button>
          <button
            className={`w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-all flex items-center justify-center ${
              showControls ? "opacity-100" : "opacity-60"
            }`}
            onClick={onMinimize}
          >
            {showControls && <Minimize2 className="w-2 h-2 text-yellow-900" />}
          </button>
          <button
            className={`w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-all flex items-center justify-center ${
              showControls ? "opacity-100" : "opacity-60"
            }`}
            onClick={onMaximize}
          >
            {showControls && <Maximize2 className="w-2 h-2 text-green-900" />}
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-zinc-200">{title}</div>
      </div>

      {/* Content */}
      <div
        className={`h-[calc(100%-44px)] overflow-auto bg-white dark:bg-zinc-950 ${
          isDragging || isResizing ? "pointer-events-none select-none" : ""
        }`}
      >
        {children}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  )
}
