"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Phone,
  Video,
  Info,
  Search,
  Users,
  Sparkles,
  Hash,
  Circle,
  Plus,
  Smile,
  ShieldCheck,
  CheckCheck,
  Trash2,
  UserMinus,
} from "lucide-react"
import {
  getStoredPermissions,
  PERMISSIONS_UPDATED_EVENT,
  type AppPermissions,
} from "@/lib/permissions"
import { showNotification } from "@/components/NotificationBanner"
import { triggerTemplateNotification } from "@/lib/notification-templates"
import { useAuth } from "@/lib/auth"
import {
  INITIAL_MANAGED_USERS,
  getStoredManagedUsers,
  USERS_UPDATED_EVENT,
  type ManagedUser,
} from "@/lib/users"
import {
  type ChatMessage,
  MESSAGES_ROOM_UPDATED_EVENT,
  getStoredMessagesThread,
  saveMessagesThread,
  isUserKickedFromMessages,
  kickMemberFromMessages,
  syncMessagesAutoJoin,
} from "@/lib/messages-room"

export interface CreatorMember {
  id: string
  name: string
  email?: string
  role: string
  avatar: string
  avatarBg: string
  isOnline: boolean
  isAdmin?: boolean
}

export type { ChatMessage }

function getCreatorAvatar(user: ManagedUser): string {
  const email = user.email.toLowerCase()
  if (email === "minji@fashionarchive.io") return "🎨"
  if (email === "elena@nordicfashion.com") return "🏔️"
  if (email === "david@gorpcorelab.kr") return "🧥"
  if (email === "alex@techwearcollective.com") return "👟"
  return user.nickname.trim().charAt(0).toUpperCase() || "U"
}

function mapManagedUsersToCreators(users: ManagedUser[]): CreatorMember[] {
  return users
    .filter((u) => !isUserKickedFromMessages(u.email, u.id))
    .map((u) => ({
      id: u.id,
      name: u.nickname,
      email: u.email,
      role: u.role || (u.isAdmin ? "시스템 관리자" : "일반 회원"),
      avatar: getCreatorAvatar(u),
      avatarBg: u.avatarColor || "from-blue-600 via-indigo-600 to-purple-600",
      isOnline: true,
      isAdmin: u.isAdmin,
    }))
}

