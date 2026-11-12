"use client"

import { useEffect, useState } from "react"

export function BootScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      <div className="animate-fade-in flex items-center justify-center">
        <img
          src="/apple wh.svg"
          alt="Apple Logo"
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Progress bar */}
      <div className="mt-16 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
