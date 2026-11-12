"use client"

import { useState, useEffect, useCallback } from "react"
import { showNotification } from "@/components/NotificationBanner"

export type UserRole = "guest" | "member" | "admin"

export interface AuthUser {
  id?: string
  nickname: string
  email: string
  role?: string
  isAdmin: boolean
  bio?: string
  avatarColor?: string
  createdAt?: string
  isRegistered?: boolean
}

export interface AuthState {
  role: UserRole
  isLoggedIn: boolean
  user: AuthUser | null
}

export const AUTH_USER_STORAGE_KEY = "findcategory_user"
export const AUTH_LOGGED_IN_STORAGE_KEY = "findcategory_logged_in"
export const AUTH_CHANGED_EVENT = "findcategory_auth_changed"
export const OPEN_SAFARI_LOGIN_EVENT = "findcategory_open_safari_login"

export const ADMIN_EMAILS = [
  "admin",
  "admin@findcategory.co.kr",
  "gun@findcategory.co.kr",
  "cho@findcategory.co.kr",
]

/**
 * 이메일 또는 관리자 아이디(admin)를 기반으로 관리자 여부를 판별합니다.
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return ADMIN_EMAILS.includes(clean)
}

/**
 * 현재 저장된 인증 상태를 동기적으로 조회합니다.
 * 기본값은 완전히 'guest' (비회원/로그인 전) 상태입니다.
 * 명시적 로그인 전에는 절대 임의로 관리자로 승격되거나 로그인되지 않습니다.
 */
export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return {
      role: "guest",
      isLoggedIn: false,
      user: null,
    }
  }

  try {
    const savedLoggedIn = localStorage.getItem(AUTH_LOGGED_IN_STORAGE_KEY)
    const savedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)

    // 명시적으로 로그인되어 있지 않거나 유저 데이터가 없으면 무조건 '비회원 (guest)'
    if (savedLoggedIn !== "true" || !savedUser) {
      return {
        role: "guest",
        isLoggedIn: false,
        user: null,
      }
    }

    const parsed: AuthUser = JSON.parse(savedUser)
    const adminCheck = isUserAdmin(parsed.email) || parsed.isAdmin === true

    if (adminCheck) {
      return {
        role: "admin",
        isLoggedIn: true,
        user: {
          ...parsed,
          isAdmin: true,
          role: parsed.role || "시스템 관리자",
        },
      }
    }

    return {
      role: "member",
      isLoggedIn: true,
      user: {
        ...parsed,
        isAdmin: false,
        role: parsed.role || "일반 회원",
      },
    }
  } catch (err) {
    console.warn("Failed to parse auth state, fallback to guest:", err)
    return {
      role: "guest",
      isLoggedIn: false,
      user: null,
    }
  }
}

/**
 * 인증 상태를 localStorage에 저장하고 시스템 전역에 이벤트를 발행합니다.
 */
export function setStoredAuth(user: AuthUser | null, isLoggedIn: boolean): void {
  if (typeof window === "undefined") return

  try {
    if (isLoggedIn && user) {
      const admin = isUserAdmin(user.email) || user.isAdmin === true
      const normalizedUser: AuthUser = {
        ...user,
        isAdmin: admin,
        role: admin ? (user.role || "시스템 관리자") : (user.role || "일반 회원"),
        isRegistered: true,
      }
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(normalizedUser))
      localStorage.setItem(AUTH_LOGGED_IN_STORAGE_KEY, "true")
    } else {
      localStorage.setItem(AUTH_LOGGED_IN_STORAGE_KEY, "false")
      // user 정보는 남아있더라도 로그인 상태가 false면 비회원 처리
    }
  } catch (err) {
    console.error("Failed to save auth state:", err)
  }

  // 커스텀 이벤트 및 storage 이벤트 트리거
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
  window.dispatchEvent(new Event("storage"))
}

/**
 * 로그아웃 처리
 */
export function logout(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(AUTH_LOGGED_IN_STORAGE_KEY, "false")
    sessionStorage.removeItem("findcategory_messages_session_joined")
  } catch {}
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
  window.dispatchEvent(new Event("storage"))
  showNotification({
    app: "FIND_CATEGORY",
    title: "로그아웃 완료",
    message: "안전하게 로그아웃되었습니다. 비회원 게스트 모드로 전환됩니다.",
    iconType: "findcategory",
  })
}

/**
 * 비회원에게 로그인 필요 안내 배너를 띄우고 Settings 로그인 창으로 유도합니다.
 */
export function guideToSafariLogin(promptMessage?: string): void {
  if (typeof window === "undefined") return

  const message =
    promptMessage ||
    "로그인이 필요합니다. 설정(Settings)에서 회원가입 또는 로그인 후 커뮤니티 기능을 이용하실 수 있습니다."

  showNotification({
    app: "FIND_CATEGORY",
    title: "로그인이 필요합니다",
    message,
    iconType: "settings",
  })

  // 데스크톱 로그인 창(Settings) 열기 이벤트 디스패치
  window.dispatchEvent(new CustomEvent(OPEN_SAFARI_LOGIN_EVENT))
}

/**
 * 컴포넌트에서 실시간 인증 상태를 구독하고 활용할 수 있는 React Hook
 */
export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth())

  useEffect(() => {
    const handleAuthChange = () => {
      setAuth(getStoredAuth())
    }

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange)
    window.addEventListener("storage", handleAuthChange)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  const requireAuth = useCallback(
    (actionDesc?: string): boolean => {
      if (auth.isLoggedIn && (auth.role === "member" || auth.role === "admin")) {
        return true
      }
      guideToSafariLogin(
        actionDesc
          ? `${actionDesc}을(를) 위해 로그인이 필요합니다. 설정 로그인 창으로 이동합니다.`
          : undefined
      )
      return false
    },
    [auth]
  )

  return {
    ...auth,
    isAdmin: auth.role === "admin",
    isMember: auth.role === "member",
    isGuest: auth.role === "guest" || !auth.isLoggedIn,
    requireAuth,
    setAuth: setStoredAuth,
    logout,
    guideToSafariLogin,
  }
}

