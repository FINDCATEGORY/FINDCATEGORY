"use client"

import { useState } from "react"
import { Grid3x3, List, Heart, Share2 } from "lucide-react"

const photos = [
  { id: 1, url: "/mountain-sunset-landscape.jpg", title: "Mountain Sunset" },
  { id: 2, url: "/ocean-beach-waves.jpg", title: "Ocean Beach" },
  { id: 3, url: "/forest-trees-nature.png", title: "Forest Path" },
  { id: 4, url: "/city-skyline-night.png", title: "City Lights" },
  { id: 5, url: "/desert-sand-dunes.png", title: "Desert Dunes" },
  { id: 6, url: "/lush-waterfall.png", title: "Waterfall" },
  { id: 7, url: "/aurora-northern-lights.jpg", title: "Aurora" },
  { id: 8, url: "/cherry-blossom-spring.jpg", title: "Cherry Blossom" },
  { id: 9, url: "/lake-reflection-mountains.jpg", title: "Lake Reflection" },
  { id: 10, url: "/canyon-rock-formation.jpg", title: "Canyon" },
  { id: 11, url: "/tropical-island-beach.png", title: "Tropical Island" },
  { id: 12, url: "/snowy-mountain-peak.png", title: "Snowy Peak" },
]

export function Photos() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold">All Photos</h1>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photo grid */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4" : "space-y-2"
          }
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative ${viewMode === "grid" ? "aspect-square" : "h-24 flex items-center gap-4"} rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer bg-gray-100`}
              onClick={() => setSelectedPhoto(photo.id)}
            >
              <img
                src={photo.url || "/placeholder.svg"}
                alt={photo.title}
                className={viewMode === "grid" ? "w-full h-full object-cover" : "h-full w-24 object-cover"}
              />
              {viewMode === "list" && <span className="text-sm font-medium">{photo.title}</span>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
