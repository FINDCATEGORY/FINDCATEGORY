"use client"

import { useState } from "react"
import { Wifi, Bluetooth, Bell, Lock, Palette, Monitor, User, HardDrive, Network, Volume2 } from "lucide-react"

const settingsCategories = [
  { icon: Wifi, label: "Wi-Fi", description: "Connected to Home Network" },
  { icon: Bluetooth, label: "Bluetooth", description: "On" },
  { icon: Network, label: "Network", description: "Configure network settings" },
  { icon: Bell, label: "Notifications", description: "Manage app notifications" },
  { icon: Volume2, label: "Sound", description: "Adjust system sounds" },
  { icon: Lock, label: "Privacy & Security", description: "Protect your data" },
  { icon: Palette, label: "Appearance", description: "Light mode" },
  { icon: Monitor, label: "Displays", description: "Built-in Retina Display" },
  { icon: User, label: "Users & Groups", description: "Manage user accounts" },
  { icon: HardDrive, label: "Storage", description: "256 GB available" },
]

export function Settings() {
  const [selectedCategory, setSelectedCategory] = useState("Wi-Fi")

  const renderContent = () => {
    switch (selectedCategory) {
      case "Wi-Fi":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Wi-Fi</h1>
            <p className="text-gray-600 mb-8">Configure your wireless network settings</p>
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Wi-Fi</span>
                  <button className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors">
                    On
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Home Network</div>
                      <div className="text-sm text-gray-600">Connected</div>
                    </div>
                    <Wifi className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium">Office WiFi</div>
                      <div className="text-sm text-gray-600">Saved</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium">Guest Network</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case "Bluetooth":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Bluetooth</h1>
            <p className="text-gray-600 mb-8">Connect to wireless devices</p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Bluetooth</span>
                <button className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm">On</button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">AirPods Pro</div>
                  <div className="text-sm text-gray-600">Connected</div>
                </div>
                <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="font-medium">Magic Keyboard</div>
                  <div className="text-sm text-gray-600">Not Connected</div>
                </div>
              </div>
            </div>
          </>
        )
      case "Appearance":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Appearance</h1>
            <p className="text-gray-600 mb-8">Customize the look of your Mac</p>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <div className="font-semibold mb-3">Appearance</div>
                <div className="flex gap-4">
                  <button className="flex-1 p-4 border-2 border-blue-500 rounded-lg bg-white">
                    <div className="text-sm font-medium">Light</div>
                  </button>
                  <button className="flex-1 p-4 border-2 border-gray-200 rounded-lg bg-gray-900">
                    <div className="text-sm font-medium text-white">Dark</div>
                  </button>
                  <button className="flex-1 p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-b from-white to-gray-900">
                    <div className="text-sm font-medium">Auto</div>
                  </button>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-3">Accent Color</div>
                <div className="flex gap-2">
                  {["blue", "purple", "pink", "red", "orange", "yellow", "green"].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      case "Displays":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Displays</h1>
            <p className="text-gray-600 mb-8">Adjust resolution, brightness, and arrangement</p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
                <Monitor className="w-24 h-24 text-white opacity-50" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Brightness</span>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                  <input type="range" className="w-full" defaultValue="75" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Resolution</div>
                  <select className="w-full p-2 border border-gray-300 rounded">
                    <option>Default for display</option>
                    <option>1920 × 1080</option>
                    <option>2560 × 1440</option>
                    <option>3840 × 2160</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )
      default:
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">{selectedCategory}</h1>
            <p className="text-gray-600 mb-8">Configure {selectedCategory.toLowerCase()} settings</p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Settings for {selectedCategory} will appear here.</p>
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="space-y-1">
          {settingsCategories.map((category) => (
            <button
              key={category.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-left ${
                selectedCategory === category.label ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedCategory(category.label)}
            >
              <category.icon
                className={`w-5 h-5 ${selectedCategory === category.label ? "text-blue-500" : "text-gray-600"}`}
              />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">{renderContent()}</div>
    </div>
  )
}
