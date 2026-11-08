"use client"

import { useState } from "react"
import { GitBranch, GitCommit } from "lucide-react"

export function GitBash() {
  const [activeTab, setActiveTab] = useState<"status" | "log" | "branches">("status")

  const commits = [
    { hash: "a1b2c3d", message: "Add new feature", author: "John Doe", date: "2 hours ago" },
    { hash: "e4f5g6h", message: "Fix bug in authentication", author: "Jane Smith", date: "5 hours ago" },
    { hash: "i7j8k9l", message: "Update dependencies", author: "John Doe", date: "1 day ago" },
    { hash: "m0n1o2p", message: "Refactor code structure", author: "Jane Smith", date: "2 days ago" },
  ]

  const branches = [
    { name: "main", current: true, lastCommit: "2 hours ago" },
    { name: "develop", current: false, lastCommit: "1 day ago" },
    { name: "feature/new-ui", current: false, lastCommit: "3 days ago" },
  ]

  return (
    <div className="h-full bg-[#0d1117] text-gray-300">
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-white">Git Repository</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <GitBranch className="w-4 h-4" />
          <span className="text-orange-400">main</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "status" ? "text-white border-b-2 border-orange-500" : "text-gray-400 hover:text-white"
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "log" ? "text-white border-b-2 border-orange-500" : "text-gray-400 hover:text-white"
          }`}
        >
          Commit Log
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "branches" ? "text-white border-b-2 border-orange-500" : "text-gray-400 hover:text-white"
          }`}
        >
          Branches
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "status" && (
          <div className="space-y-4">
            <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <GitCommit className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-white">Working Directory</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-green-400">✓ All changes committed</div>
                <div className="text-gray-400">Your branch is up to date with 'origin/main'</div>
              </div>
            </div>

            <div className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
              <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm">
                  Pull Changes
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                  Push Changes
                </button>
                <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm">
                  Create Branch
                </button>
                <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm">
                  Merge Branch
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "log" && (
          <div className="space-y-3">
            {commits.map((commit) => (
              <div key={commit.hash} className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-3">
                  <GitCommit className="w-5 h-5 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{commit.message}</div>
                    <div className="text-sm text-gray-400">
                      {commit.author} • {commit.hash} • {commit.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "branches" && (
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.name} className="bg-[#161b22] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {branch.name}
                        {branch.current && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">Current</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">Last commit: {branch.lastCommit}</div>
                    </div>
                  </div>
                  {!branch.current && (
                    <button className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm">
                      Checkout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
