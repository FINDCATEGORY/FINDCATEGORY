"use client"

import { useState, useEffect, useRef } from "react"
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Radio,
  Bell,
  RefreshCw,
} from "lucide-react"
import { getEffectiveVolumeGain, useSystemControls } from "@/lib/system-controls"

// 사운드 트랙 더미 데이터 (배경음 / 앰비언트 사운드)
const soundTracks = [
  {
    id: 1,
    title: "Midnight Ambient",
    artist: "Sound Studio",
    cover: "/dreamy-night-sky-album-cover.jpg",
    duration: "3:45",
    freq: 220, // A3 base tone
    type: "sine" as OscillatorType,
  },
  {
    id: 2,
    title: "Summer Breeze",
    artist: "Coastal Sounds",
    cover: "/summer-beach-sunset-album-cover.jpg",
    duration: "4:12",
    freq: 261.63, // C4
    type: "triangle" as OscillatorType,
  },
  {
    id: 3,
    title: "City Lounge Beats",
    artist: "Urban Acoustic",
    cover: "/city-skyline-night-album-cover.png",
    duration: "3:28",
    freq: 329.63, // E4
    type: "sine" as OscillatorType,
  },
  {
    id: 4,
    title: "Acoustic Warmth",
    artist: "Folk Harmonics",
    cover: "/acoustic-guitar-wooden-album-cover.jpg",
    duration: "5:03",
    freq: 196, // G3
    type: "triangle" as OscillatorType,
  },
]

// macOS 클래식 알림 효과음 프리셋 정의
const macAlertSounds = [
  { name: "Ping", label: "🔔 Ping (맑은 벨)", type: "ping" },
  { name: "Pop", label: "💧 Pop (경쾌한 팝)", type: "pop" },
  { name: "Hero", label: "🎺 Hero (화음 차임)", type: "hero" },
  { name: "Sosumi", label: "🎶 Sosumi (클래식 톤)", type: "sosumi" },
  { name: "Glass", label: "✨ Glass (크리스털)", type: "glass" },
  { name: "Submarine", label: "🌊 Submarine (소나 음)", type: "submarine" },
]

