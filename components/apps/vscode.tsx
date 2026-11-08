"use client"

import type React from "react"

import { useState } from "react"
import {
  File,
  Folder,
  Search,
  GitBranch,
  Settings,
  Play,
  ChevronRight,
  ChevronDown,
  X,
  TerminalIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

export function VSCode() {
  const [selectedFile, setSelectedFile] = useState("app.tsx")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["src", "components"])
  const [openTabs, setOpenTabs] = useState(["app.tsx", "index.tsx", "styles.css"])
  const [showTerminal, setShowTerminal] = useState(true)
  const [terminalOutput, setTerminalOutput] = useState([
    "$ npm run dev",
    "",
    "> next-app@0.1.0 dev",
    "> next dev",
    "",
    "  ▲ Next.js 14.0.4",
    "  - Local:        http://localhost:3000",
    "  - Network:      http://192.168.1.100:3000",
    "",
    "✓ Ready in 2.3s",
  ])

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => (prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder]))
  }

  const openFile = (fileName: string) => {
    if (!openTabs.includes(fileName)) {
      setOpenTabs([...openTabs, fileName])
    }
    setSelectedFile(fileName)
  }

  const closeTab = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newTabs = openTabs.filter((tab) => tab !== fileName)
    setOpenTabs(newTabs)
    if (selectedFile === fileName && newTabs.length > 0) {
      setSelectedFile(newTabs[newTabs.length - 1])
    }
  }

  const fileTree = [
    {
      name: "src",
      type: "folder",
      children: [
        { name: "app.tsx", type: "file" },
        { name: "index.tsx", type: "file" },
        { name: "utils.ts", type: "file" },
        { name: "types.ts", type: "file" },
      ],
    },
    {
      name: "components",
      type: "folder",
      children: [
        { name: "Header.tsx", type: "file" },
        { name: "Footer.tsx", type: "file" },
        { name: "Button.tsx", type: "file" },
        { name: "Card.tsx", type: "file" },
      ],
    },
    {
      name: "styles",
      type: "folder",
      children: [
        { name: "globals.css", type: "file" },
        { name: "styles.css", type: "file" },
      ],
    },
    {
      name: "public",
      type: "folder",
      children: [
        { name: "logo.svg", type: "file" },
        { name: "favicon.ico", type: "file" },
      ],
    },
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
    { name: "README.md", type: "file" },
    { name: ".gitignore", type: "file" },
  ]

  const getFileContent = (fileName: string) => {
    const contents: Record<string, string> = {
      "app.tsx": `import React from 'react'
import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import './styles/globals.css'

interface AppProps {
  title: string
  theme?: 'light' | 'dark'
}

function App({ title, theme = 'light' }: AppProps) {
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    document.title = \`\${title} - Count: \${count}\`
  }, [count, title])
  
  const handleIncrement = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setCount(prevCount => prevCount + 1)
    setIsLoading(false)
  }
  
  const handleReset = () => {
    setCount(0)
  }
  
  return (
    <div className={\`app theme-\${theme}\`}>
      <Header title={title} />
      <main className="container">
        <div className="counter-section">
          <h1>Counter Application</h1>
          <div className="count-display">
            <span className="count-value">{count}</span>
          </div>
          <div className="button-group">
            <button 
              onClick={handleIncrement}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Loading...' : 'Increment'}
            </button>
            <button 
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App`,
      "index.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './styles/globals.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App title="My Application" theme="light" />
  </React.StrictMode>
)`,
      "styles.css": `/* Global Styles */
:root {
  --primary-color: #0070f3;
  --secondary-color: #7928ca;
  --background: #ffffff;
  --foreground: #000000;
  --border-radius: 8px;
  --spacing-unit: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: var(--background);
  color: var(--foreground);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--spacing-unit) * 4);
}

.btn {
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #0051cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.counter-section {
  text-align: center;
  padding: calc(var(--spacing-unit) * 6);
}

