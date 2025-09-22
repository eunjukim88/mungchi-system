"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Download, FileText, Paperclip } from "lucide-react"
import QuotePreviewDialog from "@/components/quote/QuotePreviewDialog"
import { downloadQuotesReactPdfPerPartner } from "@/lib/quoteReactPdf"
import * as XLSX from "xlsx"

const workStatusData = [
  {
    id: "ST-2024-001",
    partnerName: "B파트너",
    orderQuantity: 1213,
    receiveDate: "2025-09-10",
    registrationDate: "2025-09-08",
    workOrderFile: "작업지시서_001.pdf",
    unitPrice: 15000,
    shipDate: "2025-09-20",
    workQuantity: 1200,
    dataFile: "데이터_001.xlsx",
    status: "대기중",
  },
  {
    id: "ST-2024-002",
    partnerName: "A파트너",
    orderQuantity: 850,
    receiveDate: "2025-09-12",
    registrationDate: "2025-09-10",
    workOrderFile: "작업지시서_002.pdf",
    unitPrice: 18000,
    shipDate: "2025-09-22",
    workQuantity: 850,
    dataFile: "데이터_002.xlsx",
    status: "작업완료",
  },
  {
    id: "ST-2024-003",
    partnerName: "C파트너",
    orderQuantity: 2000,
    receiveDate: "2025-09-15",
    registrationDate: "2025-09-13",
    workOrderFile: "작업지시서_003.pdf",
    unitPrice: 12000,
    shipDate: "2025-09-25",
    workQuantity: 1980,
    dataFile: "데이터_003.xlsx",
    status: "배송완료",
  },
]

const partners = ["전체", "A파트너", "B파트너", "C파트너"]

