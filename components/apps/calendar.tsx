"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

const events = [
  { id: 1, title: "Team Meeting", time: "9:00 AM", color: "bg-blue-500" },
  { id: 2, title: "Lunch with Sarah", time: "12:30 PM", color: "bg-green-500" },
  { id: 3, title: "Project Review", time: "3:00 PM", color: "bg-purple-500" },
]

export function Calendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dates = Array.from({ length: 35 }, (_, i) => i + 1)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">January 2024</h2>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((day) => (
              <div key={day} className="text-center text-gray-500 font-medium">
                {day[0]}
              </div>
            ))}
            {dates.map((date) => (
              <button
                key={date}
                className={`aspect-square flex items-center justify-center rounded hover:bg-gray-100 ${
                  date === 15 ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-semibold">Today</h1>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className={`${event.color} text-white p-4 rounded-lg`}>
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm opacity-90">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
