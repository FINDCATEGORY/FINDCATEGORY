"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Folder,
  FolderPlus,
  Grid3x3,
  List,
  Search,
  MessageSquarePlus,
  PlayCircle,
  StickyNote,
  ExternalLink,
  ChevronLeft,
  X,
  Plus,
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Film,
  Trash2,
  ShieldAlert,
} from "lucide-react"
import { QuickTimePlayer } from "./quicktime-player"
import {
  getStoredPermissions,
  PERMISSIONS_UPDATED_EVENT,
  type AppPermissions,
} from "@/lib/permissions"
import { showNotification } from "@/components/NotificationBanner"
import { triggerTemplateNotification } from "@/lib/notification-templates"
import { useAuth } from "@/lib/auth"

export interface FinderProps {
  initialFolder?: string
  navigationRequestId?: number
  onOpenVideo?: (video: { name: string; url: string }) => void
  onOpenUrl?: (url: string, title?: string) => void
}

// 대표 상품 룩북 및 스타일링 평가 데이터 타입
export interface BestItemLookbook {
  brand: string
  product: string
  category: string
  visualTag: string
  summary: string
  accentColor: string
  ratings: {
    label: string
    score: number // 1 - 100
    displayScore: string
    desc: string
  }[]
  stylePoints: string[]
  creatorReviews: {
    id: string
    creator: string
    role: string
    avatar: string
    rating: number
    tag: string
    comment: string
  }[]
}

export interface NoteComment {
  id: string
  author: string
  date: string
  avatar: string
  content: string
  rating?: number
  tag?: string
}

export interface FinderItem {
  id: string
  name: string
  type: "folder" | "video" | "pdf" | "note" | "action"
  size?: string
  modified: string
  kind: "Folder" | "MPEG-4 Video" | "PDF Document" | "macOS Note" | "Action Item"
  iconType: "folder" | "video" | "pdf" | "note" | "action"
  targetFolderId?: string
  videoUrl?: string
  lookbookData?: BestItemLookbook
  notesData?: {
    title: string
    subtitle: string
    comments: NoteComment[]
  }
}

// ───────────────── 1. 브랜드별 대표 상품 룩북 프리셋 ─────────────────
const PATAGONIA_LOOKBOOK: BestItemLookbook = {
  brand: "파타고니아",
  product: "Classic Retro-X Fleece Jacket",
  category: "Outdoor Classic Outerwear",
  visualTag: "FW26 Signature Best Seller",
  summary: "특유의 배색 포켓과 볼륨감 있는 실루엣으로 수십 년간 전 세계인에게 사랑받아 온 파타고니아의 대표 플리스 자켓",
  accentColor: "from-amber-500 to-rose-500",
  ratings: [
    { label: "디자인 & 실루엣", score: 98, displayScore: "98%", desc: "시그니처 플리스 텍스처와 완벽한 볼륨 핏" },
    { label: "데일리 코디 활용도", score: 96, displayScore: "96%", desc: "데님, 와이드 팬츠, 조거 어디에나 믹스매치" },
    { label: "트렌드 & 소장 가치", score: 99, displayScore: "99%", desc: "유행을 타지 않는 올타임 스테디셀러" },
    { label: "실착 핏감 및 편안함", score: 94, displayScore: "94%", desc: "포근하고 여유로운 착용감과 방풍 구조" },
  ],
  stylePoints: [
    "체스트 배색 지퍼 포켓으로 단조롭지 않고 확실한 레트로 포인트 연출",
    "세미 루즈핏 실루엣으로 후드나 스웨트셔츠 위에 레이어드하기 이상적인 핏",
    "아웃도어 필드부터 감각적인 어반 스트리트까지 폭넓게 소화 가능한 비주얼",
  ],
  creatorReviews: [
    {
      id: "rev-p1",
      creator: "Minji Cho",
      role: "Style Director",
      avatar: "🎨",
      rating: 5,
      tag: "최애 데일리 룩",
      comment: "가을부터 초봄까지 가장 손이 많이 가는 아우터. 무심하게 툭 걸쳐도 룩이 완성돼요!",
    },
    {
      id: "rev-p2",
      creator: "Elena Rostova",
      role: "Visual Archivist",
      avatar: "🏔️",
      rating: 5,
      tag: "독보적인 컬러웨이",
      comment: "특유의 내추럴한 컬러웨이가 실물로 보면 훨씬 감각적입니다. 소장 가치 충분함.",
    },
    {
      id: "rev-p3",
      creator: "David Park",
      role: "Trend Curator",
      avatar: "🧥",
      rating: 4.8,
      tag: "오버핏 코디 찰떡",
      comment: "핏감이 넉넉해서 와이드 슬랙스나 카고 팬츠랑 매치했을 때 트렌디한 실루엣이 바로 살아나요.",
    },
  ],
}

const ARCTERYX_LOOKBOOK: BestItemLookbook = {
  brand: "아크테릭스",
  product: "Alpha SV Alpine Shell",
  category: "Urban Gorpcore Shell",
  visualTag: "Urban Gorpcore Must-Have",
  summary: "날렵한 인체공학적 입체 패턴과 미니멀한 버드 로고가 완성하는 하이엔드 어반 테크웨어의 정점",
  accentColor: "from-blue-600 to-indigo-700",
  ratings: [
    { label: "디자인 & 실루엣", score: 99, displayScore: "99%", desc: "몸을 완벽히 감싸는 날렵한 3D 하드쉘 핏" },
    { label: "데일리 코디 활용도", score: 93, displayScore: "93%", desc: "올블랙 시크 룩부터 스트리트 고프코어까지 완벽 대응" },
    { label: "트렌드 & 소장 가치", score: 100, displayScore: "100%", desc: "아크테릭스 브랜드의 최정상 플래그십 아이콘" },
    { label: "실착 핏감 및 편안함", score: 95, displayScore: "95%", desc: "모션 프리 패턴으로 활동 시 구속감 없는 편안함" },
  ],
  stylePoints: [
    "바디라인을 입체적으로 살려주는 테크니컬 패턴으로 세련된 하이테크 무드 연출",
    "미니멀한 골드 버드 로고와 방수 워터타이트 지퍼가 주는 미래지향적 감성",
    "각 잡힌 스톰후드와 높은 넥 칼라로 얼굴 라인이 정돈되는 비주얼 효과",
  ],
  creatorReviews: [
    {
      id: "rev-a1",
      creator: "Alex Chen",
      role: "Footwear & Techwear Lead",
      avatar: "👟",
      rating: 5,
      tag: "고프코어 끝판왕",
      comment: "살로몬 스니커즈랑 매치하면 스트리트 고프코어의 정석입니다. 핏이 진짜 예술이에요.",
    },
    {
      id: "rev-a2",
      creator: "Sarah Johnson",
      role: "Fashion Editor",
      avatar: "🌱",
      rating: 5,
      tag: "탄탄한 실루엣",
      comment: "입는 순간 몸의 라인을 탄탄하게 잡아주는 구조감이 남다릅니다. 어떤 각도에서도 멋져요.",
    },
  ],
}

