"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Search, X, User, UserPlus, SlidersHorizontal, Volume2 } from "lucide-react"
import type { AppType } from "./macos-desktop"
import {
  FinderIcon,
  SafariIcon,
  MessagesIcon,
  NotesIcon,
  TerminalIcon,
  SettingsIcon,
  LaunchpadIcon,
} from "./app-icons"

interface SpotlightProps {
  onClose: () => void
  onOpenApp: (
    app: AppType,
    title: string,
    options?: {
      settingsCategory?: string
      finderFolderId?: string
      videoUrl?: string
      initialUrl?: string
    }
  ) => void
  onLaunchpadClick?: () => void
  onControlCenterClick?: () => void
}

const UserIconWrapper = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
    <User className="w-4 h-4" />
  </div>
)

const UserPlusIconWrapper = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
    <UserPlus className="w-4 h-4" />
  </div>
)

const ControlCenterIconWrapper = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-xs">
    <SlidersHorizontal className="w-4 h-4" />
  </div>
)

const SoundIconWrapper = () => (
  <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
    <Volume2 className="w-4 h-4" />
  </div>
)

export function Spotlight({
  onClose,
  onOpenApp,
  onLaunchpadClick,
  onControlCenterClick,
}: SpotlightProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleGlobalKey)
    return () => window.removeEventListener("keydown", handleGlobalKey)
  }, [onClose])

  const allItems = useMemo(
    () => [
      {
        id: "safari",
        label: "Safari",
        subLabel: "한줄 게시판 및 웹 브라우저",
        keywords: ["safari", "사파리", "게시판", "한줄게시판", "인터넷", "웹", "web", "board"],
        type: "애플리케이션",
        icon: SafariIcon,
        action: () => onOpenApp("safari", "Safari"),
      },
      {
        id: "brand-video",
        label: "영상",
        subLabel: "Finder - 브랜드 영상 감상 및 관리",
        keywords: ["영상", "브랜드 영상", "비디오", "video", "finder", "파인더", "brand"],
        type: "애플리케이션",
        icon: FinderIcon,
        action: () => onOpenApp("finder", "영상"),
      },
      {
        id: "brand-survey",
        label: "브랜드 신청",
        subLabel: "Finder - 브랜드 조사 및 신규 신청 양식",
        keywords: ["브랜드 신청", "브랜드 조사 신청", "신청", "조사", "survey", "form", "finder", "파인더"],
        type: "애플리케이션",
        icon: FinderIcon,
        action: () => onOpenApp("finder", "브랜드 신청"),
      },
      {
        id: "messages",
        label: "Messages",
        subLabel: "실시간 대화 및 채팅",
        keywords: ["messages", "메시지", "채팅", "chat", "대화", "톡"],
        type: "애플리케이션",
        icon: MessagesIcon,
        action: () => onOpenApp("messages", "Messages"),
      },
      {
        id: "notes",
        label: "Notes",
        subLabel: "시스템 소식 및 메모",
        keywords: ["notes", "노트", "소식", "공지", "공지사항", "메모", "notice"],
        type: "애플리케이션",
        icon: NotesIcon,
        action: () => onOpenApp("notes", "Notes"),
      },
      {
        id: "terminal",
        label: "Terminal",
        subLabel: "시스템 명령어 및 터미널 게시판",
        keywords: ["terminal", "터미널", "콘솔", "게시판", "cmd", "명령어"],
        type: "애플리케이션",
        icon: TerminalIcon,
        action: () => onOpenApp("terminal", "Terminal"),
      },
      {
        id: "settings",
        label: "Settings",
        subLabel: "시스템 환경설정 및 관리",
        keywords: ["settings", "설정", "환경설정", "시스템설정", "config", "옵션"],
        type: "애플리케이션",
        icon: SettingsIcon,
        action: () => onOpenApp("settings", "Settings"),
      },
      {
        id: "login",
        label: "로그인",
        subLabel: "FINDCATEGORY 계정 로그인",
        keywords: ["로그인", "login", "계정", "회원", "인증", "sign in"],
        type: "계정 / 환경설정",
        icon: UserIconWrapper,
        action: () => onOpenApp("settings", "Settings", { settingsCategory: "로그인" }),
      },
      {
        id: "register",
        label: "회원가입",
        subLabel: "FINDCATEGORY 신규 회원 가입",
        keywords: ["회원가입", "가입", "register", "sign up", "계정생성"],
        type: "계정 / 환경설정",
        icon: UserPlusIconWrapper,
        action: () => onOpenApp("settings", "Settings", { settingsCategory: "회원가입" }),
      },
      {
        id: "launchpad",
        label: "Launchpad",
        subLabel: "모든 앱 모아보기",
        keywords: ["launchpad", "런처", "런치패드", "모아보기", "앱목록", "모든앱"],
        type: "시스템 유틸리티",
        icon: LaunchpadIcon,
        action: () => onLaunchpadClick?.(),
      },
      {
        id: "control-center",
        label: "제어 센터 (Control Center)",
        subLabel: "볼륨, 밝기, 다크 모드 빠른 제어",
        keywords: ["control", "제어센터", "제어", "볼륨", "밝기", "다크모드", "컨트롤"],
        type: "시스템 제어",
        icon: ControlCenterIconWrapper,
        action: () => onControlCenterClick?.(),
      },
      {
        id: "sound",
        label: "사운드 시스템",
        subLabel: "배경음악 재생 및 음량 조절",
        keywords: ["sound", "음악", "볼륨", "사운드", "소리", "오디오", "music"],
        type: "시스템 제어",
        icon: SoundIconWrapper,
        action: () => onControlCenterClick?.(),
      },
    ],
    [onOpenApp, onLaunchpadClick, onControlCenterClick],
  )

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q)
      const matchSub = item.subLabel?.toLowerCase().includes(q)
      const matchType = item.type.toLowerCase().includes(q)
      const matchKeyword = item.keywords.some((k) => k.toLowerCase().includes(q))
      return matchLabel || matchSub || matchType || matchKeyword
    })
  }, [query, allItems])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredResults.length)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (filteredResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length)
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action()
        onClose()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 md:pt-32 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[580px] bg-white/95 dark:bg-zinc-900/95 macos-blur rounded-2xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 text-slate-900 dark:text-zinc-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/10 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Spotlight 검색 (앱, 기능, 키워드...)"
            className="flex-1 bg-transparent outline-none text-base md:text-lg text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-normal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results section header */}
        <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <span>{query ? `검색 결과 (${filteredResults.length})` : "추천 앱 및 빠른 실행"}</span>
          <span className="text-[10px] lowercase text-slate-400 dark:text-zinc-500">
            {filteredResults.length}개 항목
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => {
              const IconComponent = result.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={result.id}
                  ref={(el) => {
                    itemRefs.current[index] = el
                  }}
                  type="button"
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 transition-colors cursor-pointer select-none text-left ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-900 dark:text-zinc-100"
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    result.action()
                    onClose()
                  }}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    <IconComponent />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.label}</div>
                    {result.subLabel && (
                      <div
                        className={`text-xs truncate ${
                          isSelected ? "text-white/80" : "text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {result.subLabel}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-[11px] shrink-0 font-normal ${
                      isSelected ? "text-white/70" : "text-slate-400 dark:text-zinc-500"
                    }`}
                  >
                    {result.type}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-sm">
              &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <span>이동: ↑ ↓</span>
            <span>·</span>
            <span>실행: Enter</span>
            <span>·</span>
            <span>닫기: Esc</span>
          </div>
          <span className="font-medium text-[10px]">FINDCATEGORY Spotlight</span>
        </div>
      </div>
    </div>
  )
}
