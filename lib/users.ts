export interface ManagedUser {
  id: string
  nickname: string
  email: string
  role: string
  isAdmin: boolean
  createdAt: string
  avatarColor: string
  avatar?: string
  bio?: string
}

export const ALL_USERS_STORAGE_KEY = "findcategory_all_users"
export const USERS_UPDATED_EVENT = "findcategory_users_updated"

export const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: "usr-admin-1",
    nickname: "gun",
    email: "gun@findcategory.co.kr",
    role: "시스템 관리자",
    isAdmin: true,
    createdAt: "2026. 11. 01",
    avatarColor: "from-blue-600 via-indigo-600 to-purple-600",
    avatar: "G",
    bio: "FINDCATEGORY 시스템 관리자",
  },
  {
    id: "usr-3",
    nickname: "Minji Cho",
    email: "minji@fashionarchive.io",
    role: "아카이브 큐레이터",
    isAdmin: false,
    createdAt: "2026. 11. 05",
    avatarColor: "from-emerald-500 to-teal-700",
    avatar: "🎨",
    bio: "아웃도어 & 테크웨어 큐레이션",
  },
  {
    id: "usr-4",
    nickname: "Elena Rostova",
    email: "elena@nordicfashion.com",
    role: "크리에이티브 디렉터",
    isAdmin: false,
    createdAt: "2026. 11. 06",
    avatarColor: "from-rose-500 to-pink-600",
    avatar: "🏔️",
    bio: "북유럽 미니멀 브랜드 분석",
  },
  {
    id: "usr-5",
    nickname: "David Park",
    email: "david@gorpcorelab.kr",
    role: "고프코어 리뷰어",
    isAdmin: false,
    createdAt: "2026. 11. 07",
    avatarColor: "from-amber-500 to-orange-600",
    avatar: "🧥",
    bio: "기능성 의류 및 테크웨어 아카이빙",
  },
  {
    id: "usr-6",
    nickname: "Alex Chen",
    email: "alex@techwearcollective.com",
    role: "스트리트웨어 에디터",
    isAdmin: false,
    createdAt: "2026. 11. 08",
    avatarColor: "from-cyan-500 to-blue-600",
    avatar: "👟",
    bio: "글로벌 패션 트렌드 리서치",
  },
]

function normalizeManagedUsers(users: ManagedUser[]): ManagedUser[] {
  // 기존의 별도 'admin', 'admin@findcategory.co.kr' 관리자 계정은 완전히 삭제하고, gun@findcategory.co.kr로 단일 통합
  const filtered = users.filter((u) => {
    if (!u || !u.email) return false
    const lowerEmail = u.email.trim().toLowerCase()
    const lowerNick = (u.nickname || "").trim().toLowerCase()
    // 기존 admin 및 admin@findcategory.co.kr 더미 계정 완전 삭제
    if (lowerEmail === "admin" || lowerEmail === "admin@findcategory.co.kr") {
      return false
    }
    if (lowerNick === "admin" && lowerEmail !== "gun@findcategory.co.kr") {
      return false
    }
    return true
  })

  const migrated = filtered.map((u) => {
    const lowerEmail = u.email.trim().toLowerCase()
    const lowerNick = (u.nickname || "").trim().toLowerCase()
    if (
      lowerNick === "cho" ||
      lowerEmail === "cho@findcategory.co.kr" ||
      lowerEmail === "gun@findcategory.co.kr" ||
      u.id === "usr-admin-1"
    ) {
      return {
        ...u,
        id: "usr-admin-1",
        nickname: "gun",
        email: "gun@findcategory.co.kr",
        role: "시스템 관리자",
        isAdmin: true,
        bio: "FINDCATEGORY 시스템 관리자",
        avatarColor: "from-blue-600 via-indigo-600 to-purple-600",
      }
    }
    return u
  })

  // gun 관리자 계정이 목록에 없으면 최상단에 보장 추가
  const hasGun = migrated.some((u) => u.email.toLowerCase() === "gun@findcategory.co.kr")
  if (!hasGun) {
    migrated.unshift(INITIAL_MANAGED_USERS[0])
  }

  const uniqueUsers: ManagedUser[] = []
  const seenEmails = new Set<string>()
  for (const u of migrated) {
    if (!u || !u.email) continue
    const lower = u.email.toLowerCase()
    if (!seenEmails.has(lower)) {
      seenEmails.add(lower)
      uniqueUsers.push(u)
    }
  }
  return uniqueUsers.length > 0 ? uniqueUsers : INITIAL_MANAGED_USERS
}

export function getStoredManagedUsers(): ManagedUser[] {
  if (typeof window === "undefined") return INITIAL_MANAGED_USERS
  try {
    const saved = localStorage.getItem(ALL_USERS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as ManagedUser[]
      if (Array.isArray(parsed)) {
        const normalized = normalizeManagedUsers(parsed)
        if (JSON.stringify(normalized) !== saved) {
          localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(normalized))
        }
        return normalized
      }
    }
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(INITIAL_MANAGED_USERS))
  } catch {}
  return INITIAL_MANAGED_USERS
}

export function saveManagedUsers(users: ManagedUser[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users))
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(USERS_UPDATED_EVENT, { detail: users }))
    })
  } catch (err) {
    console.error("Failed to save managed users:", err)
  }
}