const LORO_PIANA_LOOKBOOK: BestItemLookbook = {
  brand: "로로피아나",
  product: "Storm System® Cashmere Overcoat",
  category: "Timeless Quiet Luxury",
  visualTag: "Quiet Luxury Masterpiece",
  summary: "극강의 우아함을 자랑하는 캐시미어 실루엣에 현대적인 라이프스타일을 접목한 콰이어트 럭셔리의 정수",
  accentColor: "from-amber-700 to-stone-800",
  ratings: [
    { label: "디자인 & 실루엣", score: 100, displayScore: "100%", desc: "물 흐르듯 떨어지는 자연스러운 어깨선과 드레이프" },
    { label: "데일리 코디 활용도", score: 92, displayScore: "92%", desc: "포멀 수트부터 릴렉스드 캐시미어 니트웨어까지 조화" },
    { label: "트렌드 & 소장 가치", score: 99, displayScore: "99%", desc: "대를 물려 입을 수 있는 클래식 헤리티지 가치" },
    { label: "실착 핏감 및 편안함", score: 98, displayScore: "98%", desc: "공기처럼 가볍고 피부에 닿는 극상의 부드러움" },
  ],
  stylePoints: [
    "어깨부터 밑단까지 우아하게 떨어지는 클래식 싱글브레스트 실루엣",
    "빛의 각도에 따라 은은하게 드러나는 베이비 캐시미어 고유의 고급스러운 결감",
    "눈과 비에 구애받지 않고 언제나 정갈한 드레이프를 유지하는 비주얼",
  ],
  creatorReviews: [
    {
      id: "rev-l1",
      creator: "Jinwoo Lee",
      role: "Luxury Archivist",
      avatar: "🎒",
      rating: 5,
      tag: "차원이 다른 핏",
      comment: "걸치는 순간 실루엣의 흐름이 차원이 다르다는 걸 실감합니다. 콰이어트 럭셔리의 끝.",
    },
    {
      id: "rev-l2",
      creator: "Minji Cho",
      role: "Style Director",
      avatar: "🎨",
      rating: 5,
      tag: "우아한 데일리",
      comment: "특별한 날뿐만 아니라 니트 팬츠에 편안하게 걸쳐도 기품이 묻어납니다.",
    },
  ],
}

const FREITAG_LOOKBOOK: BestItemLookbook = {
  brand: "프라이탁",
  product: "F13 TOP CAT Messenger Bag",
  category: "Unique Street Messenger",
  visualTag: "One-of-a-Kind Street Icon",
  summary: "세상에 단 하나뿐인 고유한 패턴과 빈티지한 감성으로 시선을 사로잡는 스트리트 아이콘 메신저백",
  accentColor: "from-amber-500 to-lime-600",
  ratings: [
    { label: "디자인 & 실루엣", score: 97, displayScore: "97%", desc: "단조로운 착장에 생기를 불어넣는 볼드한 메신저백 핏" },
    { label: "데일리 코디 활용도", score: 96, displayScore: "96%", desc: "자전거, 출퇴근, 캐주얼 룩 어디에나 믹스매치 가능" },
    { label: "트렌드 & 소장 가치", score: 98, displayScore: "98%", desc: "세계 유일의 나만의 패턴이라는 희소 가치" },
    { label: "실착 핏감 및 편안함", score: 93, displayScore: "93%", desc: "안전벨트 스트랩으로 어깨에 착 감기는 안정감" },
  ],
  stylePoints: [
    "누구와도 겹치지 않는 유일무이한 방수포 패턴으로 개성 넘치는 포인트 연출",
    "몸에 밀착되는 와이드 스트랩과 메신저백 특유의 다이내믹한 스트리트 무드",
    "세월이 흐를수록 멋스러워지는 자연스러운 에이징 텍스처",
  ],
  creatorReviews: [
    {
      id: "rev-f1",
      creator: "Alex Chen",
      role: "Streetwear Curator",
      avatar: "👟",
      rating: 5,
      tag: "세상에 단 하나",
      comment: "나와 똑같은 가방을 든 사람을 마주칠 일 없다는 점만으로도 매일 들고 다니게 됩니다.",
    },
    {
      id: "rev-f2",
      creator: "David Park",
      role: "Style Director",
      avatar: "🧥",
      rating: 4.9,
      tag: "스트리트 룩 치트키",
      comment: "심플한 흰 티에 청바지 입고 이거 하나만 메도 그날 코디는 끝나요.",
    },
  ],
}

// ───────────────── 2. 브랜드별 파일 리스트 프리셋 ─────────────────
const PATAGONIA_FILES: FinderItem[] = [
  {
    id: "pata-vid-1",
    name: "Patagonia_Retro-X_Review.mp4",
    type: "video",
    size: "482.4 MB",
    modified: "Today, 11:20 AM",
    kind: "MPEG-4 Video",
    iconType: "video",
    videoUrl: "https://www.youtube.com/embed/p1oE_mI9FkE",
  },
]

