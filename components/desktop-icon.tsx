"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface DesktopIconProps {
  icon: string | React.ComponentType
  label: string
  onDoubleClick: () => void
  onClick?: () => void
}

export function DesktopIcon({ icon, label, onDoubleClick, onClick }: DesktopIconProps) {
  const [clicks, setClicks] = useState(0)
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = useCallback(() => {
    setIsSelected(true)
    onClick?.()
    const newClicks = clicks + 1
    setClicks(newClicks)

    if (newClicks === 2) {
      // Double click detected
      onDoubleClick()
      setIsSelected(false)
      setClicks(0)
    } else {
      // Reset after timeout
      setTimeout(() => {
        setClicks(0)
      }, 300)
    }
  }, [clicks, onDoubleClick, onClick])

  const IconComponent = typeof icon === "string" ? null : icon

  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors cursor-pointer focus:outline-none select-none ${isSelected ? "bg-blue-500/30" : "hover:bg-white/20"
        }`}
      onClick={handleClick}
    >
      {IconComponent ? (
        <div className="w-16 h-16 shrink-0 flex items-center justify-center">
          <IconComponent />
        </div>
      ) : (
        <div className="text-5xl">{typeof icon === "string" ? icon : null}</div>
      )}
      <span className="text-xs font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center leading-tight">
        {label}
      </span>
    </button>
  )
}
