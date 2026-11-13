"use client"

import { useState, useEffect } from "react"
import {
  Lock,
  Monitor,
  User,
  Mail,
  Key,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Check,
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  Users,
  Search,
  Trash2,
  UserCog,
  ShieldAlert,
  Radio,
  Send,
  BellRing,
  Settings2,
  Sliders,
  RefreshCw,
  Megaphone,
  BarChart3,
} from "lucide-react"
import { showNotification, type NotificationAppType } from "@/components/NotificationBanner"
import {
  type NotificationTemplate,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_TEMPLATES,
  getStoredNotificationTemplates,
  updateNotificationTemplate,
  resetNotificationTemplates,
  triggerTemplateNotification,
  getStoredNotificationPreferences,
  saveNotificationPreferences,
  NOTIFICATION_TEMPLATES_UPDATED_EVENT,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
} from "@/lib/notification-templates"
import {
  NOTIFICATION_TRIGGER_CHART,
  type NotificationTriggerCategory,
  type NotificationTriggerId,
  type NotificationTriggerMeta,
  getStoredNotificationTriggerSettings,
  saveNotificationTriggerSettings,
  NOTIFICATION_TRIGGER_SETTINGS_UPDATED_EVENT,
  isNotificationTriggerEnabled,
} from "@/lib/notification-triggers"
import {
  getStoredAuth,
  setStoredAuth,
  logout as authLogout,
  isUserAdmin,
  AUTH_CHANGED_EVENT,
} from "@/lib/auth"
import {
  type ManagedUser,
  getStoredManagedUsers,
  saveManagedUsers,
  USERS_UPDATED_EVENT,
} from "@/lib/users"
import {
  useSystemControls,
  getEffectiveVolumeGain,
  type AppearanceMode,
} from "@/lib/system-controls"
export type { ManagedUser }

// 설정 카테고리 정의
const settingsCategories: Array<{
  icon: typeof Users
  label: string
  description: string
  adminOnly?: boolean
}> = [
  { icon: Users, label: "회원관리", description: "사용자 계정 및 등급 관리", adminOnly: true },
  { icon: User, label: "회원가입", description: "계정 생성 및 가입" },
  { icon: BarChart3, label: "알림", description: "알림 팝업 조건 및 ON/OFF 관리", adminOnly: true },
]

// 관리자 계정 식별 상수 (단일 판별 함수는 @/lib/auth 의 isUserAdmin 사용)
export const ADMIN_EMAIL = "admin"

interface UserAccount {
  nickname: string
  email: string
  role: string
  isAdmin: boolean
  category?: string
  bio: string
  isRegistered: boolean
  avatarColor: string
  createdAt: string
}

interface MacOSToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
  label?: string
}

/**
 * macOS Sequoia 네이티브 스타일 슬라이딩 토글 스위치 (ON: 파란색, OFF: 회색)
 */
function MacOSToggle({ checked, onChange, disabled = false, label }: MacOSToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
        checked ? "bg-blue-600" : "bg-slate-300 dark:bg-zinc-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export interface SettingsProps {
  initialCategory?: string
  navigationRequestId?: number
  onClose?: () => void
}

