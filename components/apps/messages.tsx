"use client"

import { useState } from "react"
import { Send, Phone, Video, Info } from "lucide-react"

const conversations = [
  { id: 1, name: "Sarah Johnson", lastMessage: "See you tomorrow!", time: "2:30 PM", unread: 2, avatar: "👩" },
  { id: 2, name: "Work Team", lastMessage: "Meeting at 3 PM", time: "1:15 PM", unread: 0, avatar: "👥" },
  { id: 3, name: "Mom", lastMessage: "Love you! ❤️", time: "Yesterday", unread: 0, avatar: "👩‍🦳" },
  { id: 4, name: "Alex Chen", lastMessage: "Thanks for the help", time: "Monday", unread: 0, avatar: "👨" },
  { id: 5, name: "Emily Davis", lastMessage: "Sounds good!", time: "Sunday", unread: 0, avatar: "👩‍🦰" },
]

const messagesByConversation: Record<number, Array<{ id: number; text: string; sent: boolean; time: string }>> = {
  1: [
    { id: 1, text: "Hey! How are you?", sent: false, time: "2:15 PM" },
    { id: 2, text: "I'm good! Just finished the project", sent: true, time: "2:20 PM" },
    { id: 3, text: "That's awesome! Want to grab coffee?", sent: false, time: "2:25 PM" },
    { id: 4, text: "See you tomorrow!", sent: true, time: "2:30 PM" },
  ],
  2: [
    { id: 1, text: "Don't forget about the meeting", sent: false, time: "1:00 PM" },
    { id: 2, text: "Meeting at 3 PM", sent: false, time: "1:15 PM" },
  ],
  3: [
    { id: 1, text: "How was your day?", sent: false, time: "Yesterday" },
    { id: 2, text: "It was great! Thanks for asking", sent: true, time: "Yesterday" },
    { id: 3, text: "Love you! ❤️", sent: false, time: "Yesterday" },
  ],
  4: [{ id: 1, text: "Thanks for the help", sent: false, time: "Monday" }],
  5: [{ id: 1, text: "Sounds good!", sent: false, time: "Sunday" }],
}

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(1)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(messagesByConversation)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      }
      setMessages({
        ...messages,
        [selectedConversation]: [...(messages[selectedConversation] || []), newMsg],
      })
      setNewMessage("")
    }
  }

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedConversation === conv.id ? "bg-blue-50" : ""
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                {conv.avatar}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm truncate">{conv.name}</span>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
          <span className="font-semibold">{conversations.find((c) => c.id === selectedConversation)?.name}</span>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {(messages[selectedConversation] || []).map((message) => (
            <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-xs md:max-w-md">
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.sent ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-200 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                </div>
                <span className={`text-xs text-gray-500 mt-1 ${message.sent ? "text-right" : "text-left"}`}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="iMessage"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
