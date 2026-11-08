"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from "lucide-react"

const albums = [
  { id: 1, title: "Midnight Dreams", artist: "The Echoes", cover: "/dreamy-night-sky-album-cover.jpg", duration: "3:45" },
  { id: 2, title: "Summer Vibes", artist: "Coastal Waves", cover: "/summer-beach-sunset-album-cover.jpg", duration: "4:12" },
  { id: 3, title: "Urban Nights", artist: "City Lights", cover: "/city-skyline-night-album-cover.png", duration: "3:28" },
  { id: 4, title: "Acoustic Sessions", artist: "Folk Tales", cover: "/acoustic-guitar-wooden-album-cover.jpg", duration: "5:03" },
  { id: 5, title: "Electronic Dreams", artist: "Synth Wave", cover: "/neon-synthwave-retro-album-cover.jpg", duration: "4:35" },
  { id: 6, title: "Jazz Lounge", artist: "Smooth Trio", cover: "/jazz-saxophone-lounge-album-cover.jpg", duration: "6:18" },
]

export function Music() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAlbum, setCurrentAlbum] = useState(albums[0])
  const [volume, setVolume] = useState(70)
  const [progress, setProgress] = useState(45)

  const handlePlayAlbum = (album: (typeof albums)[0]) => {
    setCurrentAlbum(album)
    setIsPlaying(true)
    setProgress(0)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Recently Played</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="group cursor-pointer" onClick={() => handlePlayAlbum(album)}>
              <div className="aspect-square rounded-xl mb-3 relative overflow-hidden shadow-lg transform transition-transform group-hover:scale-105 bg-gray-200">
                <img src={album.cover || "/placeholder.svg"} alt={album.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                    <Play className="w-8 h-8 text-pink-500 ml-1" />
                  </div>
                </div>
              </div>
              <div className="font-semibold text-gray-800">{album.title}</div>
              <div className="text-sm text-gray-600">{album.artist}</div>
              <div className="text-xs text-gray-500 mt-1">{album.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player */}
      <div className="h-28 border-t border-gray-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 shadow-lg">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-lg shadow-md overflow-hidden bg-gray-200">
            <img
              src={currentAlbum.cover || "/placeholder.svg"}
              alt={currentAlbum.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{currentAlbum.title}</div>
            <div className="text-sm text-gray-600">{currentAlbum.artist}</div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Shuffle className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <SkipBack className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <SkipForward className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Repeat className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-gray-600">1:23</span>
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{currentAlbum.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <Volume2 className="w-5 h-5 text-gray-600" />
          <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
