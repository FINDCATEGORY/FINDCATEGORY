export type WeatherConditionCode =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "rain-snow"
  | "snow"
  | "shower"

export interface KmaGridCoords {
  nx: number
  ny: number
  inGrid: boolean
}

export interface DetectedIpLocation {
  latitude: number
  longitude: number
  regionLabel: string
  countryCode: string
  inKorea: boolean
  isFallbackSeoul: boolean
  nx: number
  ny: number
  provider: "bigdatacloud" | "ipwho.is" | "fallback"
}

export interface KmaRawItem {
  baseDate: string
  baseTime: string
  category: string
  fcstDate: string
  fcstTime: string
  fcstValue: string
  nx: number
  ny: number
}

export interface KmaForecastSlot {
  fcstDate: string
  fcstTime: string
  fcstLabel: string
  tmp: number | null
  sky: string | null
  pty: string | null
  pop: number | null
  reh: number | null
  wsd: number | null
  conditionCode: WeatherConditionCode
  conditionLabel: string
}

export interface KmaWeatherApiResponse {
  configured: boolean
  ok: boolean
  source: "kma-vilage-fcst"
  nx: number
  ny: number
  baseDate: string
  baseTime: string
  fetchedAt: string
  current: KmaForecastSlot | null
  nextSlot: KmaForecastSlot | null
  tmn: number | null
  tmx: number | null
  message?: string
  resultCode?: string
}

export interface WeatherWidgetData {
  location: DetectedIpLocation
  weather: KmaWeatherApiResponse
  cachedAt: number
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const WEATHER_CACHE_STORAGE_KEY = "findcategory_kma_weather_cache_v1"
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000

const SEOUL_DEFAULT = {
  latitude: 37.5665,
  longitude: 126.978,
  nx: 60,
  ny: 127,
  regionLabel: "서울특별시 중구",
}

/**
 * Convert WGS84 latitude/longitude to Korea Meteorological Administration (기상청) LCC DFS grid coordinates.
 */
export function latLonToKmaGrid(lat: number, lon: number): KmaGridCoords {
  const RE = 6371.00877
  const GRID = 5.0
  const SLAT1 = 30.0
  const SLAT2 = 60.0
  const OLON = 126.0
  const OLAT = 38.0
  const XO = 43
  const YO = 136

  const DEGRAD = Math.PI / 180.0
  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5)
  ra = (re * sf) / Math.pow(ra, sn)

  let theta = lon * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5)
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)
  const inGrid = nx >= 1 && nx <= 149 && ny >= 1 && ny <= 253

  return { nx, ny, inGrid }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Compute KMA VilageFcst (단기예보) base_date and base_time in KST (UTC+9).
 * Base times: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300 (available ~15m after announcement hour).
 */
export function getKmaVilageFcstBaseDateTime(
  nowMs: number = Date.now(),
  offsetSteps: number = 0
): { baseDate: string; baseTime: string } {
  const publishBufferMs = 15 * 60 * 1000
  const effectiveKst = new Date(nowMs + KST_OFFSET_MS - publishBufferMs)

  let year = effectiveKst.getUTCFullYear()
  let month = effectiveKst.getUTCMonth()
  let day = effectiveKst.getUTCDate()
  const hour = effectiveKst.getUTCHours()

  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23]
  let selectedHour = -1
  for (const candidate of baseHours) {
    if (hour >= candidate) {
      selectedHour = candidate
    }
  }

  if (selectedHour === -1) {
    const prevDay = new Date(Date.UTC(year, month, day - 1, 23, 0, 0))
    year = prevDay.getUTCFullYear()
    month = prevDay.getUTCMonth()
    day = prevDay.getUTCDate()
    selectedHour = 23
  }

  const anchorMs =
    Date.UTC(year, month, day, selectedHour, 0, 0) - offsetSteps * 3 * 60 * 60 * 1000
  const target = new Date(anchorMs)

  return {
    baseDate: `${target.getUTCFullYear()}${pad2(target.getUTCMonth() + 1)}${pad2(target.getUTCDate())}`,
    baseTime: `${pad2(target.getUTCHours())}00`,
  }
}

/**
 * Map KMA SKY and PTY codes to normalized condition codes and Korean labels.
 */
export function mapKmaCondition(
  sky?: string | null,
  pty?: string | null
): { code: WeatherConditionCode; label: string } {
  switch (pty) {
    case "1":
      return { code: "rain", label: "비" }
    case "2":
      return { code: "rain-snow", label: "비/눈" }
    case "3":
      return { code: "snow", label: "눈" }
    case "4":
      return { code: "shower", label: "소나기" }
    default:
      break
  }

  switch (sky) {
    case "1":
      return { code: "clear", label: "맑음" }
    case "3":
      return { code: "partly-cloudy", label: "구름많음" }
    case "4":
      return { code: "cloudy", label: "흐림" }
    default:
      return { code: "partly-cloudy", label: "예보 확인" }
  }
}

