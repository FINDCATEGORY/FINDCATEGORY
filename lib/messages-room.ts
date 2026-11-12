"use client"

import { getStoredAuth } from "@/lib/auth"
import {
  getStoredManagedUsers,
  saveManagedUsers,
  type ManagedUser,
} from "@/lib/users"

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole?: string
  senderAvatar: string
  senderAvatarBg?: string
  senderIsAdmin?: boolean
  text: string
  time: string
  isMe: boolean
}

export const MESSAGES_THREAD_STORAGE_KEY = "findcategory_messages_thread"
export const MESSAGES_KICKED_STORAGE_KEY = "findcategory_messages_kicked"
export const MESSAGES_SESSION_JOINED_KEY = "findcategory_messages_session_joined"
export const MESSAGES_ROOM_UPDATED_EVENT = "findcategory_messages_room_updated"

export interface KickedEntries {
  emails: string[]
  ids: string[]
}

const LEGACY_SEED_MESSAGE_IDS = new Set(["msg-1", "msg-2", "msg-3", "msg-4", "msg-5"])

function dispatchRoomUpdated(): void {
  if (typeof window === "undefined") return
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(MESSAGES_ROOM_UPDATED_EVENT))
  })
}

export function getStoredMessagesThread(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(MESSAGES_THREAD_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as ChatMessage[]
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((m) => !LEGACY_SEED_MESSAGE_IDS.has(m.id))
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(MESSAGES_THREAD_STORAGE_KEY, JSON.stringify(cleaned))
        }
        return cleaned
      }
    }
  } catch {}
  return []
}

export function saveMessagesThread(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MESSAGES_THREAD_STORAGE_KEY, JSON.stringify(messages))
    dispatchRoomUpdated()
  } catch (err) {
    console.error("Failed to save messages thread:", err)
  }
}

export function getKickedEntries(): KickedEntries {
  if (typeof window === "undefined") return { emails: [], ids: [] }
  try {
    const saved = localStorage.getItem(MESSAGES_KICKED_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<KickedEntries>
      return {
        emails: Array.isArray(parsed.emails) ? parsed.emails : [],
        ids: Array.isArray(parsed.ids) ? parsed.ids : [],
      }
    }
  } catch {}
  return { emails: [], ids: [] }
}

function saveKickedEntries(entries: KickedEntries): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MESSAGES_KICKED_STORAGE_KEY, JSON.stringify(entries))
    dispatchRoomUpdated()
  } catch (err) {
    console.error("Failed to save kicked entries:", err)
  }
}

export function isUserKickedFromMessages(email?: string | null, id?: string | null): boolean {
  const entries = getKickedEntries()
  if (email && entries.emails.includes(email.trim().toLowerCase())) return true
  if (id && entries.ids.includes(id)) return true
  return false
}

export function kickMemberFromMessages(member: {
  id: string
  name: string
  email?: string
}): void {
  const current = getKickedEntries()
  const lowerEmail = member.email?.trim().toLowerCase()
  const nextEntries: KickedEntries = {
    emails:
      lowerEmail && !current.emails.includes(lowerEmail)
        ? [...current.emails, lowerEmail]
        : current.emails,
    ids: !current.ids.includes(member.id) ? [...current.ids, member.id] : current.ids,
  }
  saveKickedEntries(nextEntries)

  const currentMessages = getStoredMessagesThread()
  const notice: ChatMessage = {
    id: `sys-kick-${Date.now()}`,
    senderId: "system",
    senderName: "System",
    senderAvatar: "🚫",
    text: `관리자에 의해 ${member.name}님이 대화방에서 내보내졌습니다.`,
    time: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    isMe: false,
  }
  saveMessagesThread([...currentMessages, notice])
}

/**
 * 사이트 접속 또는 로그인 시 현재 로그인 회원을 Messages 라운지에 자동 참여시킵니다.
 * (관리자에 의해 내보내진 회원은 자동 참여하지 않음)
 */
export function syncMessagesAutoJoin(): void {
  if (typeof window === "undefined") return
  const auth = getStoredAuth()
  if (!auth.isLoggedIn || !auth.user?.email) return

  const email = auth.user.email.trim()
  const lowerEmail = email.toLowerCase()

  if (isUserKickedFromMessages(lowerEmail, auth.user.id)) return

  const managedUsers = getStoredManagedUsers()
  const existsInManaged = managedUsers.some(
    (u) => u.email.toLowerCase() === lowerEmail,
  )

  if (!existsInManaged) {
    const newRecord: ManagedUser = {
      id: auth.user.id || `usr-${Date.now()}`,
      nickname: auth.user.nickname,
      email,
      role: auth.user.role || (auth.user.isAdmin ? "시스템 관리자" : "일반 회원"),
      isAdmin: Boolean(auth.user.isAdmin),
      createdAt:
        auth.user.createdAt ||
        new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "short" }),
      avatarColor: auth.user.avatarColor || "from-blue-600 via-indigo-600 to-purple-600",
      bio: auth.user.bio,
    }
    saveManagedUsers([newRecord, ...managedUsers])
  }

  try {
    const joinedMarker = sessionStorage.getItem(MESSAGES_SESSION_JOINED_KEY)
    if (joinedMarker === lowerEmail) return
    sessionStorage.setItem(MESSAGES_SESSION_JOINED_KEY, lowerEmail)
  } catch {
    return
  }

  const currentMessages = getStoredMessagesThread()
  const joinNotice: ChatMessage = {
    id: `sys-autojoin-${Date.now()}`,
    senderId: "system",
    senderName: "System",
    senderAvatar: "👋",
    text: `${auth.user.nickname}님이 라운지에 참여했습니다.`,
    time: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    isMe: false,
  }
  saveMessagesThread([...currentMessages, joinNotice])
}

