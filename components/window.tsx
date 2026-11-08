"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showControls, setShowControls] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        requestAnimationFrame(() => {
          onPositionChange({
            x: e.clientX - dragStart.x,
            y: Math.max(28, e.clientY - dragStart.y),
          })
        })
      }
      if (isResizing && !isMaximized) {
        requestAnimationFrame(() => {
          onSizeChange({
            width: Math.max(400, e.clientX - position.x),
            height: Math.max(300, e.clientY - position.y),
          })
        })
      }
    },
    [isDragging, isResizing, dragStart, position, isMaximized, onPositionChange, onSizeChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".window-titlebar")) {
      onFocus()
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFocus()
    setIsResizing(true)
  }

  return (
    <div
      ref={windowRef}
      className={`absolute macos-window-shadow rounded-lg overflow-hidden bg-white transition-all duration-200 ${
        isAnimating ? "animate-scale-in opacity-0" : "opacity-100"
      } ${isDragging ? "cursor-grabbing" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        willChange: isDragging || isResizing ? "transform" : "auto",
      }}
      onMouseDown={() => onFocus()}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Title bar */}
      <div
        className="window-titlebar h-11 bg-[var(--macos-menu-bg)] macos-blur border-b border-gray-200 flex items-center justify-between px-4 cursor-move select-none group"
        onMouseDown={handleMouseDown}
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
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-gray-700">{title}</div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-44px)] overflow-auto bg-white">{children}</div>

      {/* Resize handle */}
      {!isMaximized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  )
}
