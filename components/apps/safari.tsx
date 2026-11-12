"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share,
  Lock,
  Download,
  ExternalLink,
  Home,
  Globe,
  PenSquare,
  Trash2,
  Search,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  getStoredPermissions,
  PERMISSIONS_UPDATED_EVENT,
  type AppPermissions,
} from "@/lib/permissions"
import { showNotification } from "@/components/NotificationBanner"
import { useAuth } from "@/lib/auth"

export interface SafariProps {
  initialUrl?: string
  initialTab?: string
  onClose?: () => void
  onOpenSettings?: (category: "로그인" | "회원가입") => void
  onOpenFinderBrand?: (folderId: string, brandName: string) => void
}

interface FavoriteSite {
  name: string
  subtitle: string
  url: string
  pageType?: "board"
}

interface BoardPost {
  id: string
  title: string
  content: string
  password?: string
  authorName: string
  authorEmail: string
  authorRole: string
  isAdminAuthor: boolean
  createdAt: string
}

const BOARD_URL = "https://findcategory.com/board"
const BOARD_STORAGE_KEY = "findcategory_safari_board_posts"
const BOARD_UPDATED_EVENT = "findcategory_safari_board_updated"

const INITIAL_BOARD_POSTS: BoardPost[] = [
  {
    id: "post-1",
    title: "FINDCATEGORY 자유게시판 이용 안내",
    content:
      "안녕하세요, 시스템 관리자 gun입니다.\n\n회원가입 또는 로그인 후 자유롭게 글을 작성하실 수 있습니다. 본인이 작성한 게시글은 언제든 삭제할 수 있습니다.",
    authorName: "gun",
    authorEmail: "gun@findcategory.co.kr",
    authorRole: "시스템 관리자",
    isAdminAuthor: true,
    createdAt: "2026. 11. 10",
  },
  {
    id: "post-2",
    title: "파타고니아 레트로-X 이번 시즌 컬러감 공유",
    content:
      "Finder 브랜드 영상보기에서 레트로-X 아카이브 보고 실착 후기 남깁니다. 내추럴 & 네이비 배색이 데일리 코디에 가장 무난하면서도 포인트가 잘 살아나네요.",
    authorName: "Minji Cho",
    authorEmail: "minji@fashionarchive.io",
    authorRole: "아카이브 큐레이터",
    isAdminAuthor: false,
    createdAt: "2026. 11. 11",
  },
  {
    id: "post-3",
    title: "아크테릭스 알파 SV + 와이드 테크 팬츠 매치 추천",
    content:
      "고어텍스 쉘 자켓에 와이드 나일론 팬츠를 매치하면 실루엣 밸런스가 아주 좋습니다. 블랙 톤온톤 조합을 추천드립니다.",
    authorName: "David Park",
    authorEmail: "david@gorpcorelab.kr",
    authorRole: "고프코어 리뷰어",
    isAdminAuthor: false,
    createdAt: "2026. 11. 12",
  },
]

const FAVORITES: FavoriteSite[] = [
  { name: "자유게시판", subtitle: "회원 커뮤니티", url: BOARD_URL, pageType: "board" },
]

function loadStoredList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved) as T[]
      if (Array.isArray(parsed)) return parsed
    }
    localStorage.setItem(key, JSON.stringify(fallback))
  } catch {}
  return fallback
}

function saveStoredList<T>(key: string, eventName: string, items: T[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(items))
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(eventName, { detail: items }))
    })
  } catch (err) {
    console.error(`Failed to save ${key}:`, err)
  }
}