.count-display {
  font-size: 72px;
  font-weight: bold;
  margin: calc(var(--spacing-unit) * 4) 0;
  color: var(--primary-color);
}`,
    }
    return contents[fileName] || `// ${fileName}\n\n// File content here...`
  }

  return (
    <div className="h-full flex bg-[#1e1e1e] text-white font-mono text-sm">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4">
        <File className="w-6 h-6 text-white cursor-pointer hover:text-blue-400 transition-colors" />
        <Search className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
        <GitBranch className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
        <Play className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
        <div className="flex-1" />
        <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
        <div className="p-3 text-xs text-gray-400 uppercase font-semibold tracking-wide">Explorer</div>
        <div className="flex-1 overflow-auto px-2">
          {fileTree.map((item) => (
            <div key={item.name}>
              {item.type === "folder" ? (
                <>
                  <div
                    className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded"
                    onClick={() => toggleFolder(item.name)}
                  >
                    {expandedFolders.includes(item.name) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Folder className="w-4 h-4 text-blue-400" />
                    <span>{item.name}</span>
                  </div>
                  {expandedFolders.includes(item.name) && item.children && (
                    <div className="ml-6">
                      {item.children.map((child) => (
                        <div
                          key={child.name}
                          className={`flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded ${
                            selectedFile === child.name ? "bg-[#37373d]" : ""
                          }`}
                          onClick={() => openFile(child.name)}
                        >
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded ${
                    selectedFile === item.name ? "bg-[#37373d]" : ""
                  }`}
                  onClick={() => openFile(item.name)}
                >
                  <File className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{item.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[#3e3e42] p-3">
          <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">Problems</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="w-3 h-3" />
              <span>2 Warnings</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-3 h-3" />
              <span>0 Errors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Tab bar */}
        <div className="h-9 bg-[#252526] border-b border-[#3e3e42] flex items-center px-2 overflow-x-auto">
          {openTabs.map((tab) => (
            <div
              key={tab}
              className={`px-3 py-1 text-sm flex items-center gap-2 rounded-t cursor-pointer group ${
                selectedFile === tab ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setSelectedFile(tab)}
            >
              <File className="w-4 h-4" />
              <span>{tab}</span>
              <button
                onClick={(e) => closeTab(tab, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Code editor */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 bg-[#1e1e1e]">
            <pre className="text-sm leading-relaxed">
              <code className="text-gray-300">{getFileContent(selectedFile)}</code>
            </pre>
          </div>
        </div>

        {showTerminal && (
          <div className="h-48 border-t border-[#3e3e42] bg-[#1e1e1e] flex flex-col">
            <div className="h-9 bg-[#252526] flex items-center justify-between px-4 border-b border-[#3e3e42]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <TerminalIcon className="w-4 h-4" />
                  <span>Terminal</span>
                </div>
                <span className="text-xs text-gray-400">zsh</span>
              </div>
              <button onClick={() => setShowTerminal(false)} className="hover:bg-gray-600 rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 text-xs font-mono">
              {terminalOutput.map((line, i) => (
                <div key={i} className="text-gray-300">
                  {line}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-green-400">➜</span>
                <span className="text-blue-400">next-app</span>
                <span className="text-gray-400">git:(</span>
                <span className="text-red-400">main</span>
                <span className="text-gray-400">)</span>
                <span className="text-white animate-pulse">▊</span>
              </div>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-xs text-white">
          <div className="flex items-center gap-4">
            <span>⚡ Ln 12, Col 5</span>
            <span>UTF-8</span>
            <span>TypeScript React</span>
          </div>
          <div className="flex items-center gap-4">
            <GitBranch className="w-3 h-3 inline" />
            <span>main</span>
            <span>✓ Prettier</span>
            {!showTerminal && (
              <button onClick={() => setShowTerminal(true)} className="hover:bg-blue-600 px-2 py-0.5 rounded">
                Terminal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
