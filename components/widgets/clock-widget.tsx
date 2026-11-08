"use client"

import { useEffect, useState } from "react"

export function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const hourAngle = (hours + minutes / 60) * 30
  const minuteAngle = (minutes + seconds / 60) * 6
  const secondAngle = seconds * 6

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Clock face */}
          <circle cx="50" cy="50" r="48" fill="white" stroke="#e5e7eb" strokeWidth="2" />

          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const x1 = 50 + 40 * Math.sin(angle)
            const y1 = 50 - 40 * Math.cos(angle)
            const x2 = 50 + 45 * Math.sin(angle)
            const y2 = 50 - 45 * Math.cos(angle)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth="2" />
          })}

          {/* Hour hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 25 * Math.sin((hourAngle * Math.PI) / 180)}
            y2={50 - 25 * Math.cos((hourAngle * Math.PI) / 180)}
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Minute hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 35 * Math.sin((minuteAngle * Math.PI) / 180)}
            y2={50 - 35 * Math.cos((minuteAngle * Math.PI) / 180)}
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Second hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + 38 * Math.sin((secondAngle * Math.PI) / 180)}
            y2={50 - 38 * Math.cos((secondAngle * Math.PI) / 180)}
            stroke="#ef4444"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="#1f2937" />
        </svg>
      </div>
      <div className="text-center mt-2 text-sm font-medium text-gray-700">{time.toLocaleTimeString()}</div>
    </div>
  )
}