export function Messages() {
  const { user, isLoggedIn, isAdmin, isGuest, requireAuth } = useAuth()

  // 참여자 상태 (Settings > 회원관리 데이터와 실시간 매칭, 내보낸 회원 제외)
  const [members, setMembers] = useState<CreatorMember[]>(() =>
    mapManagedUsersToCreators(INITIAL_MANAGED_USERS),
  )
  const [searchMemberQuery, setSearchMemberQuery] = useState("")

  // 실시간 단일 공용 스레드 메시지 상태 (localStorage 동기화)
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredMessagesThread())
  const [newMessage, setNewMessage] = useState("")
  const [showInfoMenu, setShowInfoMenu] = useState(false)
  const infoMenuRef = useRef<HTMLDivElement>(null)

  const isCurrentUserKicked = Boolean(
    isLoggedIn && user && isUserKickedFromMessages(user.email, user.id),
  )

  // Privacy & Security 권한 실시간 감지
  const [permissions, setPermissions] = useState<AppPermissions>(() => getStoredPermissions())

  useEffect(() => {
    const updatePerms = () => {
      setPermissions(getStoredPermissions())
    }
    const syncRoom = () => {
      setMembers(mapManagedUsersToCreators(getStoredManagedUsers()))
      setMessages(getStoredMessagesThread())
    }
    syncMessagesAutoJoin()
    syncRoom()
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
    window.addEventListener(USERS_UPDATED_EVENT, syncRoom)
    window.addEventListener(MESSAGES_ROOM_UPDATED_EVENT, syncRoom)
    window.addEventListener("storage", updatePerms)
    window.addEventListener("storage", syncRoom)
    return () => {
      window.removeEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
      window.removeEventListener(USERS_UPDATED_EVENT, syncRoom)
      window.removeEventListener(MESSAGES_ROOM_UPDATED_EVENT, syncRoom)
      window.removeEventListener("storage", updatePerms)
      window.removeEventListener("storage", syncRoom)
    }
  }, [])

  // 메시지 삭제 핸들러 (채팅 메시지 삭제 권한 연동)
  const handleDeleteMessage = (id: string) => {
    if (!permissions.messages.allowDelete) return
    const updated = messages.filter((m) => m.id !== id)
    setMessages(updated)
    saveMessagesThread(updated)
  }

  // 대화 초기화 핸들러
  const handleResetConversation = () => {
    const resetMessages: ChatMessage[] = [
      {
        id: `sys-reset-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        senderAvatar: "✨",
        text: "대화가 초기화되었습니다.",
        time: "",
        isMe: false,
      },
    ]
    setMessages(resetMessages)
    saveMessagesThread(resetMessages)
    setShowInfoMenu(false)
  }

  // 관리자 전용: 회원 내보내기 핸들러
  const handleKickMember = (member: CreatorMember) => {
    if (!isAdmin || member.isAdmin) return
    if (!window.confirm(`'${member.name}' 회원을 Messages 대화방에서 내보내시겠습니까?`)) return

    kickMemberFromMessages({
      id: member.id,
      name: member.name,
      email: member.email,
    })
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    setMessages(getStoredMessagesThread())

    showNotification({
      app: "Messages",
      title: "회원 내보내기 완료",
      message: `‘${member.name}’ 회원을 대화방에서 내보냈습니다.`,
      iconType: "messages",
    })
  }

  useEffect(() => {
    if (!showInfoMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (infoMenuRef.current && !infoMenuRef.current.contains(e.target as Node)) {
        setShowInfoMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showInfoMenu])

  // 자동 스크롤 참조
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (!requireAuth("커뮤니티 채팅")) return
    if (isCurrentUserKicked) return
    const trimmed = newMessage.trim()
    if (!trimmed) return

    const nowTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "me",
      senderName: user?.nickname || "나 (You)",
      senderRole: user?.role,
      senderAvatar: user?.nickname?.trim().charAt(0).toUpperCase() || "💡",
      senderAvatarBg: user?.avatarColor,
      senderIsAdmin: user?.isAdmin,
      text: trimmed,
      time: nowTime,
      isMe: true,
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    saveMessagesThread(updated)
    setNewMessage("")

    // macOS 알림 배너 트리거 (템플릿 기반 본인 메시지 전송 확인)
    const previewText = trimmed.length > 35 ? `${trimmed.substring(0, 35)}...` : trimmed
    triggerTemplateNotification("message_sent", { text: previewText }, {
      app: "Messages",
      title: "메시지 전송 완료",
      message: previewText,
      iconType: "messages",
    })
  }

  // 신규 유저 동적 입장 시뮬레이션
  const handleSimulateNewUserJoin = () => {
    const newGuestId = `m-${Date.now()}`
    const randomNum = Math.floor(Math.random() * 900) + 100
    const newCreator: CreatorMember = {
      id: newGuestId,
      name: `Creator_${randomNum}`,
      role: "Guest Archivist",
      avatar: "✨",
      avatarBg: "from-indigo-500 to-sky-500",
      isOnline: true,
    }

    setMembers((prev) => [newCreator, ...prev])

    // 라운지 입장 시스템 메시지 추가
    const joinTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    const systemNotice: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      senderAvatar: "👋",
      text: `🎉 ${newCreator.name}님이 라운지에 새로 참여하셨습니다.`,
      time: joinTime,
      isMe: false,
    }
    const updated = [...messages, systemNotice]
    setMessages(updated)
    saveMessagesThread(updated)
  }

  // 검색 필터링된 참여자 목록
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchMemberQuery.toLowerCase())
  )

  const onlineCount = members.filter((m) => m.isOnline).length

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-900 font-sans select-none overflow-hidden">
      {/* ───────────────── 1. LEFT SIDEBAR: ACTIVE CREATORS LIST ───────────────── */}
      <div className="w-64 md:w-72 border-r border-slate-200/80 dark:border-zinc-800 flex flex-col bg-slate-50/70 dark:bg-zinc-950/70 backdrop-blur-md shrink-0">
        {/* 상단 헤더: Active Creators & 온라인 수치 */}
        <div className="p-3.5 border-b border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xs text-slate-800 dark:text-zinc-100">
              Active Creators
            </span>
            <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-2 py-0.2 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount}
            </span>
          </div>

          <button
            onClick={handleSimulateNewUserJoin}
            title="새 유저 입장 시뮬레이션"
            className="p-1 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 참여자 검색창 */}
        <div className="p-2.5 border-b border-slate-200/50 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="참여자 또는 직무 검색..."
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 text-xs"
            />
          </div>
        </div>

        {/* 참여자 목록 (스크롤) */}
        <div className="flex-1 overflow-auto divide-y divide-slate-100/60 dark:divide-zinc-800/40 p-1">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-3 cursor-default group"
            >
              {/* 아바타 & 실시간 상태 뱃지 */}
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${member.avatarBg} text-white font-bold flex items-center justify-center text-base shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  {member.avatar}
                </div>
                {member.isOnline ? (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"
                    title="온라인"
                  />
                ) : (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-zinc-900"
                    title="오프라인"
                  />
                )}
              </div>

              {/* 닉네임 및 상태 / 관리자 내보내기 버튼 */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-xs text-slate-800 dark:text-zinc-100 truncate">
                      {member.name}
                    </span>
                    {member.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                        관리자
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.isOnline && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                        온라인
                      </span>
                    )}
                    {isAdmin && !member.isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleKickMember(member)
                        }}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 flex items-center gap-0.5 transition-colors cursor-pointer"
                        title={`${member.name} 내보내기`}
                      >
                        <UserMinus className="w-2.5 h-2.5" />
                        <span>내보내기</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 사이드바 하단 정보 */}
        <div className="p-3 border-t border-slate-200/70 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
          <span>총 {members.length}명의 크리에이터</span>
          <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
          </span>
        </div>
      </div>

      {/* ───────────────── 2. RIGHT CHAT AREA: SHARED GROUP CHATROOM ───────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900">
        {/* 상단 헤더: Brand Community Lounge (#general-discussion) */}
        <div className="h-14 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md select-none shrink-0 relative z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                  Brand Community Lounge
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                  #general-discussion
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>크리에이터 브랜드 취향 & 수다 라운지 • {onlineCount}명 참여 중</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 relative" ref={infoMenuRef}>
            <button
              type="button"
              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowInfoMenu((prev) => !prev)}
              title="대화 정보 및 초기화"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showInfoMenu
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Info className="w-4 h-4" />
            </button>

            {showInfoMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1.5">
                  <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                    라운지 대화 관리
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    #general-discussion · 메시지 {messages.filter((m) => m.senderId !== "system").length}개
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetConversation}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>대화 초기화</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────── 3. MESSAGE THREAD AREA ───────────────── */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
          {/* 환영 안내 배너 */}
          <div className="flex justify-center my-2">
            <div className="bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 text-[11px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong>#general-discussion</strong> 크리에이터 브랜드 취향 & 수다 라운지에 오신 것을 환영합니다! 🎉
              </span>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-zinc-500">
              <p className="text-[13px] font-medium">아직 대화가 없습니다.</p>
              <p className="text-[11px] mt-1">아래 입력창에 메시지를 입력해 대화를 시작해 보세요.</p>
            </div>
          )}

          {messages.map((message) => {
            // 시스템 안내 메시지
            if (message.senderId === "system") {
              return (
                <div key={message.id} className="flex justify-center my-1">
                  <span className="text-[11px] text-slate-400 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1 rounded-full border border-slate-200/60 dark:border-zinc-800">
                    {message.text}
                  </span>
                </div>
              )
            }

            // 본인 메시지 (파란색 말풍선, 오른쪽 정렬)
            if (message.isMe) {
              return (
                <div key={message.id} className="flex flex-col items-end animate-in fade-in duration-150">
                  <div className="max-w-xs sm:max-w-md md:max-w-lg bg-[#007AFF] text-white rounded-2xl rounded-br-xs px-4 py-2.5 shadow-xs text-xs leading-relaxed break-words">
                    <p>{message.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                    <span>{message.time}</span>
                    <CheckCheck className="w-3 h-3 text-blue-500 inline" />
                    {permissions.messages.allowDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 ml-1"
                        title="메시지 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            }

            // 다른 참여자 메시지 (회색 말풍선, 왼쪽 정렬, 상단 닉네임/직무 노출)
            return (
              <div
                key={message.id}
                className="flex items-start gap-2.5 max-w-xs sm:max-w-md md:max-w-lg animate-in fade-in duration-150 group"
              >
                {/* 발신자 아바타 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs shrink-0 mt-0.5 ${
                    message.senderAvatarBg
                      ? `bg-gradient-to-tr ${message.senderAvatarBg} text-white`
                      : "bg-slate-200 dark:bg-zinc-800"
                  }`}
                >
                  {message.senderAvatar}
                </div>

                {/* 메시지 바디 */}
                <div className="flex flex-col items-start min-w-0">
                  {/* 말풍선 상단 닉네임 & 직무 뱃지 */}
                  <div className="flex items-center gap-1.5 mb-1 pl-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {message.senderName}
                    </span>
                    {message.senderIsAdmin && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                        관리자
                      </span>
                    )}
                    {message.senderRole && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold">
                        {message.senderRole}
                      </span>
                    )}
                  </div>

                  {/* 회색 말풍선 */}
                  <div className="bg-[#E9E9EB] dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs text-xs leading-relaxed break-words">
                    <p>{message.text}</p>
                  </div>

                  {/* 전송 시각 & 삭제 권한 활성화 시 삭제 버튼 */}
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 pl-1">
                    <span>{message.time}</span>
                    {permissions.messages.allowDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                        title="메시지 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ───────────────── 4. INPUT BAR: MESSAGE #LOUNGE... ───────────────── */}
        <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 select-none shrink-0">
          {isCurrentUserKicked ? (
            <div className="flex items-center justify-center py-2.5 px-4 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 max-w-lg mx-auto">
              <span>🚫 관리자에 의해 Messages 라운지에서 내보내졌습니다.</span>
            </div>
          ) : permissions.messages.allowTextInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2 max-w-4xl mx-auto"
            >
              <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                {permissions.messages.allowAttachment && (
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                    title="이모티콘 및 파일 첨부"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                )}
                <input
                  type="text"
                  placeholder={isGuest ? "로그인이 필요합니다 (설정에서 로그인 후 대화에 참여하세요)" : "Message #lounge..."}
                  value={newMessage}
                  onChange={(e) => {
                    if (isGuest) {
                      requireAuth("커뮤니티 채팅")
                      return
                    }
                    setNewMessage(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1 bg-transparent outline-none text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-9 h-9 rounded-full bg-[#007AFF] hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#007AFF] text-white flex items-center justify-center shadow-sm transition-all hover:scale-105 shrink-0 cursor-pointer"
                title="메시지 전송"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center py-2.5 px-4 rounded-full bg-slate-100/70 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
              <span>🔒 관리자 권한 설정에 의해 메시지 입력 버튼 및 전송이 비활성화되었습니다.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
