"use client"

import {
  showNotification,
  type NotificationAppType,
} from "@/components/NotificationBanner"
import type { NotificationTriggerId } from "@/lib/notification-triggers"

export {
  type NotificationPreferences,
  NOTIFICATION_PREFERENCES_STORAGE_KEY,
  NOTIFICATION_PREFERENCES_UPDATED_EVENT,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getStoredNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notification-triggers"

export interface NotificationTemplate {
  id: string
  label: string
  category: "system" | "finder" | "safari" | "messages" | "notes"
  app: string
  title: string
  message: string
  iconType: NotificationAppType
  description: string
  variablesHelp?: string
}

export const NOTIFICATION_TEMPLATES_STORAGE_KEY = "findcategory_notification_templates"
export const NOTIFICATION_TEMPLATES_UPDATED_EVENT = "findcategory_notification_templates_updated"

export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "welcome",
    label: "데스크톱 접속 환영 알림",
    category: "system",
    app: "FIND_CATEGORY",
    title: "FINDCATEGORY에 오신 것을 환영합니다",
    message: "비주얼 기반의 브랜드 아카이브를 경험해 보세요.",
    iconType: "findcategory",
    description: "사용자가 macOS 데스크톱에 처음 접속했을 때 표시되는 기본 환영 안내입니다.",
  },
  {
    id: "signup",
    label: "회원가입 완료 알림",
    category: "safari",
    app: "FIND_CATEGORY",
    title: "회원가입 완료",
    message: "‘{nickname}’님 회원가입 및 로그인이 완료되었습니다.",
    iconType: "safari",
    description: "Safari 또는 설정에서 신규 계정 가입이 완료되었을 때 발생합니다.",
    variablesHelp: "{nickname} : 가입한 회원의 닉네임",
  },
  {
    id: "login",
    label: "로그인 성공 알림",
    category: "safari",
    app: "FIND_CATEGORY",
    title: "로그인 성공",
    message: "‘{nickname}’님 환영합니다. 정상적으로 로그인되었습니다.",
    iconType: "safari",
    description: "기존 회원이 성공적으로 세션에 로그인했을 때 발생합니다.",
    variablesHelp: "{nickname} : 로그인한 회원의 닉네임",
  },
  {
    id: "review_created",
    label: "한 줄 평 등록 완료 알림",
    category: "finder",
    app: "FIND_CATEGORY",
    title: "신규 한 줄 평 등록 완료",
    message: "‘{brand}’ 대표 상품 한 줄 평이 등록되었습니다.",
    iconType: "findcategory",
    description: "브랜드 대표 상품에 새로운 크리에이터 한 줄 평 및 리뷰를 등록했을 때 발생합니다.",
    variablesHelp: "{brand} : 평가 대상 브랜드명",
  },
  {
    id: "folder_created",
    label: "브랜드 새 폴더 생성 알림",
    category: "finder",
    app: "Finder",
    title: "새 폴더 생성 완료",
    message: "‘{folderName}’ 브랜드 폴더가 생성되었습니다.",
    iconType: "finder",
    description: "Finder 브랜드 라이브러리에서 새로운 브랜드 폴더를 생성했을 때 발생합니다.",
    variablesHelp: "{folderName} : 생성된 폴더 이름",
  },
  {
    id: "folder_deleted",
    label: "브랜드 폴더 삭제 알림",
    category: "finder",
    app: "Finder",
    title: "브랜드 폴더 삭제 완료",
    message: "‘{folderName}’ 폴더가 삭제되었습니다.",
    iconType: "finder",
    description: "Finder에서 관리자가 브랜드 폴더를 영구 삭제했을 때 발생합니다.",
    variablesHelp: "{folderName} : 삭제된 폴더 이름",
  },
  {
    id: "request_created",
    label: "브랜드 조사 신청 알림",
    category: "finder",
    app: "Finder",
    title: "브랜드 조사 신청 완료",
    message: "‘{folderName}’ 브랜드 조사 신청서가 성공적으로 접수되었습니다.",
    iconType: "finder",
    description: "브랜드 조사 신청 게시판에서 신규 브랜드 분석 요청 폴더를 생성했을 때 발생합니다.",
    variablesHelp: "{folderName} : 신청한 브랜드명",
  },
  {
    id: "message_sent",
    label: "커뮤니티 채팅 전송 알림",
    category: "messages",
    app: "Messages",
    title: "메시지 전송 완료",
    message: "{text}",
    iconType: "messages",
    description: "Messages 라운지에서 대화 메시지를 성공적으로 전송했을 때 발생합니다.",
    variablesHelp: "{text} : 전송된 메시지 본문",
  },
  {
    id: "note_created",
    label: "새 메모 생성 알림",
    category: "notes",
    app: "Notes",
    title: "새로운 메모 생성",
    message: "새로운 메모가 생성되어 편집할 수 있습니다.",
    iconType: "notes",
    description: "Notes 앱에서 새로운 스타일링 노트나 한 줄 평 초안을 생성했을 때 발생합니다.",
  },
]

