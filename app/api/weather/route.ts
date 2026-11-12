import { NextResponse } from "next/server"
import {
  getKmaVilageFcstBaseDateTime,
  latLonToKmaGrid,
  parseKmaVilageFcstItems,
  type KmaRawItem,
  type KmaWeatherApiResponse,
} from "@/lib/kma-weather"

export const dynamic = "force-dynamic"

const KMA_VILAGE_FCST_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"

interface KmaApiJsonShape {
  response?: {
    header?: {
      resultCode?: string
      resultMsg?: string
    }
    body?: {
      items?: {
        item?: KmaRawItem[]
      }
    }
  }
}

function resolveGridFromSearchParams(searchParams: URLSearchParams): { nx: number; ny: number } {
  const nxParam = Number(searchParams.get("nx"))
  const nyParam = Number(searchParams.get("ny"))
  if (
    Number.isInteger(nxParam) &&
    Number.isInteger(nyParam) &&
    nxParam >= 1 &&
    nxParam <= 149 &&
    nyParam >= 1 &&
    nyParam <= 253
  ) {
    return { nx: nxParam, ny: nyParam }
  }

  const latParam = Number(searchParams.get("lat"))
  const lonParam = Number(searchParams.get("lon"))
  if (Number.isFinite(latParam) && Number.isFinite(lonParam)) {
    const grid = latLonToKmaGrid(latParam, lonParam)
    if (grid.inGrid) {
      return { nx: grid.nx, ny: grid.ny }
    }
  }

  // Default fallback: Seoul City Hall grid (60, 127)
  return { nx: 60, ny: 127 }
}

function normalizeServiceKey(rawKey: string): string {
  const trimmed = rawKey.trim()
  return trimmed.includes("%") ? trimmed : encodeURIComponent(trimmed)
}

async function queryKmaVilageFcst(
  encodedServiceKey: string,
  baseDate: string,
  baseTime: string,
  nx: number,
  ny: number
): Promise<{
  ok: boolean
  resultCode?: string
  resultMsg?: string
  items: KmaRawItem[]
}> {
  const query =
    `serviceKey=${encodedServiceKey}` +
    `&pageNo=1` +
    `&numOfRows=350` +
    `&dataType=JSON` +
    `&base_date=${encodeURIComponent(baseDate)}` +
    `&base_time=${encodeURIComponent(baseTime)}` +
    `&nx=${nx}` +
    `&ny=${ny}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${KMA_VILAGE_FCST_ENDPOINT}?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
    const text = await res.text()

    let data: KmaApiJsonShape
    try {
      data = JSON.parse(text) as KmaApiJsonShape
    } catch {
      const authMsgMatch = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)
      const errMsgMatch = text.match(/<errMsg>([^<]+)<\/errMsg>/)
      const detail = authMsgMatch?.[1] || errMsgMatch?.[1] || `HTTP ${res.status}`
      return {
        ok: false,
        resultCode: "XML_ERROR",
        resultMsg: detail,
        items: [],
      }
    }

    const resultCode = data.response?.header?.resultCode
    const resultMsg = data.response?.header?.resultMsg
    const items = data.response?.body?.items?.item ?? []

    return {
      ok: resultCode === "00" && items.length > 0,
      resultCode,
      resultMsg,
      items,
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const { nx, ny } = resolveGridFromSearchParams(searchParams)
  const nowMs = Date.now()
  const latestBase = getKmaVilageFcstBaseDateTime(nowMs, 0)

  const rawKey =
    process.env.KMA_API_KEY ||
    process.env.DATA_GO_KR_API_KEY ||
    process.env.WEATHER_API_KEY ||
    ""

  if (!rawKey.trim()) {
    const unconfigured: KmaWeatherApiResponse = {
      configured: false,
      ok: false,
      source: "kma-vilage-fcst",
      nx,
      ny,
      baseDate: latestBase.baseDate,
      baseTime: latestBase.baseTime,
      fetchedAt: new Date(nowMs).toISOString(),
      current: null,
      nextSlot: null,
      tmn: null,
      tmx: null,
      message: "KMA_API_KEY 환경변수가 설정되지 않았습니다.",
    }
    return NextResponse.json(unconfigured, { status: 200 })
  }

  const encodedKey = normalizeServiceKey(rawKey)

  try {
    let usedBase = latestBase
    let kmaResult = await queryKmaVilageFcst(
      encodedKey,
      usedBase.baseDate,
      usedBase.baseTime,
      nx,
      ny
    )

    // Retry once with the previous 3-hour base_time when data is not yet published (resultCode "03").
    if (!kmaResult.ok && (kmaResult.resultCode === "03" || kmaResult.items.length === 0)) {
      const prevBase = getKmaVilageFcstBaseDateTime(nowMs, 1)
      const fallbackResult = await queryKmaVilageFcst(
        encodedKey,
        prevBase.baseDate,
        prevBase.baseTime,
        nx,
        ny
      )
      if (fallbackResult.ok) {
        usedBase = prevBase
        kmaResult = fallbackResult
      }
    }

    if (!kmaResult.ok) {
      const failed: KmaWeatherApiResponse = {
        configured: true,
        ok: false,
        source: "kma-vilage-fcst",
        nx,
        ny,
        baseDate: usedBase.baseDate,
        baseTime: usedBase.baseTime,
        fetchedAt: new Date(nowMs).toISOString(),
        current: null,
        nextSlot: null,
        tmn: null,
        tmx: null,
        resultCode: kmaResult.resultCode,
        message: kmaResult.resultMsg || "기상청 단기예보 데이터를 불러오지 못했습니다.",
      }
      return NextResponse.json(failed, { status: 502 })
    }

    const parsed = parseKmaVilageFcstItems(kmaResult.items, nowMs)
    const payload: KmaWeatherApiResponse = {
      configured: true,
      ok: true,
      source: "kma-vilage-fcst",
      nx,
      ny,
      baseDate: usedBase.baseDate,
      baseTime: usedBase.baseTime,
      fetchedAt: new Date(nowMs).toISOString(),
      current: parsed.current,
      nextSlot: parsed.nextSlot,
      tmn: parsed.tmn,
      tmx: parsed.tmx,
      resultCode: kmaResult.resultCode,
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    const errored: KmaWeatherApiResponse = {
      configured: true,
      ok: false,
      source: "kma-vilage-fcst",
      nx,
      ny,
      baseDate: latestBase.baseDate,
      baseTime: latestBase.baseTime,
      fetchedAt: new Date(nowMs).toISOString(),
      current: null,
      nextSlot: null,
      tmn: null,
      tmx: null,
      message:
        error instanceof Error ? error.message : "기상청 API 요청 중 오류가 발생했습니다.",
    }
    return NextResponse.json(errored, { status: 502 })
  }
}

