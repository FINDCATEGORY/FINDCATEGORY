"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface DesktopIconProps {
  icon: string | React.ComponentType
  label: string
  onDoubleClick: () => void
}

export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
  const [clicks, setClicks] = useState(0)
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = useCallback(() => {
    setIsSelected(true)
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
  }, [clicks, onDoubleClick])

  const IconComponent = typeof icon === "string" ? null : icon

  return (
    <button
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        isSelected ? "bg-blue-500/30" : "hover:bg-white/20"
      }`}
      onClick={handleClick}
    >
      {IconComponent ? (
        <div className="w-16 h-16">
          <IconComponent />
        </div>
      ) : (
        <div className="text-5xl">{icon}</div>
      )}
      <span className="text-xs font-medium text-white drop-shadow-lg text-center">{label}</span>
    </button>
  )
}
