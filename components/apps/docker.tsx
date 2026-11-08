"use client"

import { useState } from "react"
import { Container, Play, Square, Trash2, RefreshCw } from "lucide-react"

interface DockerContainer {
  id: string
  name: string
  image: string
  status: "running" | "stopped"
  ports: string
}

export function Docker() {
  const [containers, setContainers] = useState<DockerContainer[]>([
    { id: "a1b2c3d4", name: "web-app", image: "nginx:latest", status: "running", ports: "80:80" },
    { id: "e5f6g7h8", name: "database", image: "postgres:15", status: "running", ports: "5432:5432" },
    { id: "i9j0k1l2", name: "redis-cache", image: "redis:alpine", status: "stopped", ports: "6379:6379" },
  ])

  const toggleContainer = (id: string) => {
    setContainers(
      containers.map((c) => (c.id === id ? { ...c, status: c.status === "running" ? "stopped" : "running" } : c)),
    )
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Container className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Docker Desktop</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {containers.filter((c) => c.status === "running").length}
          </div>
          <div className="text-sm text-gray-600">Running</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">
            {containers.filter((c) => c.status === "stopped").length}
          </div>
          <div className="text-sm text-gray-600">Stopped</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{containers.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Containers list */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">CONTAINERS</h3>
        <div className="space-y-2">
          {containers.map((container) => (
            <div
              key={container.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${container.status === "running" ? "bg-green-500" : "bg-gray-400"}`}
                />
                <div>
                  <div className="font-semibold text-gray-800">{container.name}</div>
                  <div className="text-sm text-gray-500">
                    {container.image} • {container.ports}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleContainer(container.id)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title={container.status === "running" ? "Stop" : "Start"}
                >
                  {container.status === "running" ? (
                    <Square className="w-4 h-4 text-red-500" />
                  ) : (
                    <Play className="w-4 h-4 text-green-500" />
                  )}
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
