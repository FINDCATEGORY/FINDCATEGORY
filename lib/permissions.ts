export interface AppPermissions {
  finder: {
    allowTextInput: boolean // 텍스트/의견 작성 허용
    allowDelete: boolean // 게시글/내역 삭제 권한
    allowFolderCreate: boolean // 신규 브랜드 폴더 생성 허용
  }
  messages: {
    allowTextInput: boolean // 실시간 채팅 메시지 입력 허용
    allowDelete: boolean // 채팅 메시지 삭제 권한
    allowAttachment: boolean // 파일/이미지 첨부 허용
  }
  safari: {
    allowProfileEdit: boolean // 회원 정보 수정 허용
    allowExternalLinks: boolean // 외부 웹사이트 링크 이동 허용
  }
  notes: {
    allowWrite: boolean // 메모 작성 및 편집 허용
    allowDelete: boolean // 메모 및 폴더 삭제 권한
  }
}

// 기본 권한 프리셋 (관리자 및 일반 사용자)
export const DEFAULT_PERMISSIONS: AppPermissions = {
  finder: {
    allowTextInput: true,
    allowDelete: false,
    allowFolderCreate: true,
  },
  messages: {
    allowTextInput: true,
    allowDelete: false,
    allowAttachment: true,
  },
  safari: {
    allowProfileEdit: true,
    allowExternalLinks: true,
  },
  notes: {
    allowWrite: true,
    allowDelete: false,
  },
}

export const ADMIN_FULL_PERMISSIONS: AppPermissions = {
  finder: {
    allowTextInput: true,
    allowDelete: true,
    allowFolderCreate: true,
  },
  messages: {
    allowTextInput: true,
    allowDelete: true,
    allowAttachment: true,
  },
  safari: {
    allowProfileEdit: true,
    allowExternalLinks: true,
  },
  notes: {
    allowWrite: true,
    allowDelete: true,
  },
}

export const PERMISSIONS_STORAGE_KEY = "findcategory_app_permissions"
export const PERMISSIONS_UPDATED_EVENT = "findcategory_permissions_updated"

/**
 * 저장된 권한을 조회하고 없으면 기본 프리셋을 반환합니다.
 */
export function getStoredPermissions(isAdmin = false): AppPermissions {
  if (typeof window === "undefined") {
    return isAdmin ? ADMIN_FULL_PERMISSIONS : DEFAULT_PERMISSIONS
  }
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        finder: {
          allowTextInput: parsed.finder?.allowTextInput ?? true,
          allowDelete: parsed.finder?.allowDelete ?? (isAdmin ? true : false),
          allowFolderCreate: parsed.finder?.allowFolderCreate ?? true,
        },
        messages: {
          allowTextInput: parsed.messages?.allowTextInput ?? true,
          allowDelete: parsed.messages?.allowDelete ?? (isAdmin ? true : false),
          allowAttachment: parsed.messages?.allowAttachment ?? true,
        },
        safari: {
          allowProfileEdit: parsed.safari?.allowProfileEdit ?? true,
          allowExternalLinks: parsed.safari?.allowExternalLinks ?? true,
        },
        notes: {
          allowWrite: parsed.notes?.allowWrite ?? true,
          allowDelete: parsed.notes?.allowDelete ?? (isAdmin ? true : false),
        },
      }
    }
  } catch {}

  // 기본 권한 (요청 명세의 기본 프리셋 유지)
  return DEFAULT_PERMISSIONS
}

/**
 * 권한을 localStorage에 저장하고 시스템 전체에 실시간 이벤트를 전파합니다.
 */
export function savePermissions(permissions: AppPermissions): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions))
    window.dispatchEvent(
      new CustomEvent(PERMISSIONS_UPDATED_EVENT, {
        detail: permissions,
      })
    )
  } catch {}
}