export function Safari({
  initialUrl,
  initialTab,
  onOpenSettings,
}: SafariProps) {
  const defaultUrl = initialUrl || BOARD_URL
  const defaultTitle = initialTab || "자유게시판"
  const [currentUrl, setCurrentUrl] = useState<string>(defaultUrl)
  const [currentTitle, setCurrentTitle] = useState<string>(() => defaultTitle)
  const [urlInput, setUrlInput] = useState<string>(defaultUrl)
  const [historyStack, setHistoryStack] = useState<Array<{ url: string; title: string }>>([
    { url: defaultUrl, title: defaultTitle },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  const { user, isLoggedIn, isAdmin, requireAuth } = useAuth()

  // 자유게시판 상태
  const [posts, setPosts] = useState<BoardPost[]>(() =>
    loadStoredList<BoardPost>(BOARD_STORAGE_KEY, INITIAL_BOARD_POSTS)
  )
  const [boardSearchQuery, setBoardSearchQuery] = useState("")
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isWritingPost, setIsWritingPost] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostPassword, setNewPostPassword] = useState("")
  const [showNewPostPassword, setShowNewPostPassword] = useState(false)
  const [unlockedPostIds, setUnlockedPostIds] = useState<Record<string, boolean>>({})
  const [unlockPasswordInput, setUnlockPasswordInput] = useState("")
  const [unlockPasswordError, setUnlockPasswordError] = useState("")
  const [boardError, setBoardError] = useState("")

  // Privacy & Security 권한 실시간 감지
  const [permissions, setPermissions] = useState<AppPermissions>(() => getStoredPermissions())

  useEffect(() => {
    const updatePerms = () => {
      setPermissions(getStoredPermissions())
    }
    const syncPosts = () => {
      setPosts(loadStoredList<BoardPost>(BOARD_STORAGE_KEY, INITIAL_BOARD_POSTS))
    }
    syncPosts()
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
    window.addEventListener(BOARD_UPDATED_EVENT, syncPosts)
    window.addEventListener("storage", updatePerms)
    window.addEventListener("storage", syncPosts)
    return () => {
      window.removeEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
      window.removeEventListener(BOARD_UPDATED_EVENT, syncPosts)
      window.removeEventListener("storage", updatePerms)
      window.removeEventListener("storage", syncPosts)
    }
  }, [])

  // 외부에서 initialUrl이 새로 주입되었을 때 URL 전환
  useEffect(() => {
    if (initialUrl) {
      setCurrentUrl(initialUrl)
      setCurrentTitle(initialTab || "Web Page")
      setUrlInput(initialUrl)
    }
  }, [initialUrl, initialTab])

  const resetBoardView = () => {
    setSelectedPostId(null)
    setIsWritingPost(false)
    setUnlockedPostIds({})
    setUnlockPasswordInput("")
    setUnlockPasswordError("")
    setBoardError("")
  }

  // URL 탐색 처리 (주소창 Enter 또는 즐겨찾기 클릭)
  const navigateTo = (destinationUrl: string, destinationTitle?: string) => {
    let finalUrl = destinationUrl.trim()
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`
    }

    const resolvedTitle =
      destinationTitle ||
      (finalUrl === BOARD_URL
        ? "자유게시판"
        : finalUrl.replace(/^https?:\/\//, ""))

    const nextHistory = historyStack.slice(0, historyIndex + 1)
    nextHistory.push({ url: finalUrl, title: resolvedTitle })
    setHistoryStack(nextHistory)
    setHistoryIndex(nextHistory.length - 1)

    setCurrentUrl(finalUrl)
    setCurrentTitle(resolvedTitle)
    setUrlInput(finalUrl)
    resetBoardView()

    if (finalUrl !== BOARD_URL) {
      showNotification({
        app: "Safari",
        title: "웹사이트 이동",
        message: `${destinationTitle || finalUrl} 사이트로 연결 중입니다.`,
        iconType: "safari",
      })
    }
  }

  const goBack = () => {
    if (historyIndex <= 0) return
    const prevIdx = historyIndex - 1
    const entry = historyStack[prevIdx]
    setHistoryIndex(prevIdx)
    setCurrentUrl(entry.url)
    setCurrentTitle(entry.title)
    setUrlInput(entry.url)
    resetBoardView()
  }

  const goForward = () => {
    if (historyIndex >= historyStack.length - 1) return
    const nextIdx = historyIndex + 1
    const entry = historyStack[nextIdx]
    setHistoryIndex(nextIdx)
    setCurrentUrl(entry.url)
    setCurrentTitle(entry.title)
    setUrlInput(entry.url)
    resetBoardView()
  }

  const handleFavoriteClick = (item: FavoriteSite) => {
    if (item.pageType === "board") {
      navigateTo(BOARD_URL, "자유게시판")
      return
    }
    navigateTo(item.url, item.name)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      navigateTo(urlInput)
    }
  }

  // 글쓰기 진입
  const handleStartWritePost = () => {
    if (!requireAuth("자유게시판 글 작성")) return
    setBoardError("")
    setSelectedPostId(null)
    setNewPostPassword("")
    setShowNewPostPassword(false)
    setIsWritingPost(true)
  }

  // 게시글 선택 (비밀글 상태 초기화)
  const handleSelectPost = (postId: string, initialError = "") => {
    setSelectedPostId(postId)
    setUnlockPasswordInput("")
    setUnlockPasswordError(initialError)
  }

  // 비밀글 잠금 해제
  const handleUnlockPost = (e: React.FormEvent, post: BoardPost) => {
    e.preventDefault()
    if (!unlockPasswordInput) {
      setUnlockPasswordError("비밀번호를 입력해 주세요.")
      return
    }
    if (unlockPasswordInput !== post.password) {
      setUnlockPasswordError("비밀번호가 일치하지 않습니다.")
      return
    }
    setUnlockedPostIds((prev) => ({ ...prev, [post.id]: true }))
    setUnlockPasswordInput("")
    setUnlockPasswordError("")
  }

  // 게시글 등록
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requireAuth("자유게시판 글 작성") || !user) return

    const trimmedTitle = newPostTitle.trim()
    const trimmedContent = newPostContent.trim()
    const trimmedPassword = newPostPassword.trim()
    if (!trimmedTitle) {
      setBoardError("제목을 입력해 주세요.")
      return
    }
    if (!trimmedContent) {
      setBoardError("내용을 입력해 주세요.")
      return
    }

    const now = new Date()
    const dateStr = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}`

    const newPost: BoardPost = {
      id: `post-${Date.now()}`,
      title: trimmedTitle,
      content: trimmedContent,
      ...(trimmedPassword ? { password: trimmedPassword } : {}),
      authorName: user.nickname,
      authorEmail: user.email,
      authorRole: user.role || (user.isAdmin ? "시스템 관리자" : "일반 회원"),
      isAdminAuthor: user.isAdmin,
      createdAt: dateStr,
    }

    const updated = [newPost, ...posts]
    setPosts(updated)
    saveStoredList(BOARD_STORAGE_KEY, BOARD_UPDATED_EVENT, updated)
    setNewPostTitle("")
    setNewPostContent("")
    setNewPostPassword("")
    setShowNewPostPassword(false)
    setBoardError("")
    setIsWritingPost(false)
    setSelectedPostId(newPost.id)
    setUnlockPasswordInput("")
    setUnlockPasswordError("")

    showNotification({
      app: "Safari",
      title: "게시글 등록 완료",
      message: trimmedPassword
        ? `‘${newPost.title}’ 비밀글이 자유게시판에 등록되었습니다.`
        : `‘${newPost.title}’ 글이 자유게시판에 등록되었습니다.`,
      iconType: "safari",
    })
  }

  // 본인 글 / 관리자 삭제 가능 여부
  const canDeleteAuthorContent = (authorEmail: string): boolean => {
    if (!isLoggedIn || !user) return false
    if (isAdmin) return true
    return user.email.toLowerCase() === authorEmail.toLowerCase()
  }

  // 게시글 삭제
  const handleDeletePost = (post: BoardPost) => {
    if (!canDeleteAuthorContent(post.authorEmail)) return
    if (post.password && !unlockedPostIds[post.id]) {
      handleSelectPost(post.id, "삭제하려면 먼저 게시글 비밀번호를 입력해 주세요.")
      return
    }
    if (!window.confirm(`'${post.title}' 게시글을 삭제하시겠습니까?`)) return

    const updated = posts.filter((p) => p.id !== post.id)
    setPosts(updated)
    saveStoredList(BOARD_STORAGE_KEY, BOARD_UPDATED_EVENT, updated)
    if (selectedPostId === post.id) {
      setSelectedPostId(null)
    }

    showNotification({
      app: "Safari",
      title: "게시글 삭제 완료",
      message: `‘${post.title}’ 게시글이 삭제되었습니다.`,
      iconType: "safari",
    })
  }

  // 자유게시판 여부 확인
  const isBoardPage =
    currentUrl === "" ||
    currentUrl === BOARD_URL ||
    currentUrl.startsWith(`${BOARD_URL}/`) ||
    currentUrl.startsWith("https://findcategory.com/board")

  const filteredPosts = posts.filter((post) => {
    const q = boardSearchQuery.trim().toLowerCase()
    if (!q) return true
    const isLocked = Boolean(post.password && !unlockedPostIds[post.id])
    return (
      post.title.toLowerCase().includes(q) ||
      (!isLocked && post.content.toLowerCase().includes(q)) ||
      post.authorName.toLowerCase().includes(q)
    )
  })

  const selectedPost = selectedPostId
    ? posts.find((p) => p.id === selectedPostId) || null
    : null

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 font-sans select-none overflow-hidden text-slate-800 dark:text-zinc-100">
      {/* ───────────────── 1. TOOLBAR & SMART SEARCH BAR ───────────────── */}
      <div className="h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center px-3 gap-2">
        {/* 네비게이션 버튼 (홈, 뒤로가기, 앞으로가기) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateTo(BOARD_URL, "자유게시판")}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
            title="자유게시판 (Home)"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={`p-1.5 rounded-lg transition-colors ${
              historyIndex > 0
                ? "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
                : "text-slate-300 dark:text-zinc-600 cursor-default"
            }`}
            title="뒤로 가기"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={historyIndex >= historyStack.length - 1}
            className={`p-1.5 rounded-lg transition-colors ${
              historyIndex < historyStack.length - 1
                ? "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
                : "text-slate-300 dark:text-zinc-600 cursor-default"
            }`}
            title="앞으로 가기"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 주소창 */}
        <form
          onSubmit={handleUrlSubmit}
          className="flex-1 max-w-2xl mx-auto flex items-center gap-2 bg-[#f5f5f7] dark:bg-zinc-800/90 hover:bg-[#e8e8ed] dark:hover:bg-zinc-800 rounded-xl px-3.5 py-1.5 transition-colors border border-black/5 dark:border-white/5"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs text-slate-700 dark:text-zinc-200 font-medium tracking-tight text-center"
            placeholder="Search or enter website name"
          />
          <button
            type="submit"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
            title="새로고침 / 이동"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 공유 & 다운로드 버튼 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors"
            title="Share"
          >
            <Share className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ───────────────── 2. FAVORITES BAR ───────────────── */}
      <div className="h-9 bg-[#fafafa] dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 flex items-center px-4 gap-3 overflow-x-auto text-xs">
        {FAVORITES.map((fav) => {
          const isActiveFav = fav.pageType === "board" && isBoardPage
          return (
            <button
              key={fav.name}
              type="button"
              onClick={() => handleFavoriteClick(fav)}
              className={`px-2.5 py-1 rounded-md transition-colors shrink-0 font-medium cursor-pointer ${
                isActiveFav
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                  : "hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              }`}
            >
              {fav.name}
            </button>
          )
        })}
      </div>

      {/* ───────────────── 3. MAIN CONTENT AREA ───────────────── */}
      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950">
        {isBoardPage ? (
          /* ───────────────── 자유게시판 화면 ───────────────── */
          <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6 animate-in fade-in duration-200 select-text">
            {/* 상단 헤더 */}
            <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white">
                    자유게시판
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/70 dark:border-zinc-700">
                    총 {posts.length}건
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                  {isLoggedIn && user
                    ? `${user.nickname}님으로 로그인됨 · 게시글 작성 및 본인 글 삭제가 가능합니다.`
                    : "로그인한 회원은 자유롭게 게시글을 작성하고 본인 글을 삭제할 수 있습니다."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => onOpenSettings?.("로그인")}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
                  >
                    로그인하기
                  </button>
                )}
                {!isWritingPost && (
                  <button
                    type="button"
                    onClick={handleStartWritePost}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>글쓰기</span>
                  </button>
                )}
              </div>
            </div>

            {isWritingPost ? (
              /* 새 게시글 작성 폼 */
              <form
                onSubmit={handleSubmitPost}
                className="bg-slate-50/70 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-zinc-100">
                    새 게시글 작성
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWritingPost(false)
                      setBoardError("")
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    취소
                  </button>
                </div>

                {boardError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                    {boardError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                    제목
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="게시글 제목을 입력해 주세요"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                    내용
                  </label>
                  <textarea
                    rows={6}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="자유롭게 이야기를 작성해 주세요."
                    className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>게시글 비밀번호</span>
                      <span className="text-[11px] font-normal text-slate-400 dark:text-zinc-500">
                        (선택)
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {newPostPassword.trim() ? "비밀글로 등록됩니다" : "미입력 시 전체 공개"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPostPassword ? "text" : "password"}
                      value={newPostPassword}
                      onChange={(e) => setNewPostPassword(e.target.value)}
                      placeholder="비밀번호를 입력하면 열람/삭제 시 비밀번호 확인이 필요합니다"
                      autoComplete="new-password"
                      className="w-full px-3.5 py-2 pr-10 text-xs md:text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPostPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                      title={showNewPostPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showNewPostPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    작성자: <strong className="text-slate-600 dark:text-zinc-300">{user?.nickname}</strong> ({user?.role})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWritingPost(false)
                        setBoardError("")
                        setNewPostPassword("")
                        setShowNewPostPassword(false)
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                    >
                      등록하기
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedPost ? (
              /* 게시글 상세 보기 */
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPostId(null)
                      setUnlockedPostIds({})
                      setUnlockPasswordInput("")
                      setUnlockPasswordError("")
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>목록으로</span>
                  </button>

                  {canDeleteAuthorContent(selectedPost.authorEmail) &&
                    (!selectedPost.password || unlockedPostIds[selectedPost.id]) && (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(selectedPost)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    )}
                </div>

                {selectedPost.password && !unlockedPostIds[selectedPost.id] ? (
                  /* 비밀글 비밀번호 확인 화면 */
                  <form
                    onSubmit={(e) => handleUnlockPost(e, selectedPost)}
                    className="p-8 md:p-10 flex flex-col items-center text-center space-y-4 max-w-sm mx-auto"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-zinc-100">
                        비밀번호로 보호된 게시글입니다
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        ‘{selectedPost.title}’ 내용을 보려면 비밀번호를 입력하세요.
                      </p>
                    </div>

                    <div className="w-full space-y-2">
                      <input
                        type="password"
                        value={unlockPasswordInput}
                        onChange={(e) => {
                          setUnlockPasswordInput(e.target.value)
                          if (unlockPasswordError) setUnlockPasswordError("")
                        }}
                        placeholder="게시글 비밀번호 입력"
                        autoFocus
                        className="w-full px-3.5 py-2 text-xs md:text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                      />
                      {unlockPasswordError && (
                        <p className="text-xs text-rose-500">{unlockPasswordError}</p>
                      )}
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        확인
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedPost.password && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Lock className="w-2.5 h-2.5" />
                            <span>비밀글</span>
                          </span>
                        )}
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-zinc-100">
                          {selectedPost.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          {selectedPost.authorName}
                        </span>
                        {selectedPost.isAdminAuthor && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            관리자
                          </span>
                        )}
                        <span>· {selectedPost.authorRole}</span>
                        <span>· {selectedPost.createdAt}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-xs md:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                      {selectedPost.content}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 게시글 목록 보기 */
              <div className="space-y-4">
                {/* 검색 바 */}
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-xl px-3 py-1.5 w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={boardSearchQuery}
                      onChange={(e) => setBoardSearchQuery(e.target.value)}
                      placeholder="제목, 내용, 작성자 검색..."
                      className="w-full bg-transparent outline-none text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 게시글 리스트 카드 */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredPosts.length === 0 ? (
                    <div className="py-16 text-center space-y-2">
                      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                        표시할 게시글이 없습니다.
                      </p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        첫 번째 게시글을 작성해 보세요.
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const deletable = canDeleteAuthorContent(post.authorEmail)
                      const isSecret = Boolean(post.password)
                      return (
                        <div
                          key={post.id}
                          onClick={() => handleSelectPost(post.id)}
                          className="px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isSecret && (
                                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {post.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {isSecret ? "비밀번호로 보호된 게시글입니다." : post.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1 text-xs font-medium text-slate-700 dark:text-zinc-200">
                                <span>{post.authorName}</span>
                                {post.isAdminAuthor && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    관리자
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                {post.createdAt}
                              </div>
                            </div>

                            {deletable && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePost(post)
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="게시글 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 외부 웹페이지 인앱 브라우저 뷰어 */
          <div className="h-full w-full flex flex-col p-4 md:p-6 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-900 px-4 py-2.5 rounded-xl text-xs border border-slate-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-2 truncate max-w-xl">
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-slate-700 dark:text-zinc-300 truncate">
                  {currentUrl}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigateTo(BOARD_URL, "자유게시판")}
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  자유게시판으로 돌아가기
                </button>
                {permissions.safari.allowExternalLinks && (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>새 창으로 열기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm relative">
              <iframe
                src={currentUrl}
                title={currentTitle}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        )}
      </div>

      {/* ───────────────── 4. STATUS BAR ───────────────── */}
      <div className="h-6 bg-[#f6f6f8] dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {isBoardPage ? "FINDCATEGORY 자유게시판" : currentUrl}
          </span>
        </div>
        <span>SSL 256-bit Encrypted</span>
      </div>
    </div>
  )
}
