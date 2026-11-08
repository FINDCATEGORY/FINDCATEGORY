"use client"

import { useState } from "react"
import { Wifi, Bluetooth, Volume2, Sun, Moon } from "lucide-react"

interface ControlCenterProps {
  onClose: () => void
}

export function ControlCenter({ onClose }: ControlCenterProps) {
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [volume, setVolume] = useState(70)
  const [brightness, setBrightness] = useState(80)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        className="absolute top-8 right-4 w-80 bg-[var(--macos-menu-bg)] macos-blur border border-black/10 rounded-2xl shadow-2xl p-4 space-y-3 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WiFi */}
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            wifiEnabled ? "bg-blue-500 text-white" : "bg-white/50 text-gray-700"
          }`}
          onClick={() => setWifiEnabled(!wifiEnabled)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-6 h-6" />
              <div>
                <div className="font-semibold">Wi-Fi</div>
                <div className="text-sm opacity-80">{wifiEnabled ? "Home Network" : "Off"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bluetooth */}
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            bluetoothEnabled ? "bg-blue-500 text-white" : "bg-white/50 text-gray-700"
          }`}
          onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bluetooth className="w-6 h-6" />
              <div>
                <div className="font-semibold">Bluetooth</div>
                <div className="text-sm opacity-80">{bluetoothEnabled ? "On" : "Off"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="p-4 rounded-xl bg-white/50">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-700">Volume</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Brightness */}
        <div className="p-4 rounded-xl bg-white/50">
          <div className="flex items-center gap-3 mb-2">
            <Sun className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-700">Brightness</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Dark Mode */}
        <div
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            darkMode ? "bg-gray-800 text-white" : "bg-white/50 text-gray-700"
          }`}
          onClick={() => setDarkMode(!darkMode)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6" />
              <div>
                <div className="font-semibold">Dark Mode</div>
                <div className="text-sm opacity-80">{darkMode ? "On" : "Off"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