function fcstToKstMs(fcstDate: string, fcstTime: string): number {
  const year = Number(fcstDate.slice(0, 4))
  const month = Number(fcstDate.slice(4, 6)) - 1
  const day = Number(fcstDate.slice(6, 8))
  const hour = Number(fcstTime.slice(0, 2))
  const minute = Number(fcstTime.slice(2, 4))
  return Date.UTC(year, month, day, hour, minute, 0)
}

function parseNumeric(value?: string): number | null {
  if (value === undefined || value === null || value === "") return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

/**
 * Parse raw KMA VilageFcst items into the current closest slot, a +3h comparison slot, and daily min/max.
 */
export function parseKmaVilageFcstItems(
  items: KmaRawItem[],
  nowMs: number = Date.now()
): {
  current: KmaForecastSlot | null
  nextSlot: KmaForecastSlot | null
  tmn: number | null
  tmx: number | null
} {
  if (!Array.isArray(items) || items.length === 0) {
    return { current: null, nextSlot: null, tmn: null, tmx: null }
  }

  const slotMap = new Map<string, Record<string, string>>()
  let tmn: number | null = null
  let tmx: number | null = null

  const nowKst = new Date(nowMs + KST_OFFSET_MS)
  const todayKstStr = `${nowKst.getUTCFullYear()}${pad2(nowKst.getUTCMonth() + 1)}${pad2(nowKst.getUTCDate())}`

  for (const item of items) {
    if (!item?.fcstDate || !item?.fcstTime || !item?.category) continue
    const key = `${item.fcstDate}_${item.fcstTime}`
    const bucket = slotMap.get(key) ?? {}
    bucket[item.category] = item.fcstValue
    slotMap.set(key, bucket)

    if (item.category === "TMN" && (item.fcstDate === todayKstStr || tmn === null)) {
      const parsed = parseNumeric(item.fcstValue)
      if (parsed !== null) tmn = parsed
    }
    if (item.category === "TMX" && (item.fcstDate === todayKstStr || tmx === null)) {
      const parsed = parseNumeric(item.fcstValue)
      if (parsed !== null) tmx = parsed
    }
  }

  const sortedEntries = Array.from(slotMap.entries()).sort(([a], [b]) => a.localeCompare(b))
  const slots: Array<{ kstMs: number; slot: KmaForecastSlot }> = sortedEntries.map(
    ([key, values]) => {
      const [fcstDate, fcstTime] = key.split("_")
      const sky = values.SKY ?? null
      const pty = values.PTY ?? null
      const { code, label } = mapKmaCondition(sky, pty)

      return {
        kstMs: fcstToKstMs(fcstDate, fcstTime),
        slot: {
          fcstDate,
          fcstTime,
          fcstLabel: `${fcstTime.slice(0, 2)}:${fcstTime.slice(2, 4)}`,
          tmp: parseNumeric(values.TMP),
          sky,
          pty,
          pop: parseNumeric(values.POP),
          reh: parseNumeric(values.REH),
          wsd: parseNumeric(values.WSD),
          conditionCode: code,
          conditionLabel: label,
        },
      }
    }
  )

  const completeSlots = slots.filter((entry) => entry.slot.tmp !== null)
  const candidates = completeSlots.length > 0 ? completeSlots : slots
  if (candidates.length === 0) {
    return { current: null, nextSlot: null, tmn, tmx }
  }

  const nowKstMs = nowMs + KST_OFFSET_MS
  let currentIdx = 0
  let bestDiff = Math.abs(candidates[0].kstMs - nowKstMs)

  for (let i = 1; i < candidates.length; i++) {
    const diff = Math.abs(candidates[i].kstMs - nowKstMs)
    if (diff < bestDiff) {
      bestDiff = diff
      currentIdx = i
    }
  }

  const currentEntry = candidates[currentIdx]
  let nextEntry: { kstMs: number; slot: KmaForecastSlot } | null = null

  for (let i = currentIdx + 1; i < candidates.length; i++) {
    if (candidates[i].kstMs - currentEntry.kstMs >= 2.5 * 60 * 60 * 1000) {
      nextEntry = candidates[i]
      break
    }
  }
  if (!nextEntry && currentIdx + 1 < candidates.length) {
    nextEntry = candidates[currentIdx + 1]
  }

  return {
    current: currentEntry.slot,
    nextSlot: nextEntry ? nextEntry.slot : null,
    tmn,
    tmx,
  }
}

function formatKoreanRegion(parts: Array<string | undefined | null>, fallback: string): string {
  const cleaned: string[] = []
  for (const part of parts) {
    const trimmed = part?.trim()
    if (!trimmed) continue
    if (cleaned.some((existing) => existing === trimmed || existing.includes(trimmed))) {
      continue
    }
    cleaned.push(trimmed)
  }
  return cleaned.length > 0 ? cleaned.slice(0, 2).join(" ") : fallback
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number = 4500): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

interface BigDataCloudIpResponse {
  latitude?: number
  longitude?: number
  countryCode?: string
  countryName?: string
  principalSubdivision?: string
  city?: string
  locality?: string
}

interface IpWhoIsResponse {
  success?: boolean
  latitude?: number
  longitude?: number
  country_code?: string
  country?: string
  region?: string
  city?: string
}

/**
 * Detect visitor location from IP using browser-compatible public GeoIP APIs.
 * Falls back to Seoul grid (60, 127) if GeoIP fails or if IP is outside KMA grid coverage.
 */
export async function detectLocationByIp(): Promise<DetectedIpLocation> {
  let lat: number | null = null
  let lon: number | null = null
  let countryCode = "KR"
  let rawRegionLabel = ""
  let provider: DetectedIpLocation["provider"] = "fallback"

  try {
    const bdc = await fetchJsonWithTimeout<BigDataCloudIpResponse>(
      "https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=ko"
    )
    if (
      typeof bdc.latitude === "number" &&
      typeof bdc.longitude === "number" &&
      Number.isFinite(bdc.latitude) &&
      Number.isFinite(bdc.longitude)
    ) {
      lat = bdc.latitude
      lon = bdc.longitude
      countryCode = bdc.countryCode || "KR"
      rawRegionLabel = formatKoreanRegion(
        [bdc.principalSubdivision, bdc.city, bdc.locality, bdc.countryName],
        "현재 접속 지역"
      )
      provider = "bigdatacloud"
    }
  } catch {
    // Try secondary GeoIP provider below
  }

  if (lat === null || lon === null) {
    try {
      const ipwho = await fetchJsonWithTimeout<IpWhoIsResponse>("https://ipwho.is/")
      if (
        ipwho.success !== false &&
        typeof ipwho.latitude === "number" &&
        typeof ipwho.longitude === "number"
      ) {
        lat = ipwho.latitude
        lon = ipwho.longitude
        countryCode = ipwho.country_code || "KR"
        rawRegionLabel = formatKoreanRegion(
          [ipwho.region, ipwho.city, ipwho.country],
          "현재 접속 지역"
        )
        provider = "ipwho.is"
      }
    } catch {
      // Fall back to Seoul default below
    }
  }

  if (lat === null || lon === null) {
    return {
      latitude: SEOUL_DEFAULT.latitude,
      longitude: SEOUL_DEFAULT.longitude,
      regionLabel: `${SEOUL_DEFAULT.regionLabel} (기본)`,
      countryCode: "KR",
      inKorea: true,
      isFallbackSeoul: true,
      nx: SEOUL_DEFAULT.nx,
      ny: SEOUL_DEFAULT.ny,
      provider: "fallback",
    }
  }

  const grid = latLonToKmaGrid(lat, lon)
  const inKorea = countryCode === "KR" && grid.inGrid

  if (!grid.inGrid) {
    return {
      latitude: lat,
      longitude: lon,
      regionLabel: `${rawRegionLabel || "해외 접속"} (서울 기준)`,
      countryCode,
      inKorea: false,
      isFallbackSeoul: true,
      nx: SEOUL_DEFAULT.nx,
      ny: SEOUL_DEFAULT.ny,
      provider,
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    regionLabel: rawRegionLabel || SEOUL_DEFAULT.regionLabel,
    countryCode,
    inKorea,
    isFallbackSeoul: false,
    nx: grid.nx,
    ny: grid.ny,
    provider,
  }
}

export function getCachedWeather(allowExpired: boolean = false): WeatherWidgetData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(WEATHER_CACHE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WeatherWidgetData
    if (!parsed?.weather || !parsed?.location || typeof parsed.cachedAt !== "number") {
      return null
    }
    if (!allowExpired && Date.now() - parsed.cachedAt > WEATHER_CACHE_TTL_MS) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveCachedWeather(data: WeatherWidgetData): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(WEATHER_CACHE_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage quota issues
  }
}

export async function fetchIpKmaWeather(forceRefresh: boolean = false): Promise<WeatherWidgetData> {
  if (!forceRefresh) {
    const cached = getCachedWeather(false)
    if (cached && cached.weather.configured && cached.weather.ok) {
      return cached
    }
  }

  const location = await detectLocationByIp()
  const params = new URLSearchParams({
    nx: String(location.nx),
    ny: String(location.ny),
    lat: String(location.latitude),
    lon: String(location.longitude),
  })

  const response = await fetch(`/api/weather?${params.toString()}`, {
    cache: "no-store",
  })
  const weather = (await response.json()) as KmaWeatherApiResponse

  const widgetData: WeatherWidgetData = {
    location,
    weather,
    cachedAt: Date.now(),
  }

  if (weather.configured && weather.ok) {
    saveCachedWeather(widgetData)
  }

  return widgetData
}

export function formatCelsiusOrFahrenheit(tempC: number | null, unit: "C" | "F"): string {
  if (tempC === null || !Number.isFinite(tempC)) return "--°"
  if (unit === "F") {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`
  }
  return `${Math.round(tempC)}°C`
}

