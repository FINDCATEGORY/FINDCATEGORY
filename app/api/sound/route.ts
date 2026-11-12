import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// 시스템 사운드 음소거 상태 트래킹
let isMuted = false
let currentVolume = 70

async function executeSoundCommand(
  action: string,
  value?: number,
): Promise<{ success: boolean; muted: boolean; volume: number; message?: string }> {
  const platform = process.platform

  try {
    if (platform === "win32") {
      if (action === "toggle") {
        isMuted = !isMuted
        // Windows 가상 키코드 173 (VK_VOLUME_MUTE)로 실제 컴퓨터 소리 켜기/끄기
        await execAsync('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"')
      } else if (action === "mute") {
        if (!isMuted) {
          isMuted = true
          await execAsync('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"')
        }
      } else if (action === "unmute") {
        if (isMuted) {
          isMuted = false
          await execAsync('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"')
        }
      } else if (action === "volumeUp") {
        currentVolume = Math.min(100, currentVolume + 5)
        isMuted = false
        // Windows 가상 키코드 175 (VK_VOLUME_UP)
        await execAsync('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"')
      } else if (action === "volumeDown") {
        currentVolume = Math.max(0, currentVolume - 5)
        // Windows 가상 키코드 174 (VK_VOLUME_DOWN)
        await execAsync('powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"')
      }
    } else if (platform === "darwin") {
      if (action === "toggle") {
        isMuted = !isMuted
        await execAsync(`osascript -e "set volume output muted ${isMuted}"`)
      } else if (action === "mute") {
        isMuted = true
        await execAsync('osascript -e "set volume output muted true"')
      } else if (action === "unmute") {
        isMuted = false
        await execAsync('osascript -e "set volume output muted false"')
      } else if (action === "setVolume" && typeof value === "number") {
        currentVolume = value
        await execAsync(`osascript -e "set volume output volume ${value}"`)
      }
    } else if (platform === "linux") {
      if (action === "toggle") {
        isMuted = !isMuted
        await execAsync("pactl set-sink-mute @DEFAULT_SINK@ toggle")
      }
    }

    return { success: true, muted: isMuted, volume: currentVolume }
  } catch (err: any) {
    console.error("Sound control execution error:", err)
    return { success: false, muted: isMuted, volume: currentVolume, message: err?.message }
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    muted: isMuted,
    volume: currentVolume,
    platform: process.platform,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action = "toggle", value } = body
    const result = await executeSoundCommand(action, value)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Invalid request" },
      { status: 400 },
    )
  }
}

