export const PARTNERS_STORAGE_KEY = "partners"

export type PartnerRecord = {
  id: string
  name: string
  contactPerson: string
  phone: string
  uniqueId: string
  createdAt: string
  registrationNumber: string
  businessAddress: string
  representativeName: string
  email: string
}

export const DEFAULT_PARTNERS: PartnerRecord[] = [
  {
    id: "1",
    name: "B파트너",
    contactPerson: "이파트",
    phone: "010-7777-7777",
    uniqueId: "bpartner-001",
    createdAt: "2025-09-13",
    registrationNumber: "123-45-67890",
    businessAddress: "서울특별시 강남구 테헤란로 123",
    representativeName: "홍길동",
    email: "contact@bpartner.co.kr",
  },
  {
    id: "2",
    name: "A파트너",
    contactPerson: "김파트",
    phone: "010-7172-9698",
    uniqueId: "apartner-002",
    createdAt: "2025-09-12",
    registrationNumber: "234-56-78901",
    businessAddress: "서울특별시 서초구 서초대로 456",
    representativeName: "김대표",
    email: "info@apartner.co.kr",
  },
  {
    id: "3",
    name: "C파트너",
    contactPerson: "박파트",
    phone: "010-8888-9999",
    uniqueId: "cpartner-003",
    createdAt: "2025-09-11",
    registrationNumber: "345-67-89012",
    businessAddress: "경기도 성남시 분당구 판교로 789",
    representativeName: "이대표",
    email: "sales@cpartner.co.kr",
  },
]

const ensurePartnerRecord = (raw: any, index: number): PartnerRecord => {
  const fallback = DEFAULT_PARTNERS[index % DEFAULT_PARTNERS.length]
  const safeName = typeof raw?.name === "string" && raw.name.trim() ? raw.name.trim() : fallback.name
  const uniqueBase = safeName.toLowerCase().replace(/\s+/g, "") || `partner-${Date.now()}`
  return {
    id: typeof raw?.id === "string" && raw.id.trim() ? raw.id : `${Date.now()}-${index}`,
    name: safeName,
    contactPerson:
      typeof raw?.contactPerson === "string" && raw.contactPerson.trim()
        ? raw.contactPerson.trim()
        : fallback.contactPerson,
    phone: typeof raw?.phone === "string" && raw.phone.trim() ? raw.phone.trim() : fallback.phone,
    uniqueId:
      typeof raw?.uniqueId === "string" && raw.uniqueId.trim()
        ? raw.uniqueId.trim()
        : `${uniqueBase}-${index}`,
    createdAt:
      typeof raw?.createdAt === "string" && raw.createdAt.trim()
        ? raw.createdAt.trim()
        : fallback.createdAt,
    registrationNumber:
      typeof raw?.registrationNumber === "string" && raw.registrationNumber.trim()
        ? raw.registrationNumber.trim()
        : typeof raw?.businessNumber === "string" && raw.businessNumber.trim()
          ? raw.businessNumber.trim()
          : fallback.registrationNumber,
    businessAddress:
      typeof raw?.businessAddress === "string" && raw.businessAddress.trim()
        ? raw.businessAddress.trim()
        : typeof raw?.address === "string" && raw.address.trim()
          ? raw.address.trim()
          : fallback.businessAddress,
    representativeName:
      typeof raw?.representativeName === "string" && raw.representativeName.trim()
        ? raw.representativeName.trim()
        : fallback.representativeName,
    email: typeof raw?.email === "string" && raw.email.trim() ? raw.email.trim() : fallback.email,
  }
}

export function loadPartners(): PartnerRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_PARTNERS
  }

  const stored = window.localStorage.getItem(PARTNERS_STORAGE_KEY)
  if (!stored) {
    return DEFAULT_PARTNERS
  }

  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ensurePartnerRecord(item, index))
    }
  } catch (error) {
    console.warn("Failed to parse stored partners:", error)
  }

  return DEFAULT_PARTNERS
}

export function savePartners(partners: PartnerRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(partners))
}

export function partnersToMap(partners: PartnerRecord[]): Record<string, PartnerRecord> {
  return partners.reduce<Record<string, PartnerRecord>>((acc, partner) => {
    acc[partner.name] = partner
    return acc
  }, {})
}
