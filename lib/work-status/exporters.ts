import * as XLSX from "xlsx"
import type { PartnerRecord } from "@/lib/partners/storage"
import type { CompanyInfo } from "@/lib/settings/storage"

export type WorkStatusRecord = {
  id: string
  partnerName: string
  styleNo: string
  imageUrl: string
  orderQuantity: number
  receiveDate: string
  workOrderFile: string
  unitPrice: number
  expectedShipDate: string
  shipDate: string
  workQuantity: number
  dataFile: string
  status: string
  designMemo?: string
  salesMemo?: string
}

export type TransactionStatementItem = {
  no: number
  productName: string
  quantity: number
  unitPrice: number
  amount: number
  note: string
}

export type BuyerInfo = {
  name: string
  registrationNumber: string
  businessAddress: string
  contactPerson: string
  phone: string
}

export type TransactionStatement = {
  buyer: BuyerInfo
  supplier: CompanyInfo
  items: TransactionStatementItem[]
  totalAmount: number
  tax: number
  finalAmount: number
  date: string
}

const excelColumnWidths = [
  { wch: 8 },
  { wch: 18 },
  { wch: 14 },
  { wch: 12 },
  { wch: 12 },
  { wch: 20 },
  { wch: 14 },
  { wch: 12 },
  { wch: 12 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
]

export function downloadWorkStatusExcel(records: WorkStatusRecord[], fileName?: string) {
  const workbook = XLSX.utils.book_new()

  const sheetData = records.map((item, index) => ({
    번호: index + 1,
    거래처명: item.partnerName,
    스타일넘버: item.styleNo,
    오더수량: item.orderQuantity,
    입고일: item.receiveDate,
    작업지시서: item.workOrderFile,
    단가: item.unitPrice,
    예상출고일: item.expectedShipDate,
    출고일: item.shipDate,
    작업수량: item.workQuantity,
    데이터파일: item.dataFile,
    진행상태: item.status,
    디자인팀메모: item.designMemo ?? "",
    영업관리메모: item.salesMemo ?? "",
  }))

  const worksheet = XLSX.utils.json_to_sheet(sheetData)
  worksheet["!cols"] = excelColumnWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, "작업현황")

  const resolvedFileName = fileName || `작업현황_${new Date().toISOString().split("T")[0]}.xlsx`
  const workbookBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([workbookBuffer], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = resolvedFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function buildTransactionStatementsByPartner(
  records: WorkStatusRecord[],
  supplier: CompanyInfo,
  partnerMap: Record<string, PartnerRecord>,
): TransactionStatement[] {
  const grouped = records.reduce<Record<string, WorkStatusRecord[]>>((acc, record) => {
    if (!acc[record.partnerName]) {
      acc[record.partnerName] = []
    }
    acc[record.partnerName].push(record)
    return acc
  }, {})

  const createBuyerInfo = (partnerName: string): BuyerInfo => {
    const partner = partnerMap[partnerName]
    if (!partner) {
      return {
        name: partnerName,
        registrationNumber: "",
        businessAddress: "",
        contactPerson: "",
        phone: "",
      }
    }

    return {
      name: partner.name,
      registrationNumber: partner.registrationNumber,
      businessAddress: partner.businessAddress,
      contactPerson: partner.contactPerson,
      phone: partner.phone,
    }
  }

  return Object.entries(grouped).map(([partnerName, items]) => {
    const statementItems = items.map<TransactionStatementItem>((item, index) => {
      const amount = item.unitPrice * item.workQuantity
      return {
        no: index + 1,
        productName: item.styleNo || item.id,
        quantity: item.workQuantity,
        unitPrice: item.unitPrice,
        amount,
        note: "",
      }
    })

    const totalAmount = statementItems.reduce((sum, item) => sum + item.amount, 0)
    const tax = Math.floor(totalAmount * 0.1)
    const finalAmount = totalAmount + tax

    return {
      buyer: createBuyerInfo(partnerName),
      supplier,
      items: statementItems,
      totalAmount,
      tax,
      finalAmount,
      date: new Date().toLocaleDateString("ko-KR"),
    }
  })
}