export function Sound() {
  const { controls: systemControls, setSystemControls } = useSystemControls()
  // 실제 컴퓨터 시스템 사운드 상태
  const [isSystemMuted, setIsSystemMuted] = useState(false)
  const [systemVolume, setSystemVolume] = useState(70)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastActionTime, setLastActionTime] = useState<string | null>(null)
  const [systemFeedback, setSystemFeedback] = useState<string>("")

  // 웹 오디오 / 앰비언트 플레이어 상태
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(soundTracks[0])
  const [progress, setProgress] = useState(30)
  const [activeSoundEffect, setActiveSoundEffect] = useState<string | null>(null)

  // Web Audio Context 참조 (스피커 테스트 및 앰비언트 사운드용)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Web Audio Context 안전 초기화
  const getAudioContext = () => {
    if (typeof window === "undefined") return null
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // 초기 시스템 사운드 상태 조회 및 ControlCenter 볼륨/음소거 상태 동기화
  useEffect(() => {
    fetchSystemStatus()
  }, [])

  useEffect(() => {
    setIsSystemMuted(systemControls.isMuted || systemControls.volume === 0)
    setSystemVolume(systemControls.volume)
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = systemControls.isMuted ? 0 : (systemControls.volume / 100) * 0.1
      gainNodeRef.current.gain.setValueAtTime(Math.max(0.0001, targetGain), audioCtxRef.current.currentTime)
    }
  }, [systemControls.volume, systemControls.isMuted])

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch("/api/sound")
      if (res.ok) {
        const data = await res.json()
        setIsSystemMuted(Boolean(data.muted))
        if (typeof data.volume === "number") {
          setSystemVolume(data.volume)
        }
      }
    } catch (err) {
      console.warn("Could not query sound status:", err)
    }
  }

  // 실제 컴퓨터 사운드 끄기 / 켜기 (Master Mute / Unmute Toggle)
  const toggleSystemMute = async () => {
    setIsSyncing(true)
    const nextMuted = !isSystemMuted
    setIsSystemMuted(nextMuted) // 즉각적인 UI 반영 (Optimistic Update)
    setSystemControls({ isMuted: nextMuted })

    // 소리가 켜질 때 피드백 사운드 재생 (컴퓨터 소리가 켜진 것을 즉시 체감)
    if (!nextMuted) {
      playAlertSound("pop")
    }

    try {
      const res = await fetch("/api/sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSystemMuted(Boolean(data.muted))
        setLastActionTime(new Date().toLocaleTimeString("ko-KR"))
        setSystemFeedback(
          data.muted
            ? "컴퓨터 소리를 껐습니다 (음소거 상태)"
            : "컴퓨터 소리를 켰습니다 (사운드 출력 활성화)",
        )
      }
    } catch (err) {
      console.error("System sound toggle error:", err)
      // 실패 시 롤백
      setIsSystemMuted(!nextMuted)
      setSystemFeedback("컴퓨터 사운드 제어 요청에 실패했습니다.")
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSystemFeedback(""), 4000)
    }
  }

  // 시스템 볼륨 올리기 / 내리기
  const adjustVolume = async (action: "volumeUp" | "volumeDown") => {
    setIsSyncing(true)
    if (isSystemMuted && action === "volumeUp") {
      setIsSystemMuted(false)
    }

    try {
      const res = await fetch("/api/sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        setIsSystemMuted(Boolean(data.muted))
        if (typeof data.volume === "number") {
          setSystemVolume(data.volume)
          setSystemControls({ volume: data.volume, isMuted: Boolean(data.muted) })
        }
        playAlertSound("ping")
      }
    } catch (err) {
      console.error("Volume adjustment error:", err)
    } finally {
      setIsSyncing(false)
    }
  }

  // macOS 사운드 효과음 Web Audio 합성 재생 (스피커 출력 검증용)
  const playAlertSound = (type: string) => {
    try {
      const masterGain = getEffectiveVolumeGain()
      if (masterGain <= 0) return

      const ctx = getAudioContext()
      if (!ctx) return

      setActiveSoundEffect(type)
      setTimeout(() => setActiveSoundEffect(null), 600)

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const masterNode = ctx.createGain()
      const gain = ctx.createGain()

      masterNode.gain.setValueAtTime(masterGain, now)
      osc.connect(gain)
      gain.connect(masterNode)
      masterNode.connect(ctx.destination)

      switch (type) {
        case "ping":
          // 맑은 하이 피치 링
          osc.type = "sine"
          osc.frequency.setValueAtTime(880, now) // A5
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1)
          gain.gain.setValueAtTime(0.4, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
          osc.start(now)
          osc.stop(now + 0.5)
          break

        case "pop":
          // 둥근 팝 사운드
          osc.type = "triangle"
          osc.frequency.setValueAtTime(320, now)
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.08)
          gain.gain.setValueAtTime(0.5, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
          osc.start(now)
          osc.stop(now + 0.12)
          break

        case "hero":
          // 상승 화음
          osc.type = "sine"
          osc.frequency.setValueAtTime(440, now)
          osc.frequency.setValueAtTime(554.37, now + 0.08) // C#5
          osc.frequency.setValueAtTime(659.25, now + 0.16) // E5
          osc.frequency.setValueAtTime(880, now + 0.24) // A5
          gain.gain.setValueAtTime(0.35, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
          osc.start(now)
          osc.stop(now + 0.6)
          break

        case "sosumi":
          // 2음 화음
          osc.type = "triangle"
          osc.frequency.setValueAtTime(523.25, now) // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1) // E5
          gain.gain.setValueAtTime(0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
          osc.start(now)
          osc.stop(now + 0.45)
          break

        case "glass":
          // 크리스털 하이 톤
          osc.type = "sine"
          osc.frequency.setValueAtTime(1200, now)
          osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15)
          gain.gain.setValueAtTime(0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
          osc.start(now)
          osc.stop(now + 0.7)
          break

        case "submarine":
          // 잠수함 소나 핑
          osc.type = "sine"
          osc.frequency.setValueAtTime(700, now)
          gain.gain.setValueAtTime(0.4, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
          osc.start(now)
          osc.stop(now + 0.8)
          break

        default:
          osc.type = "sine"
          osc.frequency.setValueAtTime(440, now)
          gain.gain.setValueAtTime(0.2, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          osc.start(now)
          osc.stop(now + 0.2)
          break
      }
    } catch (e) {
      console.warn("Web Audio alert sound error:", e)
    }
  }

  // 앰비언트 사운드 재생 / 정지 핸들러
  const toggleAmbientPlay = () => {
    const nextState = !isPlaying
    setIsPlaying(nextState)

    const ctx = getAudioContext()
    if (!ctx) return

    if (nextState) {
      try {
        if (oscillatorNodeRef.current) {
          oscillatorNodeRef.current.stop()
          oscillatorNodeRef.current.disconnect()
        }

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = currentTrack.type
        osc.frequency.setValueAtTime(currentTrack.freq, ctx.currentTime)

        // 부드러운 볼륨
        const targetGain = Math.max(0.0001, 0.08 * getEffectiveVolumeGain())
        gain.gain.setValueAtTime(0.0001, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()

        oscillatorNodeRef.current = osc
        gainNodeRef.current = gain
      } catch (err) {
        console.warn("Ambient sound play error:", err)
      }
    } else {
      if (gainNodeRef.current && ctx) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
      }
      setTimeout(() => {
        if (oscillatorNodeRef.current) {
          try {
            oscillatorNodeRef.current.stop()
            oscillatorNodeRef.current.disconnect()
          } catch {}
          oscillatorNodeRef.current = null
        }
      }, 350)
    }
  }

  // 트랙 변경
  const handleSelectTrack = (track: (typeof soundTracks)[0]) => {
    setCurrentTrack(track)
    if (isPlaying) {
      const ctx = getAudioContext()
      if (ctx && oscillatorNodeRef.current) {
        oscillatorNodeRef.current.frequency.setValueAtTime(track.freq, ctx.currentTime)
        oscillatorNodeRef.current.type = track.type
      }
    }
    setProgress(0)
  }

  // 컴포넌트 언마운트 시 오디오 노드 정리
  useEffect(() => {
    return () => {
      if (oscillatorNodeRef.current) {
        try {
          oscillatorNodeRef.current.stop()
          oscillatorNodeRef.current.disconnect()
        } catch {}
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 font-sans select-none overflow-hidden text-slate-800 dark:text-zinc-100">
      {/* ───────────────── 상단 시스템 사운드 컨트롤 섹션 ───────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 md:p-8 shadow-md shrink-0 relative overflow-hidden">
        {/* 장식용 배경 사운드 웨이브 라인 */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Volume2 className="w-56 h-56" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 좌측: 사운드 상태 및 컴퓨터 소리 제어 안내 */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl backdrop-blur-md ${
                isSystemMuted
                  ? "bg-rose-500/80 text-white ring-4 ring-rose-400/30"
                  : "bg-emerald-500/80 text-white ring-4 ring-emerald-400/30"
              }`}
            >
              {isSystemMuted ? (
                <VolumeX className="w-9 h-9 md:w-11 md:h-11 animate-pulse" />
              ) : (
                <Volume2 className="w-9 h-9 md:w-11 md:h-11" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-90 px-2 py-0.5 rounded-full bg-white/20">
                  컴퓨터 마스터 오디오
                </span>
                {isSyncing && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin opacity-80" />
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                {isSystemMuted ? "컴퓨터 소리 꺼짐 (MUTED)" : "컴퓨터 소리 켜짐 (SOUND ON)"}
              </h1>
              <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-md">
                버튼을 누르면 컴퓨터의 실제 오디오(스피커) 소리를 켜거나 끌 수 있습니다.
              </p>
            </div>
          </div>

          {/* 우측: 실제 소리 끄기 / 켜기 메인 토글 버튼 */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              onClick={toggleSystemMute}
              disabled={isSyncing}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm md:text-base flex items-center gap-3 transition-all transform active:scale-95 shadow-xl hover:shadow-2xl ${
                isSystemMuted
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white ring-2 ring-white/50"
                  : "bg-rose-500 hover:bg-rose-400 text-white ring-2 ring-white/50"
              }`}
            >
              {isSystemMuted ? (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>컴퓨터 소리 켜기</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>컴퓨터 소리 끄기</span>
                </>
              )}
            </button>

            {/* 실시간 상태 피드백 메시지 */}
            <div className="text-[11px] text-blue-100 flex items-center gap-1.5 h-4">
              {systemFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{systemFeedback}</span>
                </>
              ) : (
                <span>실제 PC 볼륨키와 직접 연동됩니다</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── 본문 콘텐츠 영역 ───────────────── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
        {/* 1. 빠른 볼륨 및 시스템 조절 카드 */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                컴퓨터 볼륨 및 음향 설정
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {isSystemMuted ? "상태: 음소거 됨" : `볼륨 레벨: ~${systemVolume}%`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* 음소거 토글 아이콘 */}
            <button
              onClick={toggleSystemMute}
              className={`p-2.5 rounded-xl transition-colors ${
                isSystemMuted
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-slate-200"
              }`}
              title="음소거 토글"
            >
              {isSystemMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* 볼륨 게이지 바 */}
            <div className="flex-1 w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  isSystemMuted
                    ? "bg-slate-300 dark:bg-zinc-700"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: isSystemMuted ? "0%" : `${systemVolume}%` }}
              />
            </div>

            {/* 볼륨 업/다운 단축 버튼 */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => adjustVolume("volumeDown")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center gap-1"
              >
                <Volume1 className="w-3.5 h-3.5" />
                <span>- 볼륨 낮춤</span>
              </button>
              <button
                onClick={() => adjustVolume("volumeUp")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>+ 볼륨 높임</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. macOS 스피커 사운드 효과 테스트 */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                스피커 사운드 테스트 (macOS 효과음)
              </h2>
            </div>
            <span className="text-xs text-slate-400">클릭하여 스피커 소리 출력 확인</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            컴퓨터 소리가 켜져 있으면 맑은 효과음이 스피커로 출력되며, 음소거 시 소리가 나지 않습니다.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {macAlertSounds.map((sound) => {
              const isActive = activeSoundEffect === sound.type
              return (
                <button
                  key={sound.name}
                  onClick={() => playAlertSound(sound.type)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-md scale-95"
                      : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-sm">{sound.label.split(" ")[0]}</span>
                  <span className="font-semibold">{sound.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. 앰비언트 사운드 & 무드 트랙 (플레이어) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500" />
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100">
                Sound Vibes & Ambient
              </h2>
            </div>
            <span className="text-xs text-slate-500">작업 & 감상용 앰비언트 사운드</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {soundTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`group cursor-pointer rounded-xl p-3 border transition-all ${
                  currentTrack.id === track.id
                    ? "bg-purple-50/70 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800 shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:shadow-md"
                }`}
              >
                <div className="aspect-square rounded-lg mb-2 relative overflow-hidden bg-slate-200 dark:bg-zinc-800">
                  <img
                    src={track.cover || "/placeholder.svg"}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="font-semibold text-xs truncate text-slate-800 dark:text-zinc-100">
                  {track.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{track.artist}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────── 하단 미니 플레이어 바 ───────────────── */}
      <div className="h-20 border-t border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 shadow-lg">
        {/* 현재 트랙 정보 */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 shadow-sm">
            <img
              src={currentTrack.cover || "/placeholder.svg"}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-slate-800 dark:text-zinc-100 truncate">
              {currentTrack.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {currentTrack.artist}
            </div>
          </div>
        </div>

        {/* 재생 컨트롤 */}
        <div className="flex flex-col items-center gap-1 w-1/3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const prevIndex =
                  (soundTracks.findIndex((t) => t.id === currentTrack.id) - 1 + soundTracks.length) %
                  soundTracks.length
                handleSelectTrack(soundTracks[prevIndex])
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAmbientPlay}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => {
                const nextIndex =
                  (soundTracks.findIndex((t) => t.id === currentTrack.id) + 1) % soundTracks.length
                handleSelectTrack(soundTracks[nextIndex])
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-xs">
            <span className="text-[10px] text-slate-400">0:45</span>
            <div className="flex-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400">{currentTrack.duration}</span>
          </div>
        </div>

        {/* 우측 빠른 볼륨 */}
        <div className="flex items-center gap-2 w-1/3 justify-end">
          <button
            onClick={toggleSystemMute}
            className={`p-1.5 rounded-lg transition-colors ${
              isSystemMuted ? "text-rose-500" : "text-slate-600 dark:text-zinc-400"
            }`}
            title="컴퓨터 소리 끄기/켜기"
          >
            {isSystemMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="w-20 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${isSystemMuted ? "bg-slate-300" : "bg-blue-500"}`}
              style={{ width: isSystemMuted ? "0%" : `${systemVolume}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