/**
 * 저장된 알림 템플릿 목록을 조회합니다.
 */
export function getStoredNotificationTemplates(): NotificationTemplate[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_TEMPLATES
  try {
    const raw = localStorage.getItem(NOTIFICATION_TEMPLATES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 기본 템플릿과 병합하여 신규 템플릿 누락 방지
        const merged = DEFAULT_NOTIFICATION_TEMPLATES.map((def) => {
          const custom = parsed.find((p: NotificationTemplate) => p.id === def.id)
          if (!custom) return def
          if (
            def.id === "welcome" &&
            custom.message === "비주얼 기반으로 브랜드 아카이브와 룩북을 탐색해 보세요."
          ) {
            return { ...def, ...custom, message: def.message }
          }
          return { ...def, ...custom }
        })
        return merged
      }
    }
  } catch {}
  return DEFAULT_NOTIFICATION_TEMPLATES
}

/**
 * 알림 템플릿 목록을 localStorage에 저장하고 전역 이벤트를 발행합니다.
 */
export function saveNotificationTemplates(templates: NotificationTemplate[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTIFICATION_TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
    window.dispatchEvent(new CustomEvent(NOTIFICATION_TEMPLATES_UPDATED_EVENT, { detail: templates }))
    window.dispatchEvent(new Event("storage"))
  } catch (err) {
    console.error("Failed to save notification templates:", err)
  }
}

/**
 * 단일 템플릿의 제목/내용을 수정하여 저장합니다.
 */
export function updateNotificationTemplate(
  id: string,
  updates: Partial<Pick<NotificationTemplate, "title" | "message" | "app" | "iconType">>
): NotificationTemplate[] {
  const current = getStoredNotificationTemplates()
  const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t))
  saveNotificationTemplates(updated)
  return updated
}

/**
 * 기본 알림 템플릿 프리셋으로 전체 복원합니다.
 */
export function resetNotificationTemplates(): NotificationTemplate[] {
  saveNotificationTemplates(DEFAULT_NOTIFICATION_TEMPLATES)
  return DEFAULT_NOTIFICATION_TEMPLATES
}

/**
 * 변수를 치환하여 최종 알림 페이로드를 생성합니다.
 */
export function renderNotificationTemplate(
  template: NotificationTemplate,
  variables: Record<string, string> = {}
): { title: string; message: string; app: string; iconType: NotificationAppType } {
  let title = template.title
  let message = template.message

  for (const [key, val] of Object.entries(variables)) {
    title = title.replaceAll(`{${key}}`, val)
    message = message.replaceAll(`{${key}}`, val)
  }

  return {
    title,
    message,
    app: template.app,
    iconType: template.iconType,
  }
}

/**
 * 템플릿 ID를 기반으로 실시간 알림 배너를 트리거합니다.
 */
export function triggerTemplateNotification(
  templateId: string,
  variables: Record<string, string> = {},
  fallback?: { title?: string; message?: string; app?: string; iconType?: NotificationAppType }
): void {
  const templates = getStoredNotificationTemplates()
  const tmpl =
    templates.find((t) => t.id === templateId) ||
    DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === templateId)

  const validTriggerIds = new Set<string>([
    "welcome",
    "auth_required",
    "login",
    "signup",
    "folder_created",
    "folder_deleted",
    "request_created",
    "request_deleted",
    "message_sent",
    "message_reply",
    "note_created",
    "note_deleted",
    "safari_navigate",
    "settings_system",
    "admin_broadcast",
  ])
  const triggerId = validTriggerIds.has(templateId)
    ? (templateId as NotificationTriggerId)
    : undefined

  if (tmpl) {
    const rendered = renderNotificationTemplate(tmpl, variables)
    showNotification({
      app: rendered.app,
      title: rendered.title,
      message: rendered.message,
      iconType: rendered.iconType,
      triggerId,
    })
  } else if (fallback?.title) {
    showNotification({
      app: fallback.app || "FIND_CATEGORY",
      title: fallback.title,
      message: fallback.message || "",
      iconType: fallback.iconType || "findcategory",
      triggerId,
    })
  }
}

