"use client"

import { Calendar, Mail, MessageSquare, X } from "lucide-react"

interface NotificationCenterProps {
  onClose: () => void
}

const notifications = [
  {
    icon: Mail,
    app: "Mail",
    title: "New message from John",
    message: "Hey, can we meet tomorrow?",
    time: "5 min ago",
  },
  {
    icon: Calendar,
    app: "Calendar",
    title: "Meeting in 30 minutes",
    message: "Team standup at 2:00 PM",
    time: "25 min ago",
  },
  {
    icon: MessageSquare,
    app: "Messages",
    title: "Sarah sent you a message",
    message: "Thanks for your help!",
    time: "1 hour ago",
  },
]

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  return (
    <div className="fixed top-7 right-0 w-[380px] h-[calc(100vh-7rem)] bg-white/95 macos-blur border-l border-gray-200 shadow-2xl z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Notification Center</h2>
        <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <notification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{notification.app}</span>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <div className="font-medium text-sm mb-1">{notification.title}</div>
                <div className="text-sm text-gray-600">{notification.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Widgets section */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 mb-3">WIDGETS</div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg p-4 text-white">
          <div className="text-sm font-semibold mb-1">Weather</div>
          <div className="text-2xl font-bold">72°F</div>
          <div className="text-xs opacity-80">Partly Cloudy</div>
        </div>
      </div>
    </div>
  )
}