export default function WorkStatusPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("전체")
  const [selectedPartner, setSelectedPartner] = useState("전체")
  const [filteredData, setFilteredData] = useState(workStatusData)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showQuotePreview, setShowQuotePreview] = useState(false)
  const [quoteData, setQuoteData] = useState<any[]>([])
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "우리회사",
    manager: "김담당",
    phone: "02-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    businessNumber: "123-45-67890",
    email: "contact@ourcompany.com",
  })

  useEffect(() => {
    const savedCompanyInfo = localStorage.getItem("companyInfo")
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo))
    }
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "대기중":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {status}
          </Badge>
        )
      case "작업완료":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
      case "배송완료":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleFilter = () => {
    let filtered = workStatusData

    if (selectedPartner !== "전체") {
      filtered = filtered.filter((item) => item.partnerName === selectedPartner)
    }

    setFilteredData(filtered)
  }

  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new()

    const excelData = filteredData.map((item, index) => ({
      번호: index + 1,
      거래처명: item.partnerName,
      오더수량: item.orderQuantity,
      입고일: item.receiveDate,
      등록일: item.registrationDate,
      작업지시서: item.workOrderFile,
      단가: item.unitPrice,
      출고일: item.shipDate,
      작업수량: item.workQuantity,
      데이터파일: item.dataFile,
      진행상태: item.status,
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)

    const colWidths = [
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
    ]
    ws["!cols"] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, "작업현황")

    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    const filename = `작업현황_${dateStr}.xlsx`

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], { type: "application/octet-stream" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleGenerateQuote = () => {
    const selectedData = filteredData.filter((item) => selectedItems.includes(item.id))

    if (selectedData.length === 0) {
      alert("견적서를 생성할 항목을 선택해주세요.")
      return
    }

    const groupedByPartner = selectedData.reduce(
      (acc, item) => {
        if (!acc[item.partnerName]) {
          acc[item.partnerName] = []
        }
        acc[item.partnerName].push(item)
        return acc
      },
      {} as Record<string, typeof selectedData>,
    )

    const quotes = Object.entries(groupedByPartner).map(([partnerName, items]) => {
      const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.workQuantity, 0)
      const tax = Math.floor(totalAmount * 0.1)
      const finalAmount = totalAmount + tax

      return {
        partnerName,
        items: items.map((item, index) => ({
          no: index + 1,
          productName: item.id,
          quantity: item.workQuantity,
          unitPrice: item.unitPrice,
          amount: item.unitPrice * item.workQuantity,
          note: "",
        })),
        totalAmount,
        tax,
        finalAmount,
        date: new Date().toLocaleDateString("ko-KR"),
        companyInfo,
      }
    })

    setQuoteData(quotes)
    setShowQuotePreview(true)
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">작업 현황 리스트</h1>
            <p className="text-muted-foreground">기간별, 거래처별 작업 현황을 표 형태로 확인하세요</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExcelDownload}>
              <Download className="mr-2 h-4 w-4" />
              엑셀 다운로드
            </Button>
            <Button
              onClick={handleGenerateQuote}
              disabled={selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              견적서 출력
            </Button>
          </div>
        </div>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작일</label>
                <Input
                  className="border-border"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">종료일</label>
                <Input
                  className="border-border"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">월별 선택</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="border-border w-50">
                    <SelectValue placeholder="월 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="2025-01">2025년 1월</SelectItem>
                    <SelectItem value="2025-02">2025년 2월</SelectItem>
                    <SelectItem value="2025-03">2025년 3월</SelectItem>
                    <SelectItem value="2025-04">2025년 4월</SelectItem>
                    <SelectItem value="2025-05">2025년 5월</SelectItem>
                    <SelectItem value="2025-06">2025년 6월</SelectItem>
                    <SelectItem value="2025-07">2025년 7월</SelectItem>
                    <SelectItem value="2025-08">2025년 8월</SelectItem>
                    <SelectItem value="2025-09">2025년 9월</SelectItem>
                    <SelectItem value="2025-10">2025년 10월</SelectItem>
                    <SelectItem value="2025-11">2025년 11월</SelectItem>
                    <SelectItem value="2025-12">2025년 12월</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">거래처</label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="border-border w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner} value={partner}>
                        {partner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">필터</label>
                <Button onClick={handleFilter} className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  조회
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">초기화</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                    setSelectedMonth("전체")
                    setSelectedPartner("전체")
                    setFilteredData(workStatusData)
                    setSelectedItems([])
                  }}
                  className="w-full"
                >
                  초기화
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background text-center">
          <CardHeader>
            <CardTitle className="text-lg text-left">작업 현황 ({filteredData.length}건)</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="overflow-x-auto">
              <Table className="text-center">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-2 border-gray-400 data-[state=unchecked]:border-gray-400"
                      />
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">거래처명</TableHead>
                    <TableHead className="min-w-[80px] text-center">오더수량</TableHead>
                    <TableHead className="min-w-[100px] text-center">입고일</TableHead>
                    <TableHead className="min-w-[120px] text-center">작업지시서</TableHead>
                    <TableHead className="min-w-[80px] text-center">단가</TableHead>
                    <TableHead className="min-w-[100px] text-center">출고일</TableHead>
                    <TableHead className="min-w-[80px] text-center">작업수량</TableHead>
                    <TableHead className="min-w-[120px] text-center">데이터파일</TableHead>
                    <TableHead className="min-w-[100px] text-center">진행상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          className="border-2 border-gray-400 data-[state=unchecked]:border-gray-400"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        <div className="space-y-1">
                          <div>{item.partnerName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{item.orderQuantity.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">{item.receiveDate}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs border">
                          다운로드
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">₩{item.unitPrice.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">{item.shipDate}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium">{item.workQuantity.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs border">
                          다운로드
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <QuotePreviewDialog
          open={showQuotePreview}
          onOpenChange={setShowQuotePreview}
          quotes={quoteData as any}
          onDownload={() => downloadQuotesReactPdfPerPartner(quoteData as any, "견적서")}
        />
      </div>
    </AdminLayout>
  )
}
