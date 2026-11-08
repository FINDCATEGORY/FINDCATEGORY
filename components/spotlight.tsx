"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Calculator, Calendar, Folder, Music, ImageIcon, FileText } from "lucide-react"
import type { AppType } from "./macos-desktop"

interface SpotlightProps {
  onClose: () => void
  onOpenApp: (app: AppType, title: string) => void
}

const searchResults = [
  { icon: Folder, label: "Documents", type: "Folder", action: () => {} },
  { icon: FileText, label: "Project Proposal.pdf", type: "PDF Document", action: () => {} },
  { icon: ImageIcon, label: "Vacation Photos", type: "Folder", action: () => {} },
  { icon: Music, label: "Favorite Playlist", type: "Music", action: () => {} },
  { icon: Calculator, label: "Calculator", type: "Application", action: () => {} },
  { icon: Calendar, label: "Calendar", type: "Application", action: () => {} },
]

export function Spotlight({ onClose, onOpenApp }: SpotlightProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % searchResults.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
    } else if (e.key === "Enter") {
      searchResults[selectedIndex].action()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <div
        className="w-[600px] bg-white/95 macos-blur rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-auto">
          {searchResults
            .filter((result) => result.label.toLowerCase().includes(query.toLowerCase()))
            .map((result, index) => {
              const IconComponent = result.icon
              return (
                <button
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    index === selectedIndex ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    result.action()
                    onClose()
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{result.label}</div>
                    <div className={`text-xs ${index === selectedIndex ? "text-white/80" : "text-gray-500"}`}>
                      {result.type}
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
