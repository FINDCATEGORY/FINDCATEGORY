"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth"

interface TerminalBoardEntry {
  id: string
  author: string
  authorEmail?: string
  text: string
  createdAt: string
}

const TERMINAL_BOARD_STORAGE_KEY = "findcategory_terminal_board"
const TERMINAL_BOARD_UPDATED_EVENT = "findcategory_terminal_board_updated"

function loadTerminalEntries(): TerminalBoardEntry[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(TERMINAL_BOARD_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as TerminalBoardEntry[]
      if (Array.isArray(parsed)) return parsed
    }
    localStorage.setItem(TERMINAL_BOARD_STORAGE_KEY, JSON.stringify([]))
  } catch {}
  return []
}

function saveTerminalEntries(entries: TerminalBoardEntry[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TERMINAL_BOARD_STORAGE_KEY, JSON.stringify(entries))
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(TERMINAL_BOARD_UPDATED_EVENT, { detail: entries }))
    })
  } catch (err) {
    console.error("Failed to save terminal board entries:", err)
  }
}

export function Terminal() {
  const { user, isLoggedIn, isAdmin } = useAuth()
  const [entries, setEntries] = useState<TerminalBoardEntry[]>([])
  const [loginTime, setLoginTime] = useState<string>("")
  const [currentCommand, setCurrentCommand] = useState("")
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const promptUser = isLoggedIn && user?.nickname ? user.nickname : "guest"

  useEffect(() => {
    setLoginTime(new Date().toLocaleString())
    setEntries(loadTerminalEntries())

    const handleSync = (event: Event) => {
      const next = (event as CustomEvent<TerminalBoardEntry[]>).detail
      if (Array.isArray(next)) {
        setEntries(next)
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TERMINAL_BOARD_STORAGE_KEY) {
        setEntries(loadTerminalEntries())
      }
    }

    window.addEventListener(TERMINAL_BOARD_UPDATED_EVENT, handleSync)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(TERMINAL_BOARD_UPDATED_EVENT, handleSync)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [entries])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = currentCommand.trim()
    if (!trimmed) return

    const newEntry: TerminalBoardEntry = {
      id: `term-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: promptUser,
      authorEmail: isLoggedIn ? user?.email : undefined,
      text: trimmed,
      createdAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    }

    const updated = [...entries, newEntry]
    setEntries(updated)
    saveTerminalEntries(updated)
    setCurrentCommand("")
  }

  const handleDeleteEntry = (entry: TerminalBoardEntry) => {
    const isOwner = Boolean(isLoggedIn && user?.email && entry.authorEmail === user.email)
    if (!isAdmin && !isOwner) return
    const updated = entries.filter((item) => item.id !== entry.id)
    setEntries(updated)
    saveTerminalEntries(updated)
    if (updated.length === 0) {
      setIsDeleteMode(false)
    }
  }

  return (
    <div className="h-full bg-black text-green-400 font-mono text-xs md:text-sm flex flex-col">
      <div
        ref={terminalRef}
        className="flex-1 p-4 overflow-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="leading-relaxed">Last login: {loginTime}</div>
        <div className="leading-relaxed">Welcome to macOS Terminal</div>
        <div className="leading-relaxed mb-2">한줄게시판입니다. 자유롭게 어떤 글이든 남겨보세요.</div>

        {entries.map((entry) => {
          const canDelete = isAdmin || Boolean(isLoggedIn && user?.email && entry.authorEmail === user.email)
          return (
            <div
              key={entry.id}
              className="group leading-relaxed whitespace-pre-wrap break-all flex items-start justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <span className="text-blue-400">{entry.author}@macOS</span>{" "}
                <span className="text-white">~</span>{" "}
                <span className="text-purple-400">%</span>{" "}
                <span className="text-green-400">{entry.text}</span>
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteEntry(entry)
                  }}
                  className={`${
                    isDeleteMode
                      ? "opacity-100 text-rose-400 hover:text-rose-300"
                      : "opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400"
                  } text-[11px] transition-opacity shrink-0 cursor-pointer`}
                  title="댓글 삭제"
                >
                  [삭제]
                </button>
              )}
            </div>
          )
        })}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="text-blue-400">{promptUser}@macOS</span>
          <span className="text-white">~</span>
          <span className="text-purple-400">%</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent outline-none text-green-400"
            autoFocus
          />
        </form>
      </div>

      {isAdmin && (
        <div
          className="border-t border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center justify-between gap-2 text-xs select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-zinc-400">
            관리자 · 댓글 {entries.length}개
            {isDeleteMode && entries.length > 0 ? " (삭제할 댓글의 [삭제]를 누르세요)" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={entries.length === 0}
              onClick={() => setIsDeleteMode((prev) => !prev)}
              className={`px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDeleteMode
                  ? "bg-rose-600/20 border-rose-500/50 text-rose-300 hover:bg-rose-600/30"
                  : "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {isDeleteMode ? "삭제 완료" : "댓글 삭제"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
