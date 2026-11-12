"use client"

import { useState, useEffect, useCallback } from "react"

export type AppearanceMode = "light" | "dark" | "auto"

export interface SystemControlsState {
  volume: number
  isMuted: boolean
  brightness: number
  appearanceMode: AppearanceMode
}

export const SYSTEM_CONTROLS_STORAGE_KEY = "findcategory_system_controls"
export const SYSTEM_CONTROLS_UPDATED_EVENT = "findcategory_system_controls_updated"

export const DEFAULT_SYSTEM_CONTROLS: SystemControlsState = {
  volume: 70,
  isMuted: false,
  brightness: 80,
  appearanceMode: "light",
}

export function resolveIsDarkMode(mode: AppearanceMode): boolean {
  if (mode === "dark") return true
  if (mode === "light") return false
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  return false
}

export function applySystemControlsEffects(state: SystemControlsState): void {
  if (typeof window === "undefined") return

  // 1. Dark Mode (HTML root .dark class + colorScheme)
  const isDark = resolveIsDarkMode(state.appearanceMode)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"

  // 2. HTML <audio> / <video> elements volume sync
  const normalizedVol = state.isMuted ? 0 : Math.max(0, Math.min(1, state.volume / 100))
  document.querySelectorAll("audio, video").forEach((el) => {
    const media = el as HTMLMediaElement
    try {
      media.volume = normalizedVol
      media.muted = state.isMuted || state.volume === 0
    } catch {}
  })
}

export function getStoredSystemControls(): SystemControlsState {
  if (typeof window === "undefined") return DEFAULT_SYSTEM_CONTROLS
  try {
    const raw = localStorage.getItem(SYSTEM_CONTROLS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SystemControlsState>
      return {
        volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(100, parsed.volume)) : DEFAULT_SYSTEM_CONTROLS.volume,
        isMuted: typeof parsed.isMuted === "boolean" ? parsed.isMuted : DEFAULT_SYSTEM_CONTROLS.isMuted,
        brightness: typeof parsed.brightness === "number" ? Math.max(0, Math.min(100, parsed.brightness)) : DEFAULT_SYSTEM_CONTROLS.brightness,
        appearanceMode:
          parsed.appearanceMode === "light" || parsed.appearanceMode === "dark" || parsed.appearanceMode === "auto"
            ? parsed.appearanceMode
            : DEFAULT_SYSTEM_CONTROLS.appearanceMode,
      }
    }
  } catch {}
  return DEFAULT_SYSTEM_CONTROLS
}

export function saveSystemControls(next: SystemControlsState): SystemControlsState {
  if (typeof window === "undefined") return next
  try {
    localStorage.setItem(SYSTEM_CONTROLS_STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.error("Failed to save system controls:", err)
  }
  applySystemControlsEffects(next)
  window.dispatchEvent(new CustomEvent(SYSTEM_CONTROLS_UPDATED_EVENT, { detail: next }))
  window.dispatchEvent(new Event("storage"))
  return next
}

export function updateSystemControls(
  updater: Partial<SystemControlsState> | ((prev: SystemControlsState) => SystemControlsState),
): SystemControlsState {
  const prev = getStoredSystemControls()
  const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
  return saveSystemControls(next)
}

/**
 * 현재 마스터 볼륨(0~1)을 반환합니다. 음소거 시 0을 반환합니다.
 */
export function getEffectiveVolumeGain(): number {
  const state = getStoredSystemControls()
  if (state.isMuted || state.volume <= 0) return 0
  return Math.max(0, Math.min(1, state.volume / 100))
}

/**
 * 볼륨 조절 시 현재 음량 크기를 체감할 수 있는 짧은 피드백 사운드를 재생합니다.
 */
export function playVolumePreviewTone(volumePercent: number, isMuted = false): void {
  if (typeof window === "undefined" || isMuted || volumePercent <= 0) return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const level = Math.max(0.01, Math.min(1, volumePercent / 100)) * 0.25

    osc.type = "sine"
    osc.frequency.setValueAtTime(660, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06)
    gain.gain.setValueAtTime(level, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.14)
    osc.onended = () => {
      ctx.close().catch(() => {})
    }
  } catch {}
}

/**
 * 시스템 제어 상태(Volume, Brightness, Dark Mode)를 구독·수정하는 훅
 */
export function useSystemControls() {
  const [controls, setControls] = useState<SystemControlsState>(() => getStoredSystemControls())

  useEffect(() => {
    const sync = () => {
      const latest = getStoredSystemControls()
      setControls(latest)
      applySystemControlsEffects(latest)
    }
    sync()

    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null

    const handleMediaChange = () => {
      const latest = getStoredSystemControls()
      if (latest.appearanceMode === "auto") {
        applySystemControlsEffects(latest)
        setControls({ ...latest })
      }
    }

    window.addEventListener(SYSTEM_CONTROLS_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    mediaQuery?.addEventListener("change", handleMediaChange)
    return () => {
      window.removeEventListener(SYSTEM_CONTROLS_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
      mediaQuery?.removeEventListener("change", handleMediaChange)
    }
  }, [])

  const setSystemControls = useCallback(
    (updater: Partial<SystemControlsState> | ((prev: SystemControlsState) => SystemControlsState)) => {
      const updated = updateSystemControls(updater)
      setControls(updated)
      return updated
    },
    [],
  )

  return {
    controls,
    isDarkMode: resolveIsDarkMode(controls.appearanceMode),
    setSystemControls,
  }
}
