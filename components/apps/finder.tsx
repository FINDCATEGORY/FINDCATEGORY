"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Folder, Home, Download, ImageIcon, Music, Video, Grid3x3, List, Search } from "lucide-react"

interface FinderProps {
  initialFolder?: string
}

const sidebarItems = [
  { icon: Home, label: "Home", color: "text-blue-500" },
  { icon: Download, label: "Downloads", color: "text-green-500" },
  { icon: Folder, label: "Documents", color: "text-blue-400" },
  { icon: ImageIcon, label: "Pictures", color: "text-purple-500" },
  { icon: Music, label: "Music", color: "text-pink-500" },
  { icon: Video, label: "Movies", color: "text-orange-500" },
]

const documentsFiles = [
  { name: "Project Proposal.pdf", type: "file", size: "2.4 MB", modified: "Today, 2:30 PM", icon: "📄" },
  { name: "Vacation Photos", type: "folder", items: 156, modified: "Yesterday", icon: "📁" },
  { name: "Budget 2024.xlsx", type: "file", size: "856 KB", modified: "Jan 15, 2024", icon: "📊" },
  { name: "Meeting Notes", type: "folder", items: 23, modified: "Jan 10, 2024", icon: "📁" },
  { name: "Design Mockups", type: "folder", items: 45, modified: "Jan 8, 2024", icon: "📁" },
  { name: "Report.docx", type: "file", size: "1.2 MB", modified: "Jan 5, 2024", icon: "📝" },
  { name: "Presentation.pptx", type: "file", size: "3.8 MB", modified: "Jan 3, 2024", icon: "📊" },
  { name: "Code Projects", type: "folder", items: 12, modified: "Dec 28, 2023", icon: "📁" },
]

const downloadsFiles = [
  { name: "macOS-installer.dmg", type: "file", size: "12.4 GB", modified: "Today, 3:45 PM", icon: "💿" },
  { name: "VS-Code-Setup.zip", type: "file", size: "156 MB", modified: "Today, 2:15 PM", icon: "📦" },
  { name: "wallpaper-collection.zip", type: "file", size: "45 MB", modified: "Yesterday", icon: "📦" },
  { name: "node-modules.tar.gz", type: "file", size: "234 MB", modified: "Jan 14, 2024", icon: "📦" },
  { name: "Screenshot 2024-01-15.png", type: "file", size: "2.1 MB", modified: "Jan 15, 2024", icon: "🖼️" },
  { name: "invoice-2024.pdf", type: "file", size: "456 KB", modified: "Jan 12, 2024", icon: "📄" },
  { name: "music-album.zip", type: "file", size: "89 MB", modified: "Jan 10, 2024", icon: "📦" },
]

export function Finder({ initialFolder = "Documents" }: FinderProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFolder, setCurrentFolder] = useState(initialFolder)

  useEffect(() => {
    setCurrentFolder(initialFolder)
  }, [initialFolder])

  const getCurrentFiles = () => {
    switch (currentFolder) {
      case "Downloads":
        return downloadsFiles
      case "Documents":
      default:
        return documentsFiles
    }
  }

  const files = getCurrentFiles()
  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 p-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Favorites</div>
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setCurrentFolder(item.label)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm ${
                currentFolder === item.label ? "bg-gray-200" : ""
              }`}
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          <div className="text-xs font-semibold text-gray-500 mb-2 px-2">iCloud</div>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm">
            <Folder className="w-4 h-4 text-blue-500" />
            <span>iCloud Drive</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium">{currentFolder}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-sm w-32"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View toggles */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                className={`p-1 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File list/grid */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === "list" ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredFiles.map((file) => (
                <button
                  key={file.name}
                  className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition-colors ${
                    selectedItem === file.name ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedItem(file.name)}
                >
                  <span className="text-2xl">{file.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {file.type === "folder" ? `${file.items} items` : file.size} • {file.modified}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <button
                  key={file.name}
                  className={`flex flex-col items-center gap-2 p-3 rounded hover:bg-blue-50 transition-colors ${
                    selectedItem === file.name ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedItem(file.name)}
                >
                  <span className="text-5xl">{file.icon}</span>
                  <div className="text-sm font-medium text-center line-clamp-2">{file.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-6 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600 bg-gray-50">
          <span>{filteredFiles.length} items</span>
          <span>{selectedItem ? "1 item selected" : ""}</span>
        </div>
      </div>
    </div>
  )
}
