export const COMPANY_INFO_STORAGE_KEY = "companyInfo"

export type CompanyInfo = {
  companyName: string
  registrationNumber: string
  businessAddress: string
  phone: string
  accountNumber: string
  sealImageDataUrl?: string
  representativeName?: string
  manager?: string
  email?: string
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  companyName: "우리회사",
  registrationNumber: "123-45-67890",
  businessAddress: "서울시 강남구 테헤란로 123",
  phone: "02-1234-5678",
  accountNumber: "국민은행 123456-01-123456",
  sealImageDataUrl: "/stamp.png",
  representativeName: "홍길동",
  manager: "김담당",
  email: "contact@ourcompany.com",
}

const ensureCompanyInfo = (raw: any): CompanyInfo => {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_COMPANY_INFO
  }

  const safeText = (value: unknown, fallback: string) => {
    return typeof value === "string" && value.trim() ? value.trim() : fallback
  }

  return {
    companyName: safeText(raw.companyName, DEFAULT_COMPANY_INFO.companyName),
    registrationNumber: safeText(
      raw.registrationNumber ?? raw.businessNumber,
      DEFAULT_COMPANY_INFO.registrationNumber,
    ),
    businessAddress: safeText(raw.businessAddress ?? raw.address, DEFAULT_COMPANY_INFO.businessAddress),
    phone: safeText(raw.phone ?? raw.companyPhone, DEFAULT_COMPANY_INFO.phone),
    accountNumber: safeText(raw.accountNumber, DEFAULT_COMPANY_INFO.accountNumber),
    sealImageDataUrl:
      typeof raw.sealImageDataUrl === "string" && raw.sealImageDataUrl.trim()
        ? raw.sealImageDataUrl.trim()
        : DEFAULT_COMPANY_INFO.sealImageDataUrl,
    representativeName: safeText(raw.representativeName ?? "", DEFAULT_COMPANY_INFO.representativeName ?? ""),
    manager: safeText(raw.manager ?? "", DEFAULT_COMPANY_INFO.manager ?? ""),
    email: safeText(raw.email ?? "", DEFAULT_COMPANY_INFO.email ?? ""),
  }
}

export function loadCompanyInfo(): CompanyInfo {
  if (typeof window === "undefined") {
    return DEFAULT_COMPANY_INFO
  }

  const stored = window.localStorage.getItem(COMPANY_INFO_STORAGE_KEY)
  if (!stored) {
    return DEFAULT_COMPANY_INFO
  }

  try {
    const parsed = JSON.parse(stored)
    return ensureCompanyInfo(parsed)
  } catch (error) {
    console.warn("Failed to parse stored company info:", error)
    return DEFAULT_COMPANY_INFO
  }
}

export function saveCompanyInfo(info: CompanyInfo) {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(COMPANY_INFO_STORAGE_KEY, JSON.stringify(info))
}
