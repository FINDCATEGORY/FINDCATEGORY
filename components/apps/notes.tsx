"use client"

import { useState } from "react"
import { Plus, Trash2, Search } from "lucide-react"

const initialNotes = [
  {
    id: 1,
    title: "Meeting Notes",
    content:
      "Discussed project timeline and deliverables for Q1 2024.\n\nKey Points:\n- Launch date: March 15\n- Team size: 8 developers\n- Budget approved\n- Weekly standups on Mondays",
    date: "Today",
    folder: "Work",
  },
  {
    id: 2,
    title: "Shopping List",
    content:
      "Groceries:\n- Milk\n- Eggs\n- Bread\n- Coffee\n- Fruits\n- Vegetables\n\nHousehold:\n- Paper towels\n- Dish soap",
    date: "Yesterday",
    folder: "Personal",
  },
  {
    id: 3,
    title: "App Ideas",
    content:
      "New productivity app concept:\n\n1. Time tracking with AI suggestions\n2. Smart task prioritization\n3. Integration with calendar\n4. Focus mode with ambient sounds\n5. Weekly productivity reports",
    date: "Jan 10",
    folder: "Ideas",
  },
  {
    id: 4,
    title: "Book Recommendations",
    content:
      "To Read:\n- Atomic Habits by James Clear\n- Deep Work by Cal Newport\n- The Pragmatic Programmer\n- Clean Code by Robert Martin",
    date: "Jan 8",
    folder: "Personal",
  },
]

export function Notes() {
  const [notes, setNotes] = useState(initialNotes)
  const [selectedNote, setSelectedNote] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const currentNote = notes.find((n) => n.id === selectedNote)

  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
      date: "Today",
      folder: "Notes",
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote.id)
  }

  const handleDeleteNote = () => {
    setNotes(notes.filter((n) => n.id !== selectedNote))
    if (notes.length > 1) {
      setSelectedNote(notes[0].id === selectedNote ? notes[1].id : notes[0].id)
    }
  }

  const handleUpdateContent = (content: string) => {
    setNotes(notes.map((n) => (n.id === selectedNote ? { ...n, content } : n)))
  }

  const handleUpdateTitle = (title: string) => {
    setNotes(notes.map((n) => (n.id === selectedNote ? { ...n, title } : n)))
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full bg-[#FEF9E7]">
      {/* Sidebar */}
      <div className="w-72 border-r border-amber-200 flex flex-col bg-[#FEF5E7]">
        <div className="p-4 border-b border-amber-200 flex items-center justify-between">
          <h2 className="font-semibold text-amber-900">Notes</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
              title="New Note"
            >
              <Plus className="w-5 h-5 text-amber-700" />
            </button>
            <button
              onClick={handleDeleteNote}
              className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-5 h-5 text-amber-700" />
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-amber-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              className={`w-full p-4 text-left border-b border-amber-100 hover:bg-amber-50 transition-colors ${
                selectedNote === note.id ? "bg-amber-100" : ""
              }`}
              onClick={() => setSelectedNote(note.id)}
            >
              <div className="font-semibold text-sm mb-1 text-amber-900">{note.title}</div>
              <div className="text-xs text-amber-600 mb-2">
                {note.date} • {note.folder}
              </div>
              <div className="text-xs text-amber-700 line-clamp-2">{note.content}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-8 overflow-auto">
        {currentNote && (
          <>
            <input
              type="text"
              placeholder="Title"
              className="w-full text-3xl font-bold mb-6 focus:outline-none bg-transparent text-amber-900 placeholder-amber-400"
              value={currentNote.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
            />
            <textarea
              className="w-full h-[calc(100%-5rem)] resize-none focus:outline-none text-amber-800 bg-transparent text-lg leading-relaxed"
              placeholder="Start typing..."
              value={currentNote.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  )
}