const ARCTERYX_FILES: FinderItem[] = [
  {
    id: "arc-vid-1",
    name: "Arcteryx_Alpha_SV_Review.mp4",
    type: "video",
    size: "620.1 MB",
    modified: "Nov 06, 2026",
    kind: "MPEG-4 Video",
    iconType: "video",
    videoUrl: "https://www.youtube.com/embed/3e2v_iX31-o",
  },
]

const LORO_PIANA_FILES: FinderItem[] = [
  {
    id: "loro-vid-1",
    name: "LoroPiana_Vicuna_Craft_Review.mp4",
    type: "video",
    size: "390.2 MB",
    modified: "Nov 02, 2026",
    kind: "MPEG-4 Video",
    iconType: "video",
    videoUrl: "https://www.youtube.com/embed/n4rLwH_HhN4",
  },
]

const FREITAG_FILES: FinderItem[] = [
  {
    id: "frei-vid-1",
    name: "Freitag_Tarp_Upcycling_Review.mp4",
    type: "video",
    size: "340.5 MB",
    modified: "Oct 28, 2026",
    kind: "MPEG-4 Video",
    iconType: "video",
    videoUrl: "https://www.youtube.com/embed/e_Xw13cWJ3k",
  },
]

// ───────────────── 3. 전체 브랜드 루트 폴더 항목들 ─────────────────
const ALL_BRANDS_ROOT: FinderItem[] = [
  {
    id: "folder-patagonia",
    name: "파타고니아",
    type: "folder",
    size: "1 item",
    modified: "Today, 11:20 AM",
    kind: "Folder",
    iconType: "folder",
    targetFolderId: "brand-patagonia",
  },
  {
    id: "folder-arcteryx",
    name: "아크테릭스",
    type: "folder",
    size: "1 item",
    modified: "Nov 06, 2026",
    kind: "Folder",
    iconType: "folder",
    targetFolderId: "brand-arcteryx",
  },
  {
    id: "folder-loropiana",
    name: "로로피아나",
    type: "folder",
    size: "1 item",
    modified: "Nov 02, 2026",
    kind: "Folder",
    iconType: "folder",
    targetFolderId: "brand-loropiana",
  },
  {
    id: "folder-freitag",
    name: "프라이탁",
    type: "folder",
    size: "1 item",
    modified: "Oct 28, 2026",
    kind: "Folder",
    iconType: "folder",
    targetFolderId: "brand-freitag",
  },
]

// ───────────────── 4. 브랜드 조사 신청 폴더 기본 데이터 ─────────────────
const INITIAL_OPEN_REQUESTS: FinderItem[] = [
  {
    id: "req-action-new",
    name: "브랜드 신청",
    type: "action",
    size: "Interactive",
    modified: "클릭하여 폴더 생성",
    kind: "Action Item",
    iconType: "action",
  },
  {
    id: "req-item-1",
    name: "살로몬",
    type: "folder",
    size: "1 item",
    modified: "Today, 1:15 PM",
    kind: "Folder",
    iconType: "folder",
  },
  {
    id: "req-item-2",
    name: "나누슈카",
    type: "folder",
    size: "1 item",
    modified: "Nov 07, 2026",
    kind: "Folder",
    iconType: "folder",
  },
  {
    id: "req-item-3",
    name: "바버",
    type: "folder",
    size: "1 item",
    modified: "Nov 06, 2026",
    kind: "Folder",
    iconType: "folder",
  },
]

