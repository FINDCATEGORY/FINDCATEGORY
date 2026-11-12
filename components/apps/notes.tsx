"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Search, Lock } from "lucide-react"
import { showNotification } from "@/components/NotificationBanner"
import { triggerTemplateNotification } from "@/lib/notification-templates"
import { useAuth } from "@/lib/auth"

interface NoteItem {
  id: number
  title: string
  content: string
  date: string
  folder: string
}

const NOTES_STORAGE_KEY = "findcategory_notes"
const NOTES_UPDATED_EVENT = "findcategory_notes_updated"

function loadStoredNotes(): NoteItem[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as NoteItem[]
      if (Array.isArray(parsed)) return parsed
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([]))
  } catch {}
  return []
}

function saveStoredNotes(items: NoteItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(items))
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(NOTES_UPDATED_EVENT, { detail: items }))
    })
  } catch (err) {
    console.error("Failed to save notes:", err)
  }
}

export function Notes() {
  const { isAdmin } = useAuth()
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNote, setSelectedNote] = useState<number>(-1)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loaded = loadStoredNotes()
    setNotes(loaded)
    setSelectedNote(loaded[0]?.id ?? -1)

    const handleSync = (event: Event) => {
      const next = (event as CustomEvent<NoteItem[]>).detail
      if (Array.isArray(next)) {
        setNotes(next)
        setSelectedNote((prev) => (next.some((n) => n.id === prev) ? prev : (next[0]?.id ?? -1)))
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === NOTES_STORAGE_KEY) {
        const refreshed = loadStoredNotes()
        setNotes(refreshed)
        setSelectedNote((prev) => (refreshed.some((n) => n.id === prev) ? prev : (refreshed[0]?.id ?? -1)))
      }
    }

    window.addEventListener(NOTES_UPDATED_EVENT, handleSync)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener(NOTES_UPDATED_EVENT, handleSync)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const currentNote = notes.find((n) => n.id === selectedNote)

  const handleAddNote = () => {
    if (!isAdmin) return
    const newNote: NoteItem = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      date: new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      folder: "Notes",
    }
    const nextNotes = [newNote, ...notes]
    setNotes(nextNotes)
    saveStoredNotes(nextNotes)
    setSelectedNote(newNote.id)
    triggerTemplateNotification("note_created", {}, {
      app: "Notes",
      title: "새로운 메모 생성",
      message: "새로운 메모가 생성되어 편집할 수 있습니다.",
      iconType: "notes",
    })
  }

  const handleDeleteNote = () => {
    if (!isAdmin || !currentNote) return
    const remaining = notes.filter((n) => n.id !== selectedNote)
    setNotes(remaining)
    saveStoredNotes(remaining)
    setSelectedNote(remaining[0]?.id ?? -1)
    showNotification({
      app: "Notes",
      title: "메모 삭제 완료",
      message: "선택한 메모가 보관함에서 삭제되었습니다.",
      iconType: "notes",
    })
  }

  const handleUpdateContent = (content: string) => {
    if (!isAdmin) return
    const nextNotes = notes.map((n) => (n.id === selectedNote ? { ...n, content } : n))
    setNotes(nextNotes)
    saveStoredNotes(nextNotes)
  }

  const handleUpdateTitle = (title: string) => {
    if (!isAdmin) return
    const nextNotes = notes.map((n) => (n.id === selectedNote ? { ...n, title } : n))
    setNotes(nextNotes)
    saveStoredNotes(nextNotes)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900/60">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-zinc-100">Notes</h2>
          {isAdmin && (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleAddNote}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="새 메모 작성 (New Note)"
              >
                <Plus className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
              </button>
              {currentNote && (
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="메모 삭제 (Delete Note)"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
              등록된 메모가 없습니다.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={`w-full p-4 text-left border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                  selectedNote === note.id ? "bg-slate-100 dark:bg-zinc-800/80" : ""
                }`}
                onClick={() => setSelectedNote(note.id)}
              >
                <div className="font-semibold text-sm mb-1 text-slate-900 dark:text-zinc-100">
                  {note.title}
                </div>
                <div className="text-xs text-slate-400 dark:text-zinc-500 mb-2">
                  {note.date} • {note.folder}
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">
                  {note.content}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-auto bg-white dark:bg-zinc-950">
        {currentNote ? (
          <>
            {!isAdmin && (
              <div className="mb-4 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>읽기 전용: Notes 작성, 수정 및 삭제는 관리자만 가능합니다.</span>
              </div>
            )}
            <input
              type="text"
              readOnly={!isAdmin}
              placeholder="Title"
              className={`w-full text-3xl font-bold mb-6 focus:outline-none bg-transparent text-slate-900 dark:text-zinc-100 placeholder-slate-300 dark:placeholder-zinc-600 ${
                !isAdmin ? "cursor-default" : ""
              }`}
              value={currentNote.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
            />
            <textarea
              readOnly={!isAdmin}
              className={`w-full h-[calc(100%-5rem)] resize-none focus:outline-none text-slate-700 dark:text-zinc-300 bg-transparent text-lg leading-relaxed placeholder-slate-300 dark:placeholder-zinc-600 ${
                !isAdmin ? "cursor-default" : ""
              }`}
              placeholder={isAdmin ? "Start typing..." : "관리자만 메모를 작성하거나 수정할 수 있습니다."}
              value={currentNote.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-zinc-500">
            {isAdmin ? "상단의 + 버튼을 눌러 새 메모를 작성하세요." : "선택된 메모가 없습니다."}
          </div>
        )}
      </div>
    </div>
  )
}