export function Settings({ initialCategory, navigationRequestId, onClose }: SettingsProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "로그인")
  const { controls: systemControls, setSystemControls } = useSystemControls()

  // 로그인 상태 관리 (기본값: 비로그인 상태)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)

  // 로그인 폼 State
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // 회원가입 폼 State
  const [formNickname, setFormNickname] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("")
  const [formBio, setFormBio] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")

  // 중복확인 상태 및 메시지 State
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [nicknameMsg, setNicknameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [emailChecked, setEmailChecked] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordChecked, setPasswordChecked] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 제출 성공 피드백 모달 및 토스트 State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // 회원 관리 State (회원 목록, 검색어, 역할 필터)
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "admin" | "regular">("all")

  // ───────────────── Notifications 제어판 상태 ─────────────────
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() =>
    getStoredNotificationPreferences()
  )

  // 1. 수동 알림 발송 폼 State
  const [broadcastApp, setBroadcastApp] = useState("FIND_CATEGORY")
  const [broadcastTitle, setBroadcastTitle] = useState("FIND_CATEGORY")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [broadcastIconType, setBroadcastIconType] = useState<NotificationAppType>("findcategory")
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)

  // 2. 알림 템플릿 수정 State
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(() =>
    getStoredNotificationTemplates()
  )
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("welcome")
  const [editingTemplateTitle, setEditingTemplateTitle] = useState("")
  const [editingTemplateMessage, setEditingTemplateMessage] = useState("")
  const [editingTemplateApp, setEditingTemplateApp] = useState("")
  const [editingTemplateIcon, setEditingTemplateIcon] = useState<NotificationAppType>("findcategory")
  const [templateSaveSuccess, setTemplateSaveSuccess] = useState(false)

  // 템플릿 선택 전환 시 편집 폼 동기화
  useEffect(() => {
    const active = notificationTemplates.find((t) => t.id === selectedTemplateId)
    if (active) {
      setEditingTemplateTitle(active.title)
      setEditingTemplateMessage(active.message)
      setEditingTemplateApp(active.app)
      setEditingTemplateIcon(active.iconType)
    }
  }, [selectedTemplateId, notificationTemplates])

  // 알림 템플릿 및 환경설정·팝업 조건 외부 업데이트 이벤트 감지
  const [triggerSettings, setTriggerSettings] = useState<Record<NotificationTriggerId, boolean>>(() =>
    getStoredNotificationTriggerSettings()
  )
  const [chartCategoryFilter, setChartCategoryFilter] = useState<"all" | NotificationTriggerCategory>("all")

  useEffect(() => {
    const handleTemplateUpdate = () => {
      setNotificationTemplates(getStoredNotificationTemplates())
    }
    const handlePrefUpdate = () => {
      setNotificationPrefs(getStoredNotificationPreferences())
    }
    const handleTriggerUpdate = () => {
      setTriggerSettings(getStoredNotificationTriggerSettings())
    }
    window.addEventListener(NOTIFICATION_TEMPLATES_UPDATED_EVENT, handleTemplateUpdate)
    window.addEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, handlePrefUpdate)
    window.addEventListener(NOTIFICATION_TRIGGER_SETTINGS_UPDATED_EVENT, handleTriggerUpdate)
    window.addEventListener("storage", handleTemplateUpdate)
    window.addEventListener("storage", handlePrefUpdate)
    window.addEventListener("storage", handleTriggerUpdate)
    return () => {
      window.removeEventListener(NOTIFICATION_TEMPLATES_UPDATED_EVENT, handleTemplateUpdate)
      window.removeEventListener(NOTIFICATION_PREFERENCES_UPDATED_EVENT, handlePrefUpdate)
      window.removeEventListener(NOTIFICATION_TRIGGER_SETTINGS_UPDATED_EVENT, handleTriggerUpdate)
      window.removeEventListener("storage", handleTemplateUpdate)
      window.removeEventListener("storage", handlePrefUpdate)
      window.removeEventListener("storage", handleTriggerUpdate)
    }
  }, [])

  const handleToggleTriggerSetting = (id: NotificationTriggerId, nextEnabled?: boolean) => {
    const current = getStoredNotificationTriggerSettings()
    const resolvedNext =
      typeof nextEnabled === "boolean" ? nextEnabled : current[id] === false
    const updated: Record<NotificationTriggerId, boolean> = {
      ...current,
      [id]: resolvedNext,
    }
    saveNotificationTriggerSettings(updated)
    setTriggerSettings(updated)
    playPopSound()
  }

  const handleSetAllTriggers = (enabled: boolean) => {
    const updated = NOTIFICATION_TRIGGER_CHART.reduce(
      (acc, item) => {
        acc[item.id] = enabled
        return acc
      },
      {} as Record<NotificationTriggerId, boolean>,
    )
    saveNotificationTriggerSettings(updated)
    setTriggerSettings(updated)
    playPopSound()
    setToastMessage(enabled ? "모든 알림 팝업이 활성화되었습니다." : "모든 알림 팝업이 꺼졌습니다.")
    setTimeout(() => setToastMessage(""), 3500)
  }

  const handleTestTriggerItem = (item: NotificationTriggerMeta) => {
    if (triggerSettings[item.id] === false) return
    showNotification({
      app: item.app,
      title: item.exampleTitle,
      message: `[테스트] ${item.condition}`,
      iconType: item.iconType,
      triggerId: item.id,
    })
    playPopSound()
  }

  // 수동 알림 전송 핸들러
  const handleBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = broadcastTitle.trim() || "FIND_CATEGORY"
    const trimmedMessage = broadcastMessage.trim()

    if (!trimmedMessage) {
      setToastMessage("알림 내용을 입력해 주세요.")
      setTimeout(() => setToastMessage(""), 3000)
      return
    }

    showNotification({
      app: broadcastApp || "FIND_CATEGORY",
      title: trimmedTitle,
      message: trimmedMessage,
      iconType: broadcastIconType || "findcategory",
      triggerId: "admin_broadcast",
    })

    playPopSound()
    setBroadcastSuccess(true)
    setTimeout(() => setBroadcastSuccess(false), 3000)
    setToastMessage("전체 화면 실시간 알림 배너가 발송되었습니다.")
    setTimeout(() => setToastMessage(""), 4000)
  }

  // 템플릿 저장 핸들러
  const handleSaveTemplate = () => {
    if (!editingTemplateTitle.trim() || !editingTemplateMessage.trim()) {
      setToastMessage("알림 제목과 내용을 모두 입력해 주세요.")
      setTimeout(() => setToastMessage(""), 3000)
      return
    }

    const updated = updateNotificationTemplate(selectedTemplateId, {
      title: editingTemplateTitle.trim(),
      message: editingTemplateMessage.trim(),
      app: editingTemplateApp.trim(),
      iconType: editingTemplateIcon,
    })
    setNotificationTemplates(updated)
    playPopSound()
    setTemplateSaveSuccess(true)
    setTimeout(() => setTemplateSaveSuccess(false), 3000)
    setToastMessage("알림 템플릿 문구가 성공적으로 저장되었습니다.")
    setTimeout(() => setToastMessage(""), 4000)
  }

  // 템플릿 테스트 발송 핸들러
  const handleTestTemplate = () => {
    triggerTemplateNotification(selectedTemplateId, {
      nickname: userAccount?.nickname || "홍길동",
      brand: "파타고니아",
      folderName: "신규 아웃도어",
      text: "안녕하세요! 이번 주말 룩북 추천 부탁드립니다.",
    })
    playPopSound()
    setToastMessage("수정된 템플릿 알림이 우측 상단에 테스트 발송되었습니다.")
    setTimeout(() => setToastMessage(""), 3500)
  }

  // 단일 템플릿 초기화 핸들러
  const handleResetCurrentTemplate = () => {
    const def = DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === selectedTemplateId)
    if (!def) return
    const updated = updateNotificationTemplate(selectedTemplateId, {
      title: def.title,
      message: def.message,
      app: def.app,
      iconType: def.iconType,
    })
    setNotificationTemplates(updated)
    playPopSound()
    setToastMessage("현재 템플릿이 기본 문구로 복원되었습니다.")
    setTimeout(() => setToastMessage(""), 3500)
  }

  // 전체 템플릿 초기화 핸들러
  const handleResetAllTemplates = () => {
    if (window.confirm("모든 알림 템플릿을 시스템 초기 기본값으로 복원하시겠습니까?")) {
      const reset = resetNotificationTemplates()
      setNotificationTemplates(reset)
      playPopSound()
      setToastMessage("모든 알림 템플릿이 초기화되었습니다.")
      setTimeout(() => setToastMessage(""), 4000)
    }
  }

  // 알림 수신 설정 토글 핸들러
  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    const updated = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    }
    setNotificationPrefs(updated)
    saveNotificationPreferences(updated)
    playPopSound()
    setToastMessage("알림 수신 설정이 변경되었습니다.")
    setTimeout(() => setToastMessage(""), 2500)
  }

  // localStorage에서 기존 로그인 및 등록 유저 및 전체 회원 목록 확인
  useEffect(() => {
    const syncUsers = () => {
      setManagedUsers(getStoredManagedUsers())
    }
    syncUsers()

    // 2. 현재 로그인 계정 및 인증 상태 로드 (lib/auth 기반 동기화)
    const syncAuth = () => {
      const auth = getStoredAuth()
      setIsLoggedIn(auth.isLoggedIn)
      setUserAccount(auth.user as UserAccount | null)
      const adminOnlyCategories = ["회원관리", "알림"]
      if (auth.isLoggedIn && auth.user) {
        setSelectedCategory((prev) => {
          if (prev === "로그인") return "계정관리"
          if (!auth.user?.isAdmin && adminOnlyCategories.includes(prev)) return "계정관리"
          return prev
        })
      } else {
        setSelectedCategory((prev) =>
          prev === "계정관리" || adminOnlyCategories.includes(prev) ? "로그인" : prev
        )
      }
    }
    syncAuth()

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth)
    window.addEventListener(USERS_UPDATED_EVENT, syncUsers)
    window.addEventListener("storage", syncAuth)
    window.addEventListener("storage", syncUsers)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth)
      window.removeEventListener(USERS_UPDATED_EVENT, syncUsers)
      window.removeEventListener("storage", syncAuth)
      window.removeEventListener("storage", syncUsers)
    }
  }, [])

  // 외부 앱(Safari 등)에서 특정 설정 탭으로 이동 요청 시 반영
  useEffect(() => {
    if (!initialCategory) return
    if (initialCategory === "회원가입") {
      setSelectedCategory("회원가입")
      return
    }
    if (initialCategory === "로그인") {
      const auth = getStoredAuth()
      setSelectedCategory(auth.isLoggedIn && auth.user ? "계정관리" : "로그인")
      return
    }
    setSelectedCategory(initialCategory)
  }, [initialCategory, navigationRequestId])

  // Web Audio 팝 피드백 사운드
  const playPopSound = () => {
    try {
      const volumeGain = getEffectiveVolumeGain()
      if (volumeGain <= 0) return
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1) // A5
      gain.gain.setValueAtTime(0.3 * volumeGain, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch {}
  }

  // 로그인 성공 시 로그인 창 닫기 핸들러 (계정관리 화면으로 전환하지 않고 창 즉시 닫기)
  const closeLoginWindow = () => {
    setTimeout(() => {
      if (onClose) {
        onClose()
      }
      try {
        window.dispatchEvent(
          new CustomEvent("findcategory_close_app", { detail: { app: "settings" } })
        )
      } catch {}
    }, 120)
  }

  // 로그인 핸들러
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    const trimmedLogin = loginEmail.trim()
    const cleanLogin = trimmedLogin.toLowerCase()
    const isAdminId =
      cleanLogin === "admin" ||
      cleanLogin === "admin@findcategory.co.kr" ||
      cleanLogin === "gun" ||
      cleanLogin === "gun@findcategory.co.kr"

    if (!trimmedLogin) {
      setLoginError("닉네임 또는 이메일 계정을 입력해 주세요.")
      return
    }
    if (!loginPassword) {
      setLoginError("비밀번호를 입력해 주세요.")
      return
    }

    const adminCheck = isUserAdmin(trimmedLogin) || isAdminId

    // 1. 관리자(admin, gun, gun@findcategory.co.kr) 로그인 시: 무조건 공식 gun@findcategory.co.kr 계정으로 일원화 접속
    if (adminCheck) {
      const gunAdminAccount: UserAccount = {
        nickname: "gun",
        email: "gun@findcategory.co.kr",
        role: "시스템 관리자",
        isAdmin: true,
        bio: "FINDCATEGORY 시스템 관리자",
        isRegistered: true,
        avatarColor: "from-blue-600 via-indigo-600 to-purple-600",
        createdAt: "2026. 11. 01",
      }
      setUserAccount(gunAdminAccount)
      setIsLoggedIn(true)
      setStoredAuth(gunAdminAccount, true)
      playPopSound()
      showNotification({
        app: "Settings",
        title: "관리자 로그인 성공",
        message: "‘gun’ 시스템 관리자 계정으로 접속되었습니다.",
        iconType: "settings",
      })
      setToastMessage("‘gun’ 시스템 관리자 계정(gun@findcategory.co.kr)으로 접속되었습니다.")
      setTimeout(() => setToastMessage(""), 4000)
      closeLoginWindow()
      return
    }

    // 2. 전체 등록 회원 목록(managedUsers)에서 닉네임 또는 이메일 일치 회원 검색
    try {
      const allUsers = getStoredManagedUsers()
      const matchedUser = allUsers.find(
        (u) =>
          u.nickname.toLowerCase() === cleanLogin ||
          u.email.toLowerCase() === cleanLogin
      )
      if (matchedUser) {
        const matchedAccount: UserAccount = {
          nickname: matchedUser.nickname,
          email: matchedUser.email,
          role: matchedUser.role || "일반 회원",
          isAdmin: matchedUser.isAdmin || false,
          bio: matchedUser.bio || "비주얼 기반으로 브랜드 아카이브를 탐색하는 사용자",
          isRegistered: true,
          avatarColor: matchedUser.avatarColor || "from-blue-600 via-indigo-600 to-purple-600",
          createdAt: matchedUser.createdAt,
        }
        setUserAccount(matchedAccount)
        setIsLoggedIn(true)
        setStoredAuth(matchedAccount, true)
        playPopSound()
        showNotification({
          app: "Settings",
          title: "로그인 성공",
          message: `‘${matchedAccount.nickname}’님 환영합니다. 로그인되었습니다.`,
          iconType: "settings",
        })
        setToastMessage(`‘${matchedAccount.nickname}’님 환영합니다. 로그인되었습니다.`)
        setTimeout(() => setToastMessage(""), 4000)
        closeLoginWindow()
        return
      }
    } catch {}

    // 3. 로컬 저장소(findcategory_user)에 저장된 기존 계정과 매칭 (닉네임 또는 이메일)
    try {
      const saved = localStorage.getItem("findcategory_user")
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved)
        if (
          parsed.email.toLowerCase() === cleanLogin ||
          parsed.nickname.toLowerCase() === cleanLogin
        ) {
          setUserAccount(parsed)
          setIsLoggedIn(true)
          setStoredAuth(parsed, true)
          playPopSound()
          showNotification({
            app: "Settings",
            title: "로그인 성공",
            message: `‘${parsed.nickname}’님 환영합니다. 로그인되었습니다.`,
            iconType: "settings",
          })
          setToastMessage(`‘${parsed.nickname}’님 환영합니다. 로그인되었습니다.`)
          setTimeout(() => setToastMessage(""), 4000)
          closeLoginWindow()
          return
        }
      }
    } catch {}

    // 4. 신규 일반 회원 로그인 세션 생성 (닉네임/이메일 자동 대응)
    const isEmailInput = trimmedLogin.includes("@")
    const finalNickname = isEmailInput
      ? trimmedLogin.split("@")[0] || "사용자"
      : trimmedLogin
    const finalEmail = isEmailInput
      ? trimmedLogin
      : `${trimmedLogin.replace(/\s+/g, "").toLowerCase()}@findcategory.com`

    const newAccount: UserAccount = {
      nickname: finalNickname,
      email: finalEmail,
      role: "일반 회원",
      isAdmin: false,
      bio: "비주얼 기반으로 브랜드 아카이브를 탐색하는 사용자",
      isRegistered: true,
      avatarColor: "from-slate-600 to-zinc-700",
      createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "short" }),
    }

    setUserAccount(newAccount)
    setIsLoggedIn(true)
    setStoredAuth(newAccount, true)

    playPopSound()
    showNotification({
      app: "Settings",
      title: "로그인 완료",
      message: adminCheck
        ? `‘${newAccount.nickname}’ 관리자님 환영합니다.`
        : `‘${newAccount.nickname}’님 환영합니다. 로그인되었습니다.`,
      iconType: "settings",
    })
    setToastMessage(
      adminCheck
        ? `‘${newAccount.nickname}’ 관리자님 환영합니다.`
        : `‘${newAccount.nickname}’님 환영합니다. 로그인되었습니다.`,
    )
    setTimeout(() => setToastMessage(""), 4000)
    closeLoginWindow()
  }

  // 로그아웃 핸들러
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserAccount(null)
    setLoginEmail("")
    setLoginPassword("")
    authLogout()
    if (isNotificationTriggerEnabled("logout")) {
      playPopSound()
      setToastMessage("로그아웃되었습니다.")
      setTimeout(() => setToastMessage(""), 4000)
    }
    setSelectedCategory("로그인")
  }

  // 회원 등급/관리자 권한 토글 핸들러
  const handleToggleAdminStatus = (userId: string) => {
    const target = managedUsers.find((u) => u.id === userId)
    if (!target) return
    if (isUserAdmin(target.email)) {
      setToastMessage("시스템 관리자 계정의 등급은 변경할 수 없습니다.")
      setTimeout(() => setToastMessage(""), 3500)
      return
    }
    const nextAdmin = !target.isAdmin
    const updated = managedUsers.map((u) =>
      u.id === userId
        ? {
            ...u,
            isAdmin: nextAdmin,
            role: nextAdmin ? "운영 관리자" : "일반 회원",
          }
        : u,
    )
    setManagedUsers(updated)
    saveManagedUsers(updated)
    playPopSound()
    setToastMessage(
      nextAdmin
        ? `‘${target.nickname}’ 회원을 관리자로 승격했습니다.`
        : `‘${target.nickname}’ 회원을 일반 회원으로 전환했습니다.`,
    )
    setTimeout(() => setToastMessage(""), 3500)
  }

  // 회원 삭제 핸들러
  const handleDeleteUser = (userId: string) => {
    const target = managedUsers.find((u) => u.id === userId)
    if (!target) return
    if (isUserAdmin(target.email)) {
      setToastMessage("시스템 관리자 계정은 삭제할 수 없습니다.")
      setTimeout(() => setToastMessage(""), 3500)
      return
    }
    if (window.confirm(`'${target.nickname}' 회원을 시스템에서 삭제하시겠습니까?`)) {
      const updated = managedUsers.filter((u) => u.id !== userId)
      setManagedUsers(updated)
      saveManagedUsers(updated)
      playPopSound()
      showNotification({
        app: "Settings",
        title: "회원 계정 삭제",
        message: `‘${target.nickname}’ 회원 계정이 시스템에서 삭제되었습니다.`,
        iconType: "settings",
      })
      setToastMessage(`‘${target.nickname}’ 회원 계정이 삭제되었습니다.`)
      setTimeout(() => setToastMessage(""), 3500)
    }
  }

  // 회원가입 핸들러
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!formNickname.trim()) {
      setFormError("닉네임을 입력해 주세요.")
      return
    }
    if (!formEmail.trim() || !formEmail.includes("@")) {
      setFormError("올바른 이메일 계정을 입력해 주세요.")
      return
    }
    if (!formPassword || formPassword.length < 4) {
      setFormError("비밀번호를 4자리 이상 입력해 주세요.")
      return
    }

    const adminCheck = isUserAdmin(formEmail)

    const newAccount: UserAccount = {
      nickname: formNickname.trim(),
      email: formEmail.trim(),
      role: adminCheck ? "시스템 관리자" : (formRole.trim() || "사용자"),
      isAdmin: adminCheck,
      bio:
        formBio.trim() ||
        (adminCheck ? "FINDCATEGORY 시스템 관리자" : "비주얼 기반으로 브랜드 아카이브를 탐색하는 사용자"),
      isRegistered: true,
      avatarColor: adminCheck
        ? "from-blue-600 via-indigo-600 to-purple-600"
        : "from-blue-600 via-indigo-600 to-purple-600",
      createdAt: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "short" }),
    }

    setUserAccount(newAccount)
    setIsLoggedIn(true)
    setStoredAuth(newAccount, true)

    // 전체 회원 관리 목록에도 신규 회원 등록 및 동기화
    const newUserRecord: ManagedUser = {
      id: `usr-${Date.now()}`,
      nickname: newAccount.nickname,
      email: newAccount.email,
      role: newAccount.role,
      isAdmin: newAccount.isAdmin,
      createdAt: newAccount.createdAt,
      avatarColor: newAccount.avatarColor,
      bio: newAccount.bio,
    }
    const filtered = managedUsers.filter(
      (u) => u.email.toLowerCase() !== newAccount.email.toLowerCase(),
    )
    const updatedUsers = [newUserRecord, ...filtered]
    setManagedUsers(updatedUsers)
    saveManagedUsers(updatedUsers)

    playPopSound()
    showNotification({
      app: "Settings",
      title: "회원가입 완료",
      message: adminCheck
        ? `‘${newAccount.nickname}’ 관리자 계정이 등록되었습니다.`
        : `‘${newAccount.nickname}’ 님의 계정 프로필이 생성되었습니다.`,
      iconType: "settings",
    })
    setShowSuccessModal(true)
    setToastMessage(
      adminCheck
        ? `‘${newAccount.nickname}’ 관리자 계정이 등록되었습니다.`
        : `‘${newAccount.nickname}’ 계정이 등록되었습니다.`,
    )
    setTimeout(() => setToastMessage(""), 4000)
  }

  // 닉네임 중복확인 핸들러
  const handleCheckNickname = () => {
    if (!formNickname.trim()) {
      setNicknameMsg({ type: "error", text: "닉네임을 먼저 입력해 주세요." })
      setNicknameChecked(false)
      return
    }
    if (formNickname.trim().length < 2) {
      setNicknameMsg({ type: "error", text: "닉네임은 2자 이상 입력해 주세요." })
      setNicknameChecked(false)
      return
    }

    // 전체 회원 목록 및 로컬 스토리지 중복 확인
    const isDuplicate = managedUsers.some(
      (u) => u.nickname.toLowerCase() === formNickname.trim().toLowerCase()
    )
    if (isDuplicate) {
      setNicknameMsg({ type: "error", text: "이미 등록된 닉네임입니다." })
      setNicknameChecked(false)
      return
    }

    try {
      const saved = localStorage.getItem("findcategory_user")
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved)
        if (parsed.nickname && parsed.nickname.toLowerCase() === formNickname.trim().toLowerCase()) {
          setNicknameMsg({ type: "error", text: "이미 등록된 닉네임입니다." })
          setNicknameChecked(false)
          return
        }
      }
    } catch {}

    setNicknameChecked(true)
    setNicknameMsg({ type: "success", text: "사용 가능한 닉네임입니다." })
    playPopSound()
  }

  // 이메일 계정 중복확인 핸들러
  const handleCheckEmail = () => {
    if (!formEmail.trim()) {
      setEmailMsg({ type: "error", text: "이메일을 먼저 입력해 주세요." })
      setEmailChecked(false)
      return
    }
    if (!formEmail.includes("@") || !formEmail.includes(".")) {
      setEmailMsg({ type: "error", text: "올바른 이메일 형식을 입력해 주세요." })
      setEmailChecked(false)
      return
    }

    if (isUserAdmin(formEmail)) {
      setEmailChecked(true)
      setEmailMsg({ type: "success", text: "관리자 계정 이메일로 확인되었습니다." })
      playPopSound()
      return
    }

    // 전체 회원 목록 중복 확인
    const isDuplicate = managedUsers.some(
      (u) => u.email.toLowerCase() === formEmail.trim().toLowerCase()
    )
    if (isDuplicate) {
      setEmailMsg({ type: "error", text: "이미 등록된 이메일 계정입니다." })
      setEmailChecked(false)
      return
    }

    try {
      const saved = localStorage.getItem("findcategory_user")
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved)
        if (parsed.email && parsed.email.toLowerCase() === formEmail.trim().toLowerCase()) {
          setEmailMsg({ type: "error", text: "이미 등록된 이메일 계정입니다." })
          setEmailChecked(false)
          return
        }
      }
    } catch {}

    setEmailChecked(true)
    setEmailMsg({ type: "success", text: "사용 가능한 이메일입니다." })
    playPopSound()
  }

  // 비밀번호 중복확인/검증 핸들러
  const handleCheckPassword = () => {
    if (!formPassword) {
      setPasswordMsg({ type: "error", text: "비밀번호를 먼저 입력해 주세요." })
      setPasswordChecked(false)
      return
    }
    if (formPassword.length < 4) {
      setPasswordMsg({ type: "error", text: "비밀번호는 4자리 이상이어야 합니다." })
      setPasswordChecked(false)
      return
    }

    setPasswordChecked(true)
    setPasswordMsg({ type: "success", text: "사용 가능한 안전한 비밀번호입니다." })
    playPopSound()
  }

  const renderContent = () => {
    switch (selectedCategory) {
      // ───────────────── 1. 로그인 화면 ─────────────────
      case "로그인":
        return (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                로그인
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                등록된 계정으로 로그인하여 시스템 설정을 관리하세요
              </p>
            </div>

            {/* 로그인 카드 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      계정 로그인
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      닉네임 또는 이메일 계정(관리자는 admin)과 비밀번호를 입력해 주세요.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
                {loginError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                {/* 이메일 계정 / 관리자 아이디 / 닉네임 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    닉네임 / 이메일 <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      autoComplete="username"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="닉네임 또는 이메일 입력"
                      className="w-full px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    비밀번호 <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-2 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 pr-9 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 폼 하단 버튼 바 */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("회원가입")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>계정이 없으신가요? 회원가입</span>
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md text-xs md:text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-98 flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>로그인</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )

      // ───────────────── 2. 계정 관리 (로그인 완료 시 프로필 화면) ─────────────────
      case "계정관리":
        return (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                계정 관리
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                {userAccount?.isAdmin
                  ? "시스템 관리자 프로필 및 계정 정보"
                  : "로그인된 사용자 프로필 및 계정 정보"}
              </p>
            </div>

            {userAccount && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${userAccount.avatarColor} text-white flex items-center justify-center font-bold text-2xl shadow-md`}
                    >
                      {userAccount.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                        {userAccount.nickname}
                      </h2>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        {userAccount.email} • {userAccount.role || "사용자"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-100 dark:border-zinc-700/60">
                    <div className="text-slate-400 font-medium mb-1">시스템 권한 등급</div>
                    <div className="font-semibold text-slate-800 dark:text-zinc-200">
                      {userAccount.isAdmin ? "관리자 (Administrator)" : "일반 사용자 (Standard User)"}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-100 dark:border-zinc-700/60">
                    <div className="text-slate-400 font-medium mb-1">계정 등록일</div>
                    <div className="text-slate-700 dark:text-zinc-300">
                      {userAccount.createdAt}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      // ───────────────── 2.5 회원관리 화면 (관리자 전용) ─────────────────
      case "회원관리": {
        if (!isLoggedIn || !userAccount?.isAdmin) {
          return (
            <div className="max-w-md mx-auto text-center py-20 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
                  관리자 전용 메뉴
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  회원 관리 제어판은 시스템 관리자 계정으로 로그인한 경우에만 접근할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(isLoggedIn ? "계정관리" : "로그인")}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
              >
                {isLoggedIn ? "내 계정 정보로 이동" : "관리자 계정으로 로그인"}
              </button>
            </div>
          )
        }

        const q = userSearchQuery.trim().toLowerCase()
        const filteredUsers = managedUsers.filter((u) => {
          const matchesSearch =
            !q ||
            u.nickname.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.role && u.role.toLowerCase().includes(q))

          if (!matchesSearch) return false

          if (selectedRoleFilter === "admin") return u.isAdmin
          if (selectedRoleFilter === "regular") return !u.isAdmin
          return true
        })

        const totalCount = managedUsers.length
        const adminCount = managedUsers.filter((u) => u.isAdmin).length
        const regularCount = managedUsers.filter((u) => !u.isAdmin).length

        return (
          <div className="max-w-3xl space-y-6 pb-6">
            {/* 상단 타이틀 및 회원 통계 요약 배지 */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                  회원관리
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                  시스템 등록 회원 목록 및 등급/권한 관리
                </p>
              </div>

              {/* 통계 요약 칩 */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xs flex items-center gap-1.5 text-slate-700 dark:text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>전체 <strong className="text-slate-900 dark:text-white">{totalCount}</strong>명</span>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>관리자 <strong className="text-amber-800 dark:text-amber-300">{adminCount}</strong>명</span>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 flex items-center gap-1.5">
                  <span>일반 <strong className="text-blue-800 dark:text-blue-200">{regularCount}</strong>명</span>
                </div>
              </div>
            </div>

            {/* 안내 배너 */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl flex items-center gap-3 text-xs text-blue-800 dark:text-blue-300 shadow-2xs">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                시스템 관리자는 등록 회원의 정보를 조회하고 계정을 안전하게 관리 및 영구 삭제할 수 있습니다.
              </span>
            </div>

            {/* 검색 및 필터 툴바 */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* 검색창 */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="닉네임, 이메일, 역할 검색..."
                  className="w-full pl-9 pr-7 py-1.5 text-xs md:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                {userSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setUserSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 필터 탭 세그먼트 */}
              <div className="inline-flex p-0.5 bg-slate-200/70 dark:bg-zinc-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter("all")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    selectedRoleFilter === "all"
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  전체 ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter("admin")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    selectedRoleFilter === "admin"
                      ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  관리자 ({adminCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter("regular")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    selectedRoleFilter === "regular"
                      ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  일반 ({regularCount})
                </button>
              </div>
            </div>

            {/* macOS 스타일 회원 리스트 카드 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>등록된 회원 목록 ({filteredUsers.length}명)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  총 {totalCount}명 중 {filteredUsers.length}명 표시
                </span>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 dark:text-zinc-500 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600" />
                  <p>일치하는 회원이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredUsers.map((user) => {
                    const isRoot = isUserAdmin(user.email)
                    return (
                      <div
                        key={user.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* 회원 정보 (아바타, 닉네임, 등급 배지, 이메일, 가입일) */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0`}
                          >
                            {user.nickname.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs md:text-sm text-slate-900 dark:text-zinc-100 truncate">
                                {user.nickname}
                              </span>
                              {user.isAdmin ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                                  관리자
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                                  일반 회원
                                </span>
                              )}
                              {user.role && (
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
                                  • {user.role}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span className="truncate">{user.email}</span>
                              <span>•</span>
                              <span className="text-slate-400 dark:text-zinc-500 shrink-0">
                                가입일 {user.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 우측 조작 액션 (삭제) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isRoot ? (
                            <span className="px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-zinc-800 rounded-md cursor-not-allowed select-none">
                              시스템 보호 계정
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                              title="회원 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      }

      // ───────────────── 3. 회원가입 화면 ─────────────────
      case "회원가입":
        return (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                회원가입
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                시스템 사용자 계정 등록 및 프로필 관리
              </p>
            </div>

            {/* ── 우측 흰색 카드 1: 회원가입 및 프로필 생성 폼 ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      계정 생성
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      시스템에서 사용할 사용자 정보 및 계정을 설정합니다.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignUpSubmit} className="p-5 space-y-4">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* 닉네임 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 pt-1.5">
                    닉네임 <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formNickname}
                        onChange={(e) => {
                          setFormNickname(e.target.value)
                          setNicknameChecked(false)
                          setNicknameMsg(null)
                        }}
                        placeholder=""
                        className="flex-1 px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleCheckNickname}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 shrink-0 transition-colors shadow-2xs whitespace-nowrap active:scale-95"
                      >
                        {nicknameChecked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3" />
                            확인완료
                          </span>
                        ) : (
                          "중복확인"
                        )}
                      </button>
                    </div>
                    {nicknameMsg && (
                      <p
                        className={`text-[11px] flex items-center gap-1 ${
                          nicknameMsg.type === "success"
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-rose-500"
                        }`}
                      >
                        <span>{nicknameMsg.type === "success" ? "✓" : "⚠️"}</span>
                        <span>{nicknameMsg.text}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 이메일 계정 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 pt-1.5">
                    이메일 계정 <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => {
                          setFormEmail(e.target.value)
                          setEmailChecked(false)
                          setEmailMsg(null)
                        }}
                        placeholder="user@findcategory.com"
                        className="flex-1 px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleCheckEmail}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 shrink-0 transition-colors shadow-2xs whitespace-nowrap active:scale-95"
                      >
                        {emailChecked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3" />
                            확인완료
                          </span>
                        ) : (
                          "중복확인"
                        )}
                      </button>
                    </div>
                    {emailMsg && (
                      <p
                        className={`text-[11px] flex items-center gap-1 ${
                          emailMsg.type === "success"
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-rose-500"
                        }`}
                      >
                        <span>{emailMsg.type === "success" ? "✓" : "⚠️"}</span>
                        <span>{emailMsg.text}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 pt-1.5">
                    비밀번호 <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formPassword}
                          onChange={(e) => {
                            setFormPassword(e.target.value)
                            setPasswordChecked(false)
                            setPasswordMsg(null)
                          }}
                          placeholder="••••••••"
                          className="w-full px-3 py-1.5 pr-9 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleCheckPassword}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 shrink-0 transition-colors shadow-2xs whitespace-nowrap active:scale-95"
                      >
                        {passwordChecked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3" />
                            확인완료
                          </span>
                        ) : (
                          "중복확인"
                        )}
                      </button>
                    </div>
                    {passwordMsg && (
                      <p
                        className={`text-[11px] flex items-center gap-1 ${
                          passwordMsg.type === "success"
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-rose-500"
                        }`}
                      >
                        <span>{passwordMsg.type === "success" ? "✓" : "⚠️"}</span>
                        <span>{passwordMsg.text}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 직무 / 전문 영역 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    직무 / 전문 영역
                  </label>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder=""
                      className="w-full px-3 py-1.5 text-xs md:text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>


                {/* 폼 하단 버튼 바 */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("로그인")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>이미 계정이 있으신가요? 로그인</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormNickname("")
                        setFormEmail("")
                        setFormPassword("")
                        setFormBio("")
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      재설정
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md text-xs md:text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-98 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>가입하기</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ── 우측 흰색 카드 2: 로그인 상태일 때만 등록된 계정 정보 노출 ── */}
            {isLoggedIn && userAccount ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-sm p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                  현재 등록된 계정 정보
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${userAccount.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-md`}
                    >
                      {userAccount.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                          {userAccount.nickname}
                        </span>
                        {userAccount.isAdmin ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            시스템 관리자
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                            {userAccount.role || "사용자"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {userAccount.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-slate-200/70 dark:border-zinc-800/70 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  현재 로그인된 계정이 없습니다. 회원가입하거나 상단 로그인 메뉴를 이용해 주세요.
                </p>
              </div>
            )}
          </div>
        )

      // ───────────────── 알림 (팝업 발생 조건 차트 및 ON/OFF 리스트) ─────────────────
      case "알림": {
        if (!isLoggedIn || !userAccount?.isAdmin) {
          return (
            <div className="max-w-md mx-auto text-center py-20 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
                  관리자 전용 메뉴
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  알림 팝업 조건 및 ON/OFF 제어판은 시스템 관리자 계정으로 로그인한 경우에만 접근할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(isLoggedIn ? "계정관리" : "로그인")}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
              >
                {isLoggedIn ? "내 계정 정보로 이동" : "관리자 계정으로 로그인"}
              </button>
            </div>
          )
        }

        const totalCount = NOTIFICATION_TRIGGER_CHART.length
        const enabledCount = NOTIFICATION_TRIGGER_CHART.filter((item) => triggerSettings[item.id] !== false).length
        const disabledCount = totalCount - enabledCount

        const categoryDefs: Array<{
          id: NotificationTriggerCategory
          label: string
          barColor: string
          badgeClass: string
        }> = [
          {
            id: "system",
            label: "시스템 · 인증",
            barColor: "bg-indigo-500",
            badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
          },
          {
            id: "finder",
            label: "Finder",
            barColor: "bg-blue-500",
            badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
          },
          {
            id: "messages",
            label: "Messages",
            barColor: "bg-emerald-500",
            badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
          },
          {
            id: "notes",
            label: "Notes",
            barColor: "bg-amber-500",
            badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
          },
          {
            id: "safari",
            label: "Safari",
            barColor: "bg-sky-500",
            badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
          },
          {
            id: "settings",
            label: "Settings",
            barColor: "bg-slate-500",
            badgeClass: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
          },
        ]

        const filteredTriggers =
          chartCategoryFilter === "all"
            ? NOTIFICATION_TRIGGER_CHART
            : NOTIFICATION_TRIGGER_CHART.filter((item) => item.category === chartCategoryFilter)

        return (
          <div className="max-w-3xl space-y-6 pb-8">
            {/* 상단 타이틀 & 요약 컨트롤 */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                  알림
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                  어떤 상황에서 우측 상단 알림창이 팝업되는지 확인하고 항목별로 켜거나 끌 수 있습니다.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSetAllTriggers(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 transition-colors cursor-pointer"
                >
                  모두 켜기
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAllTriggers(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                >
                  모두 끄기
                </button>
              </div>
            </div>

            {/* 1. 알림 팝업 현황 차트 (앱별 활성 비율 막대 차트) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      앱별 알림 팝업 활성 차트
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      전체 {totalCount}개 조건 중 <strong className="text-blue-600 dark:text-blue-400">{enabledCount}개 활성</strong> · {disabledCount}개 꺼짐 (클릭 시 아래 리스트 필터)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {categoryDefs.map((cat) => {
                  const groupItems = NOTIFICATION_TRIGGER_CHART.filter((t) => t.category === cat.id)
                  const activeInGroup = groupItems.filter((t) => triggerSettings[t.id] !== false).length
                  const pct = groupItems.length > 0 ? Math.round((activeInGroup / groupItems.length) * 100) : 0
                  const isFiltered = chartCategoryFilter === cat.id

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setChartCategoryFilter((prev) => (prev === cat.id ? "all" : cat.id))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isFiltered
                          ? "bg-blue-50/70 dark:bg-blue-950/25 border-blue-400 dark:border-blue-700 shadow-2xs"
                          : "bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{cat.label}</span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          {activeInGroup} / {groupItems.length} ON ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${cat.barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. 팝업 발생 조건 및 ON/OFF 리스트 */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-blue-500" />
                  <h2 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    알림 팝업 조건 리스트 ({filteredTriggers.length}건)
                  </h2>
                </div>

                {/* 필터 칩 */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setChartCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      chartCategoryFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                    }`}
                  >
                    전체
                  </button>
                  {categoryDefs.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setChartCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        chartCategoryFilter === cat.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredTriggers.map((item) => {
                  const isEnabled = triggerSettings[item.id] !== false
                  const catMeta = categoryDefs.find((c) => c.id === item.category)

                  return (
                    <div
                      key={item.id}
                      className={`px-5 py-4 flex items-center justify-between gap-4 transition-opacity ${
                        isEnabled ? "opacity-100" : "opacity-60 bg-slate-50/40 dark:bg-zinc-900/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              catMeta?.badgeClass || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.app}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-100">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            예시: “{item.exampleTitle}”
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                          {item.condition}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          disabled={!isEnabled}
                          onClick={() => handleTestTriggerItem(item)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="이 알림을 테스트로 띄워봅니다"
                        >
                          테스트
                        </button>
                        <span
                          className={`w-7 text-right text-[11px] font-semibold ${
                            isEnabled
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {isEnabled ? "ON" : "OFF"}
                        </span>
                        <MacOSToggle
                          checked={isEnabled}
                          onChange={(nextVal) => handleToggleTriggerSetting(item.id, nextVal)}
                          label={`${item.name} 알림 팝업 토글`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }

      // ───────────────── Notifications 관리자 제어판 및 수동 발송 ─────────────────
      case "Notifications": {
        const activeTmpl =
          notificationTemplates.find((t) => t.id === selectedTemplateId) ||
          notificationTemplates[0]

        return (
          <div className="max-w-3xl space-y-6 pb-8">
            {/* 1. 상단 타이틀 영역 */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-1">
                  알림 (Notifications)
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                  macOS 실시간 배너 알림 환경설정 및 관리자 라이브 제어판
                </p>
              </div>

              {/* 통계 및 역할 칩 */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xs flex items-center gap-1.5 text-slate-700 dark:text-zinc-200">
                  <BellRing className="w-3.5 h-3.5 text-blue-500" />
                  <span>템플릿 <strong>{notificationTemplates.length}</strong>종</span>
                </div>
                {userAccount?.isAdmin ? (
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>관리자 권한 활성화</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>일반 사용자 (수신 모드)</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. 일반 알림 수신 환경설정 카드 (모든 사용자 접근 가능) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      알림 수신 환경설정 (Preferences)
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      데스크톱 환경에서의 알림 수신 방식 및 사운드 효과를 제어합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {/* 실시간 배너 알림 수신 토글 */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-slate-800 dark:text-zinc-200">
                      실시간 플로팅 배너 알림 허용
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      주요 활동 발생 시 화면 우측 상단에 슬라이드 인 배너를 띄웁니다.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.enableBanners}
                    onChange={() => handleTogglePreference("enableBanners")}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* 사운드 효과음 토글 */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-slate-800 dark:text-zinc-200">
                      알림 수신 시 사운드 재생 (Glass Chime)
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      알림 배너 도착 시 영롱한 macOS Glass 차임 사운드를 재생합니다.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.enableSound}
                    onChange={() => handleTogglePreference("enableSound")}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Notification Center 보관 토글 */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-slate-800 dark:text-zinc-200">
                      Notification Center 자동 저장
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      수신된 알림을 상단 메뉴바 우측 알림 센터 패널에 영구 보관합니다.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.saveToHistory}
                    onChange={() => handleTogglePreference("saveToHistory")}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* 배지 표시 토글 */}
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs md:text-sm font-medium text-slate-800 dark:text-zinc-200">
                      메뉴바 종 아이콘 알림 인디케이터
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      확인하지 않은 알림이 있을 때 상단 메뉴바의 종 아이콘에 파란색 점을 표시합니다.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.showBadges}
                    onChange={() => handleTogglePreference("showBadges")}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. 관리자 전용 제어판 vs 일반 사용자 권한 제한 안내 */}
            {!userAccount?.isAdmin ? (
              <div className="p-6 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-zinc-900 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    관리자 전용 알림 발송 및 템플릿 제어
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                    실시간 수동 알림 직접 발송(Broadcast) 및 시스템 기본 알림 템플릿 문구 편집은 <strong>시스템 관리자(Admin)</strong> 계정 전용 기능입니다. 일반 회원은 상단의 알림 수신 설정만 이용하실 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(isLoggedIn ? "계정관리" : "로그인")}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  {isLoggedIn ? "내 계정 정보 확인" : "관리자 계정으로 로그인"}
                </button>
              </div>
            ) : (
              <>
                {/* ───────────────── 3-A. 관리자 수동 알림 직접 발송 카드 ───────────────── */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                            수동 알림 직접 발송 (Live Broadcast)
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            관리자 권한
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                          화면 우측 상단 실시간 알림 배너와 Notification Center로 임의의 공지 메시지를 즉시 띄웁니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleBroadcastNotification} className="p-5 space-y-4">
                    {/* 발송 채널 / 아이콘 선택 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        알림 채널 (App & Icon)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "findcategory", name: "FIND_CATEGORY", icon: "🧭" },
                          { id: "finder", name: "Finder", icon: "📁" },
                          { id: "messages", name: "Messages", icon: "💬" },
                          { id: "safari", name: "Safari", icon: "🌐" },
                          { id: "settings", name: "Settings", icon: "⚙️" },
                          { id: "notes", name: "Notes", icon: "📝" },
                          { id: "system", name: "System", icon: "🔔" },
                        ].map((ch) => {
                          const isSelected = broadcastIconType === ch.id
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => {
                                setBroadcastIconType(ch.id as NotificationAppType)
                                setBroadcastApp(ch.name)
                                if (
                                  broadcastTitle === "FIND_CATEGORY" ||
                                  broadcastTitle === "Finder" ||
                                  broadcastTitle === "Messages" ||
                                  broadcastTitle === "Safari" ||
                                  broadcastTitle === "Settings" ||
                                  broadcastTitle === "Notes" ||
                                  broadcastTitle === "System"
                                ) {
                                  setBroadcastTitle(ch.name)
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs"
                                  : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100"
                              }`}
                            >
                              <span>{ch.icon}</span>
                              <span>{ch.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 알림 제목 입력 */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        알림 제목 (Title Input) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="예: FIND_CATEGORY 또는 긴급 공지"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* 알림 내용 입력 */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        알림 내용 (Message Textarea) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="우측 상단 알림 배너에 띄울 문구를 입력해 주세요. (예: 새로운 브랜드 한 줄 평이 등록되었습니다.)"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>

                    {/* 실시간 알림 배너 미리보기 카드 */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                        실시간 배너 미리보기 (macOS Glassmorphism Preview)
                      </span>
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-100/90 via-slate-50 to-blue-50/40 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-slate-200/80 dark:border-zinc-700/80">
                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-3.5 border border-black/10 dark:border-white/10 shadow-md max-w-sm">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-200">
                              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 text-white flex items-center justify-center text-[10px] shadow-2xs">
                                🧭
                              </span>
                              <span>{broadcastApp || "FIND_CATEGORY"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>방금 전</span>
                              <span className="text-slate-400 hover:text-slate-600">✕</span>
                            </div>
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                            {broadcastTitle || "FIND_CATEGORY"}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5 line-clamp-2">
                            {broadcastMessage || "새로운 브랜드 한 줄 평이 등록되었습니다."}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 발송 피드백 및 전송 버튼 */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        {broadcastSuccess && (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>알림 배너가 전체 화면에 즉시 발송되었습니다.</span>
                          </span>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>알림 전송 (Broadcast)</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* ───────────────── 3-B. 시스템 알림 템플릿 문구 편집기 ───────────────── */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Settings2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                            기존 알림 템플릿 문구 수정기 (Template Editor)
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            템플릿 {notificationTemplates.length}종
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                          시스템에서 자동 발생하는 환영 메시지, 가입 완료, 한 줄 평 등의 기본 문구를 관리자가 직접 수정 및 저장합니다.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetAllTemplates}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      전체 기본값 복원
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* 템플릿 선택 리스트 그리드 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        수정할 알림 항목 선택
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {notificationTemplates.map((t) => {
                          const isSelected = t.id === selectedTemplateId
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSelectedTemplateId(t.id)
                                setTemplateSaveSuccess(false)
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-500/20 shadow-2xs"
                                  : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700/80 hover:bg-slate-100 text-slate-700 dark:text-zinc-300"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                <span>{t.label}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                                채널: {t.app}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* 선택된 템플릿 편집 폼 */}
                    {activeTmpl && (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3.5">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200/60 dark:border-zinc-800">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              ‘{activeTmpl.label}’ 템플릿 편집
                            </span>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                              {activeTmpl.description}
                            </p>
                          </div>
                          {activeTmpl.variablesHelp && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60">
                              {activeTmpl.variablesHelp}
                            </span>
                          )}
                        </div>

                        {/* 앱 이름 */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                            표시 앱 이름
                          </label>
                          <input
                            type="text"
                            value={editingTemplateApp}
                            onChange={(e) => setEditingTemplateApp(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          />
                        </div>

                        {/* 알림 제목 */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                            기본 알림 제목 (Title)
                          </label>
                          <input
                            type="text"
                            value={editingTemplateTitle}
                            onChange={(e) => setEditingTemplateTitle(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          />
                        </div>

                        {/* 알림 본문 템플릿 */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                            알림 내용 템플릿 (Message Textarea)
                          </label>
                          <textarea
                            rows={2}
                            value={editingTemplateMessage}
                            onChange={(e) => setEditingTemplateMessage(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                          />
                        </div>

                        {/* 작업 버튼 그룹 */}
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            {templateSaveSuccess && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>템플릿이 저장되었습니다. 향후 해당 액션 시 변경된 문구가 반영됩니다.</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetCurrentTemplate}
                              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                              현재 템플릿 초기화
                            </button>
                            <button
                              type="button"
                              onClick={handleTestTemplate}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="현재 수정한 문구로 실시간 배너 테스트 발송"
                            >
                              <BellRing className="w-3.5 h-3.5 text-blue-500" />
                              <span>테스트 발송</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveTemplate}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>저장 (Save)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      }

      case "Appearance":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Appearance</h1>
            <p className="text-gray-600 dark:text-zinc-400 mb-8">Customize the look of your Mac</p>
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
              <div>
                <div className="font-semibold mb-3">Appearance</div>
                <div className="flex gap-4">
                  {(
                    [
                      { id: "light", label: "Light", className: "bg-white text-slate-900" },
                      { id: "dark", label: "Dark", className: "bg-gray-900 text-white" },
                      {
                        id: "auto",
                        label: "Auto",
                        className: "bg-gradient-to-b from-white to-gray-900 text-slate-900",
                      },
                    ] as Array<{ id: AppearanceMode; label: string; className: string }>
                  ).map((mode) => {
                    const active = systemControls.appearanceMode === mode.id
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSystemControls({ appearanceMode: mode.id })}
                        className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          active ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-zinc-700"
                        } ${mode.className}`}
                      >
                        <div className="text-sm font-medium">{mode.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-3">Accent Color</div>
                <div className="flex gap-2">
                  {["blue", "purple", "pink", "red", "orange", "yellow", "green"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      case "Displays":
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">Displays</h1>
            <p className="text-gray-600 dark:text-zinc-400 mb-8">Adjust resolution, brightness, and arrangement</p>
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
                <Monitor className="w-24 h-24 text-white opacity-50" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Brightness</span>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{systemControls.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={systemControls.brightness}
                    onChange={(e) => setSystemControls({ brightness: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Resolution</div>
                  <select className="w-full p-2 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 rounded">
                    <option>Default for display</option>
                    <option>1920 × 1080</option>
                    <option>2560 × 1440</option>
                    <option>3840 × 2160</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )

      default:
        return (
          <>
            <h1 className="text-3xl font-bold mb-2">{selectedCategory}</h1>
            <p className="text-gray-600 mb-8">Configure {selectedCategory.toLowerCase()} settings</p>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Settings for {selectedCategory} will appear here.</p>
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex flex-col landscape:flex-row md:flex-row h-full bg-slate-50 dark:bg-zinc-950 font-sans select-none overflow-hidden text-slate-800 dark:text-zinc-100 relative">
      {/* ───────────────── 사이드바 (모바일 세로에서는 상단 바, 모바일 가로/PC에서는 좌측 바) ───────────────── */}
      <div className="w-full landscape:w-64 md:w-64 bg-slate-100/90 dark:bg-zinc-900/90 backdrop-blur-md border-b landscape:border-b-0 landscape:border-r md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 p-2 landscape:p-3 md:p-3 flex flex-row landscape:flex-col md:flex-col justify-between shrink-0 overflow-x-auto landscape:overflow-x-visible md:overflow-x-visible items-center landscape:items-stretch md:items-stretch gap-2 scrollbar-none z-10">
        <div className="flex flex-row landscape:flex-col md:flex-col items-center landscape:items-stretch md:items-stretch gap-1.5 landscape:space-y-3 md:space-y-3 shrink-0">
          {/* 상단: 비로그인 상태에서는 로그인 버튼, 로그인 시에는 유저 프로필 카드 */}
          {!isLoggedIn || !userAccount ? (
            <button
              onClick={() => setSelectedCategory("로그인")}
              className={`p-2 landscape:p-2.5 md:p-2.5 rounded-xl border transition-all text-left flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer ${
                selectedCategory === "로그인"
                  ? "bg-white dark:bg-zinc-800 border-blue-400 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                  : "bg-white/60 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm shrink-0">
                <LogIn className="w-3.5 h-3.5 md:w-5 md:h-5 ml-0.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-800 dark:text-zinc-100 truncate">
                  로그인
                </div>
                <div className="hidden landscape:block md:block text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                  계정에 로그인하기
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setSelectedCategory("계정관리")}
              className={`p-2 landscape:p-2.5 md:p-2.5 rounded-xl border transition-all text-left flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer ${
                selectedCategory === "계정관리"
                  ? "bg-white dark:bg-zinc-800 border-blue-400 dark:border-blue-500 shadow-sm"
                  : "bg-white/60 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              <div
                className={`w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${userAccount.avatarColor} text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm shrink-0`}
              >
                {userAccount.nickname.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-slate-800 dark:text-zinc-100 truncate flex items-center gap-1.5">
                  <span>{userAccount.nickname}</span>
                  {userAccount.isAdmin && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      관리자
                    </span>
                  )}
                </div>
                <div className="hidden landscape:block md:block text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {userAccount.isAdmin ? "시스템 관리자" : userAccount.email}
                </div>
              </div>
            </button>
          )}

          {/* 기존 설정 메뉴 리스트 (모바일 세로에서는 가로 스크롤 탭 바) */}
          <div className="flex flex-row landscape:flex-col md:flex-col items-center landscape:items-stretch md:items-stretch gap-1 landscape:space-y-0.5 md:space-y-0.5 shrink-0">
            {settingsCategories.map((category) => {
              // 관리자 전용 메뉴('회원관리', '알림')는 관리자에게만 노출
              if (category.adminOnly && (!isLoggedIn || !userAccount?.isAdmin)) {
                return null
              }
              const isSelected = selectedCategory === category.label
              return (
                <button
                  key={category.label}
                  className={`flex items-center justify-between gap-1.5 md:gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left text-xs font-medium cursor-pointer shrink-0 whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 bg-white/40 dark:bg-zinc-800/40 landscape:bg-transparent md:bg-transparent"
                  }`}
                  onClick={() => setSelectedCategory(category.label)}
                >
                  <div className="flex items-center gap-1.5 md:gap-2.5 min-w-0">
                    <category.icon
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${isSelected ? "text-white" : "text-slate-500 dark:text-zinc-400"}`}
                    />
                    <span className="truncate">{category.label}</span>
                  </div>
                  {category.adminOnly && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold shrink-0 border ${
                        isSelected
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      관리자
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 사이드바 하단 시스템 버전 안내 (PC 및 모바일 가로에서만 표시) */}
        <div className="hidden landscape:block md:block pt-3 border-t border-slate-200 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 px-1">
          macOS Sequoia 15.1 • FINDCATEGORY
        </div>
      </div>

      {/* ───────────────── 컨텐츠 영역 (모바일 세로에서는 하단 영역) ───────────────── */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-0 bg-white dark:bg-zinc-900">{renderContent()}</div>

      {/* ───────────────── 완료 모달 (macOS Alert Modal) ───────────────── */}
      {showSuccessModal && userAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                계정 생성이 완료되었습니다
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                <strong>{userAccount.nickname}</strong> 님의 프로필이 시스템 환경에 성공적으로 등록되었습니다.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setSelectedCategory("계정관리")
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── 하단 토스트 알림 ───────────────── */}
      {toastMessage && (
        <div className="absolute bottom-5 right-5 z-40 bg-slate-900/90 dark:bg-zinc-800/95 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md border border-white/10 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
