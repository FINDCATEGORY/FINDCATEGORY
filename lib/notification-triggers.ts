export type TriggerAppIconType =
  | "findcategory"
  | "finder"
  | "messages"
  | "safari"
  | "settings"
  | "notes"
  | "system"

export type NotificationTriggerCategory =
  | "system"
  | "finder"
  | "messages"
  | "notes"
  | "safari"
  | "settings"

export type NotificationTriggerId =
  | "welcome"
  | "auth_required"
  | "login"
  | "signup"
  | "folder_created"
  | "folder_deleted"
  | "request_created"
  | "request_deleted"
  | "message_sent"
  | "message_reply"
  | "note_created"
  | "note_deleted"
  | "safari_navigate"
  | "settings_system"
  | "admin_broadcast"

export interface NotificationTriggerMeta {
  id: NotificationTriggerId
  category: NotificationTriggerCategory
  app: string
  iconType: TriggerAppIconType
  name: string
  condition: string
  exampleTitle: string
  defaultEnabled: boolean
}

export interface NotificationPreferences {
  enableBanners: boolean
  enableSound: boolean
  saveToHistory: boolean
  showBadges: boolean
}

export const NOTIFICATION_PREFERENCES_STORAGE_KEY = "findcategory_notification_preferences"
export const NOTIFICATION_PREFERENCES_UPDATED_EVENT = "findcategory_notification_preferences_updated"
export const NOTIFICATION_TRIGGER_SETTINGS_STORAGE_KEY = "findcategory_notification_trigger_settings"
export const NOTIFICATION_TRIGGER_SETTINGS_UPDATED_EVENT = "findcategory_notification_trigger_settings_updated"

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableBanners: true,
  enableSound: true,
  saveToHistory: true,
  showBadges: true,
}

export const NOTIFICATION_TRIGGER_CHART: NotificationTriggerMeta[] = [
  {
    id: "welcome",
    category: "system",
    app: "FIND_CATEGORY",
    iconType: "findcategory",
    name: "데스크톱 접속 환영",
    condition: "홈(macOS 데스크톱)에 처음 진입한 직후 자동으로 팝업됩니다.",
    exampleTitle: "FINDCATEGORY에 오신 것을 환영합니다",
    defaultEnabled: true,
  },
  {
    id: "auth_required",
    category: "system",
    app: "FIND_CATEGORY",
    iconType: "settings",
    name: "비회원 로그인 유도",
    condition: "비회원이 글쓰기·한 줄 평·채팅·메모 등 회원 전용 기능을 클릭할 때 팝업됩니다.",
    exampleTitle: "로그인이 필요합니다",
    defaultEnabled: true,
  },
  {
    id: "login",
    category: "system",
    app: "Settings",
    iconType: "settings",
    name: "로그인 완료",
    condition: "Settings에서 회원 또는 관리자 계정으로 로그인에 성공할 때 팝업됩니다.",
    exampleTitle: "로그인 성공",
    defaultEnabled: true,
  },
  {
    id: "signup",
    category: "system",
    app: "Settings",
    iconType: "settings",
    name: "회원가입 완료",
    condition: "Settings 회원가입 화면에서 신규 계정 등록을 완료할 때 팝업됩니다.",
    exampleTitle: "회원가입 완료",
    defaultEnabled: true,
  },
  {
    id: "folder_created",
    category: "finder",
    app: "Finder",
    iconType: "finder",
    name: "새 브랜드 폴더 생성",
    condition: "Finder 브랜드 영상보기 화면에서 새 브랜드 폴더를 생성할 때 팝업됩니다.",
    exampleTitle: "새 폴더 생성 완료",
    defaultEnabled: true,
  },
  {
    id: "folder_deleted",
    category: "finder",
    app: "Finder",
    iconType: "finder",
    name: "브랜드 폴더 삭제",
    condition: "관리자가 Finder에서 브랜드 폴더를 삭제할 때 팝업됩니다.",
    exampleTitle: "브랜드 폴더 삭제 완료",
    defaultEnabled: true,
  },
  {
    id: "request_created",
    category: "finder",
    app: "Finder",
    iconType: "finder",
    name: "브랜드 조사 신청 등록",
    condition: "Finder '브랜드 조사 신청하기'에서 새 신청서를 작성·등록할 때 팝업됩니다.",
    exampleTitle: "브랜드 조사 신청 완료",
    defaultEnabled: true,
  },
  {
    id: "request_deleted",
    category: "finder",
    app: "Finder",
    iconType: "finder",
    name: "브랜드 조사 신청 삭제",
    condition: "관리자가 Finder의 브랜드 조사 신청 항목을 삭제할 때 팝업됩니다.",
    exampleTitle: "브랜드 조사 신청 삭제",
    defaultEnabled: true,
  },
  {
    id: "message_sent",
    category: "messages",
    app: "Messages",
    iconType: "messages",
    name: "커뮤니티 메시지 전송",
    condition: "Messages 라운지에서 채팅 메시지를 전송할 때 팝업됩니다.",
    exampleTitle: "메시지 전송 완료",
    defaultEnabled: true,
  },
  {
    id: "message_reply",
    category: "messages",
    app: "Messages",
    iconType: "messages",
    name: "커뮤니티 답장 수신",
    condition: "Messages 라운지에서 다른 참여자의 답장이 도착할 때 팝업됩니다.",
    exampleTitle: "Minji Cho (아카이브 큐레이터)",
    defaultEnabled: true,
  },
  {
    id: "note_created",
    category: "notes",
    app: "Notes",
    iconType: "notes",
    name: "새 메모 생성",
    condition: "Notes 앱에서 새로운 메모를 추가할 때 팝업됩니다.",
    exampleTitle: "새로운 메모 생성",
    defaultEnabled: true,
  },
  {
    id: "note_deleted",
    category: "notes",
    app: "Notes",
    iconType: "notes",
    name: "메모 삭제",
    condition: "Notes 앱에서 기존 메모를 삭제할 때 팝업됩니다.",
    exampleTitle: "메모 삭제 완료",
    defaultEnabled: true,
  },
  {
    id: "safari_navigate",
    category: "safari",
    app: "Safari",
    iconType: "safari",
    name: "외부 웹사이트 이동",
    condition: "Safari에서 즐겨찾기 또는 주소창으로 외부 사이트로 이동할 때 팝업됩니다.",
    exampleTitle: "웹사이트 이동",
    defaultEnabled: true,
  },
  {
    id: "settings_system",
    category: "settings",
    app: "Settings",
    iconType: "settings",
    name: "권한 및 회원 정보 변경",
    condition: "Settings에서 앱 권한 토글 변경, 회원 등급 변경 또는 회원 삭제 시 팝업됩니다.",
    exampleTitle: "권한 설정 변경",
    defaultEnabled: true,
  },
  {
    id: "admin_broadcast",
    category: "settings",
    app: "FIND_CATEGORY",
    iconType: "findcategory",
    name: "관리자 수동 공지 방송",
    condition: "Notifications 제어판에서 관리자가 '알림 전송 (Broadcast)'를 실행할 때 팝업됩니다.",
    exampleTitle: "FIND_CATEGORY 공지",
    defaultEnabled: true,
  },
]