export function Finder({ initialFolder = "All Brands", navigationRequestId, onOpenVideo, onOpenUrl }: FinderProps) {
  // 현재 선택된 폴더 (all-brands, open-request, brand-patagonia 등)
  const [currentFolderId, setCurrentFolderId] = useState<string>("all-brands")
  const [folderHistory, setFolderHistory] = useState<string[]>(["all-brands"])
  const [historyIndex, setHistoryIndex] = useState(0)

  // 선택된 항목
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchQuery, setSearchQuery] = useState("")

  // 사용자 신청 및 코멘트 상태 (관리자 삭제 및 신규 신청 영구 반영)
  const [openRequests, setOpenRequests] = useState<FinderItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("findcategory_brand_requests")
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return INITIAL_OPEN_REQUESTS
  })
  const [brandNotes] = useState<Record<string, FinderItem[]>>({
    "brand-patagonia": PATAGONIA_FILES,
    "brand-arcteryx": ARCTERYX_FILES,
    "brand-loropiana": LORO_PIANA_FILES,
    "brand-freitag": FREITAG_FILES,
  })

  // 모달 제어 상태 (Video 플레이어)
  const [activeVideoModal, setActiveVideoModal] = useState<{
    name: string
    url: string
  } | null>(null)

  // 인라인 브랜드 폴더 생성 및 이름 편집 상태
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState("")

  // 유저 인증 및 권한 상태 (Guest vs Member vs Admin 동기화)
  const { role, isLoggedIn, isAdmin, isGuest, requireAuth } = useAuth()

  // 전체 브랜드 폴더 리스트 상태 (관리자 삭제 영구 반영)
  const [allBrandsList, setAllBrandsList] = useState<FinderItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("findcategory_all_brands_folders")
        if (saved) {
          const parsed: FinderItem[] = JSON.parse(saved)
          const updated = parsed.map((item) =>
            item.size === "3 items" ? { ...item, size: "1 item" } : item
          )
          localStorage.setItem("findcategory_all_brands_folders", JSON.stringify(updated))
          return updated
        }
      } catch {}
    }
    return ALL_BRANDS_ROOT
  })

  // 브랜드 폴더 삭제 핸들러 (관리자 전용)
  const handleDeleteBrandFolder = (folderId: string, folderName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!isAdmin) return

    if (window.confirm(`'${folderName}' 브랜드 폴더를 영구 삭제하시겠습니까?`)) {
      setAllBrandsList((prev) => {
        const updated = prev.filter((item) => item.id !== folderId && item.targetFolderId !== folderId)
        try {
          localStorage.setItem("findcategory_all_brands_folders", JSON.stringify(updated))
          queueMicrotask(() => window.dispatchEvent(new CustomEvent("findcategory_brands_updated")))
        } catch {}
        return updated
      })

      // 현재 열려 있는 폴더가 삭제 대상인 경우 all-brands로 복귀
      if (
        currentFolderId === folderId ||
        currentFolderId.includes(folderId.replace("folder-", "")) ||
        folderId.includes(currentFolderId.replace("brand-", ""))
      ) {
        navigateTo("all-brands")
      }

      triggerTemplateNotification("folder_deleted", { folderName }, {
        app: "Finder",
        title: "브랜드 폴더 삭제",
        message: `‘${folderName}’ 브랜드 폴더가 영구 삭제되었습니다.`,
        iconType: "finder",
      })
    }
  }

  // 브랜드 조사 신청 항목 삭제 핸들러 (관리자 전용)
  const handleDeleteBrandRequest = (requestId: string, requestName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!isAdmin) return

    if (window.confirm(`'${requestName || "신청 내역"}' 브랜드 조사 신청 항목을 영구 삭제하시겠습니까?`)) {
      setOpenRequests((prev) => {
        const updated = prev.filter((item) => item.id !== requestId)
        try {
          localStorage.setItem("findcategory_brand_requests", JSON.stringify(updated))
        } catch {}
        return updated
      })
      if (selectedItemId === requestId) {
        setSelectedItemId(null)
      }
      showNotification({
        app: "Finder",
        title: "브랜드 조사 신청 삭제",
        message: `‘${requestName || "신청 내역"}’ 항목이 관리자에 의해 삭제되었습니다.`,
        iconType: "finder",
      })
    }
  }

  // Privacy & Security 권한 실시간 감지
  const [permissions, setPermissions] = useState<AppPermissions>(() => getStoredPermissions())

  useEffect(() => {
    const updatePerms = () => {
      setPermissions(getStoredPermissions())
    }
    window.addEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
    window.addEventListener("storage", updatePerms)
    return () => {
      window.removeEventListener(PERMISSIONS_UPDATED_EVENT, updatePerms)
      window.removeEventListener("storage", updatePerms)
    }
  }, [])

  // 관리자 전용: 전체 브랜드 새 폴더 생성
  const handleCreateBrandFolder = () => {
    if (!isAdmin) return
    const newId = `folder-brand-${Date.now()}`
    const targetFolderId = `brand-${newId}`
    const newFolder: FinderItem = {
      id: newId,
      name: "",
      type: "folder",
      size: "0 items",
      modified: "Just now",
      kind: "Folder",
      iconType: "folder",
      targetFolderId: targetFolderId,
    }

    setAllBrandsList((prev) => {
      const updated = [...prev, newFolder]
      try {
        localStorage.setItem("findcategory_all_brands_folders", JSON.stringify(updated))
        queueMicrotask(() => window.dispatchEvent(new CustomEvent("findcategory_brands_updated")))
      } catch {}
      return updated
    })

    setEditingFolderId(newId)
    setEditingFolderName("")
    setSelectedItemId(newId)
  }

  // 새 신청서 작성 클릭 시: 비회원 가드 적용 후 화면에 신규 폴더 생성 및 인라인 편집 활성화
  const handleCreateNewBrandFolder = () => {
    if (!requireAuth("브랜드 조사 신청")) return
    if (!permissions.finder.allowFolderCreate) return
    const newId = `req-folder-${Date.now()}`
    const newFolder: FinderItem = {
      id: newId,
      name: "",
      type: "folder",
      size: "0 items",
      modified: "Just now",
      kind: "Folder",
      iconType: "folder",
    }
    // "브랜드 신청" 액션 버튼 바로 아래에 새 폴더 삽입
    setOpenRequests((prev) => {
      const updated = [prev[0], newFolder, ...prev.slice(1)]
      try {
        localStorage.setItem("findcategory_brand_requests", JSON.stringify(updated))
      } catch {}
      return updated
    })
    setEditingFolderId(newId)
    setEditingFolderName("")
    setSelectedItemId(newId)
  }

  // 폴더명 편집 완료/저장
  const handleSaveBrandFolderName = (folderId: string) => {
    if (!requireAuth("폴더 이름 저장")) return
    if (!permissions.finder.allowTextInput) return
    const trimmed = editingFolderName.trim()

    // 1. 전체 브랜드 목록에 존재하는 폴더인 경우
    if (allBrandsList.some((f) => f.id === folderId)) {
      const folderName = trimmed || "새 폴더"
      setAllBrandsList((prev) => {
        const updated = prev.map((f) => {
          if (f.id === folderId) {
            return {
              ...f,
              name: folderName,
            }
          }
          return f
        })
        try {
          localStorage.setItem("findcategory_all_brands_folders", JSON.stringify(updated))
          queueMicrotask(() => window.dispatchEvent(new CustomEvent("findcategory_brands_updated")))
        } catch {}
        return updated
      })
      setEditingFolderId(null)
      triggerTemplateNotification("folder_created", { folderName }, {
        app: "Finder",
        title: "새 폴더 생성 완료",
        message: `‘${folderName}’ 브랜드 폴더가 생성되었습니다.`,
        iconType: "finder",
      })
      return
    }

    // 2. 브랜드 조사 신청 목록에 존재하는 항목인 경우
    const folderName = trimmed || "신규 브랜드 폴더"
    setOpenRequests((prev) => {
      const updated = prev.map((f) => {
        if (f.id === folderId) {
          return {
            ...f,
            name: folderName,
          }
        }
        return f
      })
      try {
        localStorage.setItem("findcategory_brand_requests", JSON.stringify(updated))
      } catch {}
      return updated
    })
    setEditingFolderId(null)
    triggerTemplateNotification("request_created", { folderName }, {
      app: "Finder",
      title: "신규 브랜드 신청 완료",
      message: `‘${folderName}’ 브랜드 개설 신청 항목이 생성되었습니다.`,
      iconType: "finder",
    })
  }

  // 초기 폴더 매핑 (외부 앱 연동 포함)
  useEffect(() => {
    if (
      initialFolder === "Open Request" ||
      initialFolder === "브랜드 조사 신청" ||
      initialFolder === "브랜드 조사 신청하기"
    ) {
      setCurrentFolderId("open-request")
      setFolderHistory(["all-brands", "open-request"])
      setHistoryIndex(1)
    } else if (initialFolder && (initialFolder.startsWith("brand-") || initialFolder.startsWith("folder-"))) {
      setCurrentFolderId(initialFolder)
      setFolderHistory(["all-brands", initialFolder])
      setHistoryIndex(1)
    } else {
      const matchedBrand = allBrandsList.find(
        (b) => b.name === initialFolder || b.targetFolderId === initialFolder || b.id === initialFolder,
      )
      if (matchedBrand) {
        const targetId = matchedBrand.targetFolderId || matchedBrand.id
        setCurrentFolderId(targetId)
        setFolderHistory(["all-brands", targetId])
        setHistoryIndex(1)
      } else {
        setCurrentFolderId("all-brands")
        setFolderHistory(["all-brands"])
        setHistoryIndex(0)
      }
    }
    setSelectedItemId(null)
  }, [initialFolder, navigationRequestId])

  const navigateTo = (folderId: string) => {
    const newHistory = folderHistory.slice(0, historyIndex + 1)
    newHistory.push(folderId)
    setFolderHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCurrentFolderId(folderId)
    setSelectedItemId(null)
  }

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1
      setHistoryIndex(prev)
      setCurrentFolderId(folderHistory[prev])
      setSelectedItemId(null)
    }
  }

  const goForward = () => {
    if (historyIndex < folderHistory.length - 1) {
      const next = historyIndex + 1
      setHistoryIndex(next)
      setCurrentFolderId(folderHistory[next])
      setSelectedItemId(null)
    }
  }

  // 현재 폴더에 따른 파일 목록 반환
  const getCurrentFiles = (): FinderItem[] => {
    switch (currentFolderId) {
      case "all-brands":
        return allBrandsList
      case "brand-patagonia":
      case "trending-1":
        return brandNotes["brand-patagonia"] || PATAGONIA_FILES
      case "brand-arcteryx":
        return brandNotes["brand-arcteryx"] || ARCTERYX_FILES
      case "brand-loropiana":
        return brandNotes["brand-loropiana"] || LORO_PIANA_FILES
      case "brand-freitag":
        return brandNotes["brand-freitag"] || FREITAG_FILES
      case "open-request": {
        const list = openRequests || []
        return permissions.finder.allowFolderCreate
          ? list
          : list.filter((item) => item.id !== "req-action-new")
      }
      default: {
        if (currentFolderId.startsWith("brand-")) {
          return brandNotes[currentFolderId] || []
        }
        return allBrandsList
      }
    }
  }

  const files = getCurrentFiles() || []
  const filteredFiles = files.filter(
    (file) => file && typeof file.name === "string" && file.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  )

  // 폴더 타이틀 표시용
  const getFolderDisplayName = () => {
    switch (currentFolderId) {
      case "all-brands":
        return "전체 브랜드"
      case "brand-patagonia":
      case "trending-1":
        return "📁 파타고니아"
      case "brand-arcteryx":
        return "📁 아크테릭스"
      case "brand-loropiana":
        return "📁 로로피아나"
      case "brand-freitag":
        return "📁 프라이탁"
      case "open-request":
        return "브랜드 조사 신청하기"
      default: {
        const custom = allBrandsList.find(
          (b) => b.targetFolderId === currentFolderId || b.id === currentFolderId
        )
        if (custom) return `📁 ${custom.name || "새 폴더"}`
        return "브랜드 라이브러리"
      }
    }
  }

  // 파일 클릭 / 더블클릭 이벤트 처리
  const handleItemClick = (item: FinderItem) => {
    setSelectedItemId(item.id)

    // '브랜드 신청' 항목 클릭 시: 비회원 가드 후 바로 새 폴더 생성
    if (item.type === "action" || item.id === "req-action-new") {
      if (!requireAuth("브랜드 조사 신청")) return
      handleCreateNewBrandFolder()
      return
    }

    if (item.type === "folder") {
      if (item.targetFolderId) {
        navigateTo(item.targetFolderId)
      } else if (currentFolderId === "open-request") {
        if (!requireAuth("신청 폴더 편집")) return
        setEditingFolderId(item.id)
        setEditingFolderName(item.name)
      }
    } else if (item.type === "video") {
      if (item.videoUrl) {
        if (onOpenVideo) {
          onOpenVideo({ name: item.name, url: item.videoUrl })
        } else {
          setActiveVideoModal({ name: item.name, url: item.videoUrl })
        }
      }
    } else if (item.type === "pdf") {
      // PDF 항목 선택
      setSelectedItemId(item.id)
    }
  }

  // 아이콘 렌더링 헬퍼
  const renderItemIcon = (item: FinderItem, isLarge = false) => {
    if (item.type === "action" || item.id === "req-action-new") {
      return (
        <div className="relative flex items-center justify-center">
          <FolderPlus className={`${isLarge ? "w-14 h-14" : "w-6 h-6"} text-blue-500 fill-blue-400 drop-shadow-sm`} />
        </div>
      )
    }
    if (item.iconType === "folder") {
      return (
        <div className="relative flex items-center justify-center">
          <Folder className={`${isLarge ? "w-14 h-14" : "w-6 h-6"} text-sky-500 fill-sky-400 drop-shadow-sm`} />
          {item.targetFolderId && (
            <span className="absolute text-[9px] font-bold text-white tracking-tighter mt-1">BRAND</span>
          )}
        </div>
      )
    }
    if (item.iconType === "video") {
      return (
        <div className="relative flex items-center justify-center group">
          <div
            className={`${
              isLarge ? "w-14 h-10" : "w-7 h-5"
            } flex items-center justify-center transition-transform group-hover:scale-105 drop-shadow-sm`}
          >
            <svg viewBox="0 0 28 20" className="w-full h-full" fill="none">
              <rect width="28" height="20" rx="5" fill="#FF0000" />
              <polygon points="11,5 19,10 11,15" fill="white" />
            </svg>
          </div>
        </div>
      )
    }
    if (item.iconType === "pdf") {
      return (
        <div className="relative flex items-center justify-center">
          <div
            className={`${
              isLarge ? "w-12 h-14" : "w-6 h-7"
            } rounded bg-gradient-to-b from-indigo-50 to-violet-100 border border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400`}
          >
            <BookOpen className={isLarge ? "w-6 h-6" : "w-3.5 h-3.5"} />
            <span className="text-[6.5px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mt-0.5">
              LOOKBOOK
            </span>
          </div>
        </div>
      )
    }
    if (item.iconType === "note") {
      return (
        <div className="relative flex items-center justify-center">
          <div
            className={`${
              isLarge ? "w-12 h-14" : "w-6 h-7"
            } rounded bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-300 flex flex-col items-center justify-center shadow-sm text-amber-700`}
          >
            <StickyNote className={isLarge ? "w-6 h-6" : "w-3.5 h-3.5"} />
            <span className="text-[7px] font-bold uppercase tracking-wider text-amber-800 mt-0.5">NOTE</span>
          </div>
        </div>
      )
    }

    return (
      <div className="relative flex items-center justify-center">
        <Folder className={`${isLarge ? "w-14 h-14" : "w-6 h-6"} text-sky-500 fill-sky-400 drop-shadow-sm`} />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex bg-slate-50 dark:bg-zinc-950 font-sans select-none overflow-hidden text-slate-800 dark:text-zinc-100">
      {/* ───────────────── SIDEBAR ───────────────── */}
      <div className="w-56 bg-slate-100/70 dark:bg-zinc-900/70 backdrop-blur-md border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between p-3 shrink-0">
        <div className="space-y-4">
          {/* Brand Archive 구역 (All Brands, 브랜드 조사 신청) */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 px-2.5">
              <span>Brand Archive</span>
            </div>
            <div className="space-y-0.5">
              {/* All Brands */}
              <button
                onClick={() => navigateTo("all-brands")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  currentFolderId === "all-brands"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-700 dark:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder
                    className={`w-4 h-4 ${currentFolderId === "all-brands" ? "text-white" : "text-blue-500"}`}
                  />
                  <span>브랜드 영상보기</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    currentFolderId === "all-brands"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                  }`}
                >
                  {allBrandsList.length}
                </span>
              </button>

              {/* 브랜드 조사 신청하기 */}
              <button
                onClick={() => navigateTo("open-request")}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  currentFolderId === "open-request"
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-700 dark:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquarePlus
                    className={`w-4 h-4 ${currentFolderId === "open-request" ? "text-white" : "text-violet-500"}`}
                  />
                  <span>브랜드 조사 신청하기</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    currentFolderId === "open-request"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                  }`}
                >
                  {openRequests.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Curated Brands */}
          {allBrandsList.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5 px-2.5">
                Curated Contents
              </div>
              <div className="space-y-0.5">
                {allBrandsList.map((brand) => {
                  const targetId = brand.targetFolderId || brand.id
                  const dotColor =
                    targetId === "brand-patagonia"
                      ? "bg-emerald-500"
                      : targetId === "brand-arcteryx"
                      ? "bg-blue-500"
                      : targetId === "brand-loropiana"
                      ? "bg-purple-500"
                      : "bg-amber-500"
                  return (
                    <button
                      key={brand.id}
                      onClick={() => navigateTo(targetId)}
                      className="w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-200/50"
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="truncate">{brand.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 하단 정보 */}
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-2 px-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Archive Live Sync</span>
          </div>
        </div>
      </div>

      {/* ───────────────── MAIN FILE VIEW ───────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900">
        {/* macOS 정밀 툴바 (Navigation, Breadcrumb, View Toggle, Search) */}
        <div className="h-13 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
          {/* 뒤로가기/앞으로가기 및 경로 브레드크럼 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={goBack}
                disabled={historyIndex === 0}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIndex >= folderHistory.length - 1}
                className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Forward"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <button
                onClick={() => navigateTo("all-brands")}
                className="hover:text-blue-600 font-medium transition-colors"
              >
                Brand Library
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-zinc-100">{getFolderDisplayName()}</span>
            </div>
          </div>

          {/* 우측 도구: 검색 및 뷰 모드 토글 */}
          <div className="flex items-center gap-2">
            {/* 관리자 전용 선택 폴더 삭제 버튼 */}
            {isAdmin && currentFolderId === "all-brands" && selectedItemId && (
              <button
                type="button"
                onClick={(e) => {
                  const target = allBrandsList.find((f) => f.id === selectedItemId)
                  if (target) {
                    handleDeleteBrandFolder(target.id, target.name, e)
                  }
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="선택한 브랜드 폴더 삭제 (관리자 전용)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>선택 폴더 삭제</span>
              </button>
            )}

            {/* 관리자 전용: 특정 브랜드 폴더를 열었을 때 상단 '폴더 삭제' 버튼 */}
            {isAdmin && (currentFolderId.startsWith("brand-") || currentFolderId.startsWith("req-folder-")) && (
              <button
                type="button"
                onClick={(e) => {
                  const target = allBrandsList.find((b) => b.targetFolderId === currentFolderId || b.id === currentFolderId)
                  const folderName = target ? target.name : getFolderDisplayName().replace("📁 ", "")
                  const folderId = target ? target.id : currentFolderId
                  handleDeleteBrandFolder(folderId, folderName, e)
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="현재 열려있는 브랜드 폴더 삭제 (관리자 전용)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>폴더 삭제</span>
              </button>
            )}

            {/* 관리자 전용: 브랜드 조사 신청 화면에서 선택한 항목 삭제 버튼 */}
            {isAdmin && currentFolderId === "open-request" && selectedItemId && selectedItemId !== "req-action-new" && (
              <button
                type="button"
                onClick={(e) => {
                  const target = openRequests.find((f) => f.id === selectedItemId)
                  if (target) {
                    handleDeleteBrandRequest(target.id, target.name, e)
                  }
                }}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="선택한 브랜드 조사 신청 항목 삭제 (관리자 전용)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>신청 삭제</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-zinc-800 rounded-lg px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="파일 검색..."
                className="bg-transparent outline-none w-28 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-200/60 dark:bg-zinc-800 rounded-lg p-0.5">
              <button
                className={`p-1 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-800 dark:text-zinc-100"
                    : "text-slate-500"
                }`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                className={`p-1 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-slate-800 dark:text-zinc-100"
                    : "text-slate-500"
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────── 상단 비주얼 소개 배너 ───────────────── */}
        {currentFolderId === "all-brands" && (
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border-b border-blue-100/70 dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Brand Library:</strong> 검색 없이 visual로 탐색하고, 브랜드 대표 상품의 솔직한 평가를 공유하는 공간
              </span>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  관리자 모드
                </span>
                <button
                  type="button"
                  onClick={handleCreateBrandFolder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded shadow-xs text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="새 폴더 생성"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새폴더 생성</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 관리자 전용: 브랜드 상세 폴더를 열었을 때 관리 배너 */}
        {isAdmin && (currentFolderId.startsWith("brand-") || currentFolderId.startsWith("req-folder-")) && (
          <div className="bg-rose-50/70 border-b border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 px-4 py-2 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>관리자 모드:</strong> 현재 <strong>{getFolderDisplayName().replace("📁 ", "")}</strong> 브랜드 폴더 내부를 보고 있습니다.
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                const target = allBrandsList.find((b) => b.targetFolderId === currentFolderId || b.id === currentFolderId)
                const folderName = target ? target.name : getFolderDisplayName().replace("📁 ", "")
                const folderId = target ? target.id : currentFolderId
                handleDeleteBrandFolder(folderId, folderName, e)
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-2.5 py-1 rounded shadow-sm text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="이 브랜드 폴더 삭제 (관리자 전용)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>이 폴더 삭제</span>
            </button>
          </div>
        )}

        {/* 안내 배너 (브랜드 조사 신청하기 폴더일 경우) */}
        {currentFolderId === "open-request" && (
          <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 border-b border-violet-100 dark:border-violet-900/40 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300">
              <MessageSquarePlus className="w-4 h-4 text-violet-600 shrink-0" />
              <span>
                <strong>브랜드 조사 신청하기:</strong> 원하는 브랜드나 함께 탐색하고 싶은 인기 아이템을 자유롭게 신청해 주세요!
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  관리자 모드
                </span>
              )}

              {permissions.finder.allowFolderCreate && (
                <button
                  onClick={handleCreateNewBrandFolder}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-2.5 py-1 rounded shadow-sm text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="새 신청서 작성"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 신청서 작성</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 파일 뷰 영역 */}
        <div className="flex-1 overflow-auto p-4">
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Search className="w-10 h-10 stroke-[1.5]" />
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : viewMode === "list" ? (
            /* ──────── LIST VIEW ──────── */
            <div className="w-full">
              {/* 리스트 헤더 */}
              <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800">
                <div className="col-span-6">Name</div>
                <div className="col-span-2 text-right">Size</div>
                <div className="col-span-2">Kind</div>
                <div className="col-span-2">Date Modified</div>
              </div>

              <div className="divide-y divide-slate-100/60 dark:divide-zinc-800/60">
                {filteredFiles.map((file) => {
                  const isSelected = selectedItemId === file.id
                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedItemId(file.id)}
                      onDoubleClick={() => handleItemClick(file)}
                      className={`grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "text-slate-800 dark:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleItemClick(file)
                          }}
                        >
                          {renderItemIcon(file, false)}
                        </div>
                        <div className="flex-1 truncate">
                          {editingFolderId === file.id ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                autoFocus
                                readOnly={!permissions.finder.allowTextInput}
                                placeholder={
                                  permissions.finder.allowTextInput
                                    ? currentFolderId === "all-brands"
                                      ? "새 폴더명 입력"
                                      : "신청 브랜드명 작성"
                                    : "작성 권한이 제한되었습니다"
                                }
                                className={`w-64 max-w-full bg-white dark:bg-zinc-800 border-2 rounded px-2 py-0.5 text-xs font-medium text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 placeholder:italic outline-none shadow-sm ${
                                  permissions.finder.allowTextInput
                                    ? "border-blue-500"
                                    : "border-slate-300 dark:border-zinc-700 cursor-not-allowed opacity-60"
                                }`}
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === "Escape") {
                                    handleSaveBrandFolderName(file.id)
                                  }
                                }}
                                onBlur={() => handleSaveBrandFolderName(file.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-[10px] text-blue-500 font-semibold shrink-0">
                                ↵ Enter 저장
                              </span>
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                if (
                                  permissions.finder.allowTextInput &&
                                  file.type === "folder" &&
                                  (currentFolderId === "open-request" || (currentFolderId === "all-brands" && isAdmin))
                                ) {
                                  if (selectedItemId === file.id) {
                                    e.stopPropagation()
                                    setEditingFolderId(file.id)
                                    setEditingFolderName(file.name)
                                  }
                                }
                              }}
                              className={permissions.finder.allowTextInput ? "cursor-pointer" : "cursor-default"}
                            >
                              {file.name ? (
                                <span className="font-medium truncate block">{file.name}</span>
                              ) : (
                                <span className="text-slate-400 italic block">
                                  {currentFolderId === "all-brands" ? "새 폴더명 입력" : "신청 브랜드명 작성"}
                                </span>
                              )}
                            </div>
                          )}
                          {file.type === "video" && (
                            <span
                              className={`text-[10px] flex items-center gap-1 ${
                                isSelected ? "text-blue-100" : "text-rose-500 font-medium"
                              }`}
                            >
                              클릭 시 데스크톱 QuickTime 플레이어로 재생 <PlayCircle className="w-2.5 h-2.5 inline" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`col-span-2 text-right ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {file.size || "--"}
                      </div>
                      <div className={`col-span-2 truncate ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {file.kind}
                      </div>
                      <div className={`col-span-2 flex items-center justify-between truncate ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        <span className="truncate">{file.modified}</span>
                        {/* 관리자 전용 브랜드 폴더 삭제 버튼 (전체 브랜드 화면) */}
                        {isAdmin && currentFolderId === "all-brands" && file.type === "folder" && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBrandFolder(file.id, file.name, e)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ml-1 cursor-pointer shrink-0 flex items-center gap-1 ${
                              isSelected
                                ? "bg-rose-500/25 text-rose-100 hover:bg-rose-500 hover:text-white"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60"
                            }`}
                            title={`‘${file.name}’ 폴더 삭제 (관리자 전용)`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>폴더 삭제</span>
                          </button>
                        )}
                        {/* 관리자 전용: 브랜드 조사 신청 항목 삭제 버튼 */}
                        {isAdmin && currentFolderId === "open-request" && file.id !== "req-action-new" && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBrandRequest(file.id, file.name, e)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ml-1 cursor-pointer shrink-0 flex items-center gap-1 ${
                              isSelected
                                ? "bg-rose-500/25 text-rose-100 hover:bg-rose-500 hover:text-white"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60"
                            }`}
                            title={`‘${file.name || "신청 내역"}’ 항목 삭제 (관리자 전용)`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>삭제</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ──────── GRID VIEW ──────── */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedItemId === file.id
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedItemId(file.id)}
                    onDoubleClick={() => handleItemClick(file)}
                    className={`flex flex-col items-center p-3 rounded-xl cursor-pointer text-center group transition-all ${
                      isSelected
                        ? "bg-blue-600/10 ring-2 ring-blue-500 text-blue-900 dark:text-blue-300"
                        : "hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-200"
                    }`}
                  >
                    <div
                      className="mb-2 transition-transform group-hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleItemClick(file)
                      }}
                    >
                      {renderItemIcon(file, true)}
                    </div>
                    {editingFolderId === file.id ? (
                      <input
                        type="text"
                        autoFocus
                        readOnly={!permissions.finder.allowTextInput}
                        placeholder={
                          permissions.finder.allowTextInput
                            ? currentFolderId === "all-brands"
                              ? "새 폴더명 입력"
                              : "신청 브랜드명 작성"
                            : "작성 제한됨"
                        }
                        className={`w-28 bg-white dark:bg-zinc-800 border-2 rounded px-1.5 py-0.5 text-xs text-center text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 placeholder:italic outline-none shadow-sm mt-1 ${
                          permissions.finder.allowTextInput
                            ? "border-blue-500"
                            : "border-slate-300 dark:border-zinc-700 cursor-not-allowed opacity-60"
                        }`}
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            handleSaveBrandFolderName(file.id)
                          }
                        }}
                        onBlur={() => handleSaveBrandFolderName(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`text-xs font-medium line-clamp-2 max-w-[130px] break-words ${
                              !file.name ? "text-slate-400 italic font-normal" : ""
                            }`}
                            onClick={(e) => {
                              if (
                                permissions.finder.allowTextInput &&
                                file.type === "folder" &&
                                (currentFolderId === "open-request" || (currentFolderId === "all-brands" && isAdmin))
                              ) {
                                if (selectedItemId === file.id) {
                                  e.stopPropagation()
                                  setEditingFolderId(file.id)
                                  setEditingFolderName(file.name)
                                }
                              }
                            }}
                          >
                            {file.name || (currentFolderId === "all-brands" ? "새 폴더명 입력" : "신청 브랜드명 작성")}
                          </span>
                        </div>

                        {/* 관리자 전용: Grid View 브랜드 조사 신청 항목 삭제 버튼 */}
                        {isAdmin && currentFolderId === "open-request" && file.id !== "req-action-new" && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBrandRequest(file.id, file.name, e)}
                            className="mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                            title={`‘${file.name || "신청 내역"}’ 항목 삭제 (관리자 전용)`}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>삭제</span>
                          </button>
                        )}

                        {/* 관리자 전용: Grid View 브랜드 폴더 삭제 버튼 */}
                        {isAdmin && currentFolderId === "all-brands" && file.type === "folder" && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBrandFolder(file.id, file.name, e)}
                            className="mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                            title={`‘${file.name}’ 폴더 삭제 (관리자 전용)`}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>폴더 삭제</span>
                          </button>
                        )}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 mt-0.5">{file.size}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 하단 macOS 상태바 */}
        <div className="h-6 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/70 shrink-0">
          <span>{filteredFiles.length} items</span>
          <span className="text-[10px]">
            {selectedItemId ? "선택됨 • 더블클릭하여 파일 열기" : "항목을 클릭하거나 더블클릭하세요"}
          </span>
        </div>
      </div>

      {/* ───────────────── MODAL: QUICKTIME DESKTOP PLAYER (동영상 재생 모달) ───────────────── */}
      {activeVideoModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[720px] max-w-full h-[480px] bg-zinc-950 rounded-xl shadow-2xl border border-zinc-700/80 flex flex-col overflow-hidden">
            {/* QuickTime 타이틀바 (macOS 트래픽 라이트) */}
            <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group"
                >
                  <X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
                </button>
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-xs font-semibold text-zinc-200 ml-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-500" />
                  <span>QuickTime Player • {activeVideoModal.name}</span>
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors"
              >
                닫기
              </button>
            </div>

            {/* QuickTime Player 컴포넌트 */}
            <div className="flex-1 w-full overflow-hidden">
              <QuickTimePlayer videoUrl={activeVideoModal.url} title={activeVideoModal.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