export function getDefaultNotificationTriggerSettings(): Record<NotificationTriggerId, boolean> {
  return NOTIFICATION_TRIGGER_CHART.reduce(
    (acc, item) => {
      acc[item.id] = item.defaultEnabled
      return acc
    },
    {} as Record<NotificationTriggerId, boolean>,
  )
}

export function getStoredNotificationTriggerSettings(): Record<NotificationTriggerId, boolean> {
  const defaults = getDefaultNotificationTriggerSettings()
  if (typeof window === "undefined") return defaults
  try {
    const raw = localStorage.getItem(NOTIFICATION_TRIGGER_SETTINGS_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<Record<NotificationTriggerId, boolean>>
    return {
      ...defaults,
      ...parsed,
    }
  } catch {
    return defaults
  }
}

export function saveNotificationTriggerSettings(
  settings: Record<NotificationTriggerId, boolean>,
): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTIFICATION_TRIGGER_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_TRIGGER_SETTINGS_UPDATED_EVENT, { detail: settings }),
    )
  } catch (err) {
    console.error("Failed to save notification trigger settings:", err)
  }
}

export function isNotificationTriggerEnabled(id: NotificationTriggerId | null): boolean {
  if (!id) return true
  const settings = getStoredNotificationTriggerSettings()
  return settings[id] !== false
}

/**
 * Infer trigger category when showNotification is called directly without an explicit triggerId.
 */
export function inferNotificationTriggerId(payload: {
  app?: string
  title: string
}): NotificationTriggerId | null {
  const app = (payload.app || "").toLowerCase()
  const title = payload.title || ""

  if (title.includes("오신 것을 환영")) return "welcome"
  if (title.includes("로그인이 필요합니다")) return "auth_required"
  if (title.includes("관리자 권한 필요")) return "settings_system"
  if (title.includes("로그인 성공") || title.includes("로그인 완료")) return "login"
  if (title.includes("회원가입 완료")) return "signup"
  if (title.includes("브랜드 조사 신청 삭제")) return "request_deleted"
  if (title.includes("브랜드 조사 신청")) return "request_created"
  if (title.includes("폴더 삭제")) return "folder_deleted"
  if (title.includes("새 폴더 생성")) return "folder_created"
  if (app === "messages" && title.includes("메시지 전송")) return "message_sent"
  if (app === "messages") return "message_reply"
  if (app === "notes" && title.includes("삭제")) return "note_deleted"
  if (app === "notes") return "note_created"
  if (app === "safari" && title.includes("웹사이트 이동")) return "safari_navigate"
  if (app === "settings") return "settings_system"

  return null
}

export function getStoredNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...parsed,
      }
    }
  } catch {}
  return DEFAULT_NOTIFICATION_PREFERENCES
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs))
    window.dispatchEvent(new CustomEvent(NOTIFICATION_PREFERENCES_UPDATED_EVENT, { detail: prefs }))
    window.dispatchEvent(new Event("storage"))
  } catch (err) {
    console.error("Failed to save notification preferences:", err)
  }
}
