"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "lucide-react"
import QuotePreviewDialog from "@/components/quote/QuotePreviewDialog"
import { downloadTransactionStatementsReactPdfPerPartner } from "@/lib/quoteReactPdf"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageCaptureButton } from "@/components/work-status/image-capture-button"
import { WorkStatusCaptureItem, WorkStatusCaptureView } from "@/components/work-status/capture-view"
import { WorkStatusActionToolbar } from "@/components/work-status/action-toolbar"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status/StatusBadge"
import {
  buildTransactionStatementsByPartner,
  downloadWorkStatusExcel,
  TransactionStatement,
  WorkStatusRecord,
} from "@/lib/work-status/exporters"
import { CompanyInfo, loadCompanyInfo } from "@/lib/settings/storage"
import { loadPartners, PartnerRecord, partnersToMap } from "@/lib/partners/storage"

const workStatusData: WorkStatusRecord[] = [
  {
    id: "ST-2024-001",
    partnerName: "B파트너",
    styleNo: "ST-001",
    imageUrl: "/Screenshot_1.png",
    orderQuantity: 1213,
    receiveDate: "2025-09-13",
    workOrderFile: "작업지시서_001.pdf",
    unitPrice: 15000,
    expectedShipDate: "2025-09-18",
    shipDate: "2025-09-20",
    workQuantity: 1200,
    dataFile: "데이터_001.xlsx",
    status: "대기중",
    designMemo: "샘플 모자 색상 보정 필요. 9/18 오전까지 수정안 공유 예정이며 추가 시안 확인 요청.",
    salesMemo: "거래처 긴급 요청으로 출고 일정 재확인 필요. 9/16 14시에 회신 예정.",
  },
  {
    id: "ST-2024-002",
    partnerName: "A파트너",
    styleNo: "ST-104",
    imageUrl: "/Screenshot_1.png",
    orderQuantity: 850,
    receiveDate: "2025-09-10",
    workOrderFile: "작업지시서_002.pdf",
    unitPrice: 18000,
    expectedShipDate: "2025-09-19",
    shipDate: "2025-09-22",
    workQuantity: 850,
    dataFile: "데이터_002.xlsx",
    status: "작업중",
    designMemo: "패턴 수정 완료. 박음질 라인 두께를 1mm 줄여 재시안 전달 완료.",
    salesMemo: "출고 일정 확정 대기 중. 파트너 측 검수 결과를 9/17까지 받아야 함.",
  },
  {
    id: "ST-2024-003",
    partnerName: "C파트너",
    styleNo: "ST-220",
    imageUrl: "/Screenshot_1.png",
    orderQuantity: 2000,
    receiveDate: "2025-09-08",
    workOrderFile: "작업지시서_003.pdf",
    unitPrice: 12000,
    expectedShipDate: "2025-09-14",
    shipDate: "2025-09-25",
    workQuantity: 1980,
    dataFile: "데이터_003.xlsx",
    status: "후가공중",
    designMemo: "완제품 1차 검수 완료. 금속 장식 고정 상태 우수, 추가 수정 없음.",
    salesMemo: "고객 전달 완료. 9/22 AS 요청 가능성 있어 사후 모니터링 중.",
  },
  {
    id: "ST-2024-004",
    partnerName: "D파트너",
    styleNo: "ST-221",
    imageUrl: "/Screenshot_1.png",
    orderQuantity: 2000,
    receiveDate: "2025-09-08",
    workOrderFile: "작업지시서_003.pdf",
    unitPrice: 12000,
    expectedShipDate: "2025-09-14",
    shipDate: "2025-09-25",
    workQuantity: 1980,
    dataFile: "데이터_003.xlsx",
    status: "배송완료",
    designMemo: "완제품 1차 검수 완료. 금속 장식 고정 상태 우수, 추가 수정 없음.",
    salesMemo: "고객 전달 완료. 9/22 AS 요청 가능성 있어 사후 모니터링 중.",
  }
]

const partners = ["전체", "A파트너", "B파트너", "C파트너", "D파트너"]
const statusOptions = ["전체", "대기중", "작업중", "후가공중", "배송완료"]
const recordStatusOptions = statusOptions.filter((status) => status !== "전체")

export default function WorkStatusPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("전체")
  const [selectedPartner, setSelectedPartner] = useState("전체")
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [records, setRecords] = useState<WorkStatusRecord[]>(workStatusData)
  const [filteredData, setFilteredData] = useState<WorkStatusRecord[]>(workStatusData)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showStatementPreview, setShowStatementPreview] = useState(false)
  const [statementData, setStatementData] = useState<TransactionStatement[]>([])
  const captureViewRef = useRef<HTMLDivElement>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => loadCompanyInfo())
  const [partnersState, setPartnersState] = useState<PartnerRecord[]>(() => loadPartners())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkStatusRecord | null>(null)
  const [editForm, setEditForm] = useState({
    partnerName: "",
    styleNo: "",
    orderQuantity: "",
    receiveDate: "",
    status: recordStatusOptions[0],
    expectedShipDate: "",
    shipDate: "",
    workQuantity: "",
    unitPrice: "",
    designMemo: "",
    salesMemo: "",
  })
  const [previewImage, setPreviewImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const partnerMap = useMemo(() => partnersToMap(partnersState), [partnersState])

  useEffect(() => {
    setCompanyInfo(loadCompanyInfo())
    setPartnersState(loadPartners())
  }, [])

  const applyFilters = (source: WorkStatusRecord[] = records) => {
    let filtered = source

    if (selectedPartner !== "전체") {
      filtered = filtered.filter((item) => item.partnerName === selectedPartner)
    }

    if (selectedStatus !== "전체") {
      filtered = filtered.filter((item) => item.status === selectedStatus)
    }

    setFilteredData(filtered)
  }

  const handleFilter = () => {
    applyFilters()
  }

  const handleFileDownload = (fileName: string) => {
    // 실제 다운로드는 추후 API 연동 시 구현
    const blob = new Blob([`파일 다운로드: ${fileName}`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExcelDownload = () => {
    downloadWorkStatusExcel(filteredData as WorkStatusRecord[])
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

  const handleGenerateStatement = () => {
    const selectedData = filteredData.filter((item) => selectedItems.includes(item.id))

    if (selectedData.length === 0) {
      alert("거래명세서를 생성할 항목을 선택해주세요.")
      return
    }

    const statements = buildTransactionStatementsByPartner(
      selectedData as WorkStatusRecord[],
      companyInfo,
      partnerMap,
    )

    setStatementData(statements)
    setShowStatementPreview(true)
  }

  const captureFileName = (() => {
    const today = new Date().toISOString().split("T")[0]
    const partnerPart = selectedPartner !== "전체" ? `${selectedPartner}_` : "전체_"
    const statusPart = selectedStatus !== "전체" ? `${selectedStatus}_` : ""
    return `작업현황_${partnerPart}${statusPart}${today}.png`
  })()

  const captureData: WorkStatusCaptureItem[] = filteredData.map((item) => ({
    id: item.id,
    partnerName: item.partnerName,
    styleNo: item.styleNo,
    imageUrl: item.imageUrl,
    orderQuantity: item.orderQuantity,
    receiveDate: item.receiveDate,
    expectedShipDate: item.expectedShipDate,
    status: item.status,
    designMemo: item.designMemo,
    workQuantity: item.workQuantity,
    shipDate: item.shipDate,
    salesMemo: item.salesMemo,
  }))

  const filterSummary = {
    partner: selectedPartner,
    status: selectedStatus,
    period:
      startDate && endDate
        ? `${startDate} ~ ${endDate}`
        : selectedMonth !== "전체"
          ? `${selectedMonth}월`
          : "전체 기간",
  }
  
  const openEditDialog = (item: WorkStatusRecord) => {
    setEditingItem(item)
    setEditForm({
      partnerName: item.partnerName,
      styleNo: item.styleNo,
      orderQuantity: String(item.orderQuantity ?? ""),
      receiveDate: item.receiveDate ?? "",
      status: item.status,
      expectedShipDate: item.expectedShipDate ?? "",
      shipDate: item.shipDate ?? "",
      workQuantity: item.workQuantity !== null && item.workQuantity !== undefined ? String(item.workQuantity) : "",
      unitPrice: item.unitPrice !== null && item.unitPrice !== undefined ? String(item.unitPrice) : "",
      designMemo: item.designMemo ?? "",
      salesMemo: item.salesMemo ?? "",
    })
    setPreviewImage(item.imageUrl)
    setIsEditDialogOpen(true)
  }

  const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingItem(null)
    setEditForm({
      partnerName: "",
      styleNo: "",
      orderQuantity: "",
      receiveDate: "",
      status: recordStatusOptions[0],
      expectedShipDate: "",
      shipDate: "",
      workQuantity: "",
      unitPrice: "",
      designMemo: "",
      salesMemo: "",
    })
    setPreviewImage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingItem) return

    if (!editForm.partnerName.trim()) {
      alert("거래처명을 입력해주세요.")
      return
    }

    if (!editForm.styleNo.trim()) {
      alert("스타일넘버를 입력해주세요.")
      return
    }

    if (!editForm.orderQuantity.trim()) {
      alert("오더수량을 입력해주세요.")
      return
    }

    if (!editForm.receiveDate.trim()) {
      alert("입고일을 선택해주세요.")
      return
    }

    const parsedUnitPrice = editForm.unitPrice.trim() === "" ? editingItem.unitPrice : Number(editForm.unitPrice)
    const parsedWorkQuantity =
      editForm.workQuantity.trim() === "" ? editingItem.workQuantity : Number(editForm.workQuantity)
    const parsedOrderQuantity =
      editForm.orderQuantity.trim() === "" ? editingItem.orderQuantity : Number(editForm.orderQuantity)

    const updatedRecords = records.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            imageUrl: previewImage || item.imageUrl,
            partnerName: editForm.partnerName,
            styleNo: editForm.styleNo,
            orderQuantity: parsedOrderQuantity,
            receiveDate: editForm.receiveDate,
            status: editForm.status,
            expectedShipDate: editForm.expectedShipDate,
            shipDate: editForm.shipDate,
            workQuantity: parsedWorkQuantity,
            unitPrice: parsedUnitPrice,
            designMemo: editForm.designMemo,
            salesMemo: editForm.salesMemo,
          }
        : item,
    )

    setRecords(updatedRecords)
    applyFilters(updatedRecords)
    closeEditDialog()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">작업 현황 리스트</h1>
            <p className="text-muted-foreground">기간별, 거래처별 작업 현황을 표 형태로 확인하세요</p>
          </div>
          <WorkStatusActionToolbar
            onDownloadExcel={handleExcelDownload}
            onGenerateQuote={handleGenerateStatement}
            captureButton={<ImageCaptureButton targetRef={captureViewRef} fileName={captureFileName} />}
            isQuoteDisabled={selectedItems.length === 0}
          />
        </div>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-7">
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
                <label className="text-sm font-medium">진행 상태</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="border-border w-50">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
                    setSelectedStatus("전체")
                    setFilteredData(records)
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
                    <TableHead className="min-w-[120px] text-center">이미지</TableHead>
                    <TableHead className="min-w-[120px] text-center">거래처명</TableHead>
                    <TableHead className="min-w-[100px] text-center">스타일넘버</TableHead>
                    <TableHead className="min-w-[100px] text-center">오더수량</TableHead>
                    <TableHead className="min-w-[110px] text-center">입고일</TableHead>
                    <TableHead className="min-w-[120px] text-center">예상출고일</TableHead>
                    <TableHead className="min-w-[110px] text-center">진행상태</TableHead>
                    <TableHead className="min-w-[140px] text-center">디자인팀 메모</TableHead>
                    <TableHead className="min-w-[100px] text-center">작업수량</TableHead>
                    <TableHead className="min-w-[110px] text-center">출고일</TableHead>
                    <TableHead className="min-w-[140px] text-center">영업관리 메모</TableHead>
                    <TableHead className="min-w-[150px] text-center">작업지시서</TableHead>
                    <TableHead className="min-w-[150px] text-center">데이터 파일</TableHead>
                    <TableHead className="min-w-[100px] text-center">관리</TableHead>
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
                      <TableCell className="text-center">
                        <img
                          src={item.imageUrl}
                          alt={`${item.partnerName} 이미지`}
                          className="mx-auto h-16 w-16 rounded-lg object-cover border"
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium">{item.partnerName}</TableCell>
                      <TableCell className="text-center text-sm">{item.styleNo}</TableCell>
                      <TableCell className="text-center font-medium">{item.orderQuantity.toLocaleString()}개</TableCell>
                      <TableCell className="text-center text-sm">{item.receiveDate}</TableCell>
                      <TableCell className="text-center text-sm">{item.expectedShipDate}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="text-sm">
                              메모 보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{`${item.partnerName} / ${item.styleNo} 디자인팀 메모`}</DialogTitle>
                              <DialogDescription>상세 메모 내용을 확인하세요.</DialogDescription>
                            </DialogHeader>
                            <div className="rounded-lg border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                              {item.designMemo || "등록된 메모가 없습니다."}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center font-medium">{item.workQuantity.toLocaleString()}개</TableCell>
                      <TableCell className="text-center text-sm">{item.shipDate}</TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="text-sm">
                              메모 보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{`${item.partnerName} / ${item.styleNo} 영업 메모`}</DialogTitle>
                              <DialogDescription>상세 메모 내용을 확인하세요.</DialogDescription>
                            </DialogHeader>
                            <div className="rounded-lg border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                              {item.salesMemo || "등록된 메모가 없습니다."}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => handleFileDownload(item.workOrderFile)}
                          aria-label={`${item.workOrderFile} 다운로드`}
                          title={item.workOrderFile}
                        >
                          다운로드
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => handleFileDownload(item.dataFile)}
                          aria-label={`${item.dataFile} 다운로드`}
                          title={item.dataFile}
                        >
                          다운로드
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => openEditDialog(item)}
                        >
                          수정
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeEditDialog()
            } else {
              setIsEditDialogOpen(true)
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>작업 현황 수정</DialogTitle>
              <DialogDescription>선택한 작업의 진행 정보와 메모를 업데이트하세요.</DialogDescription>
            </DialogHeader>
            {editingItem && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-medium">이미지</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-md border border-dashed border-border bg-muted">
                        {previewImage ? (
                          <img src={previewImage} alt="미리보기" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            미리보기 없음
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              const objectUrl = URL.createObjectURL(file)
                              setPreviewImage(objectUrl)
                            }
                          }}
                          className="border-border"
                        />
                        <p className="text-xs text-muted-foreground">* 파일을 선택하면 기존 이미지를 대체합니다.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">거래처명</Label>
                    <Input
                      value={editForm.partnerName}
                      onChange={(event) => handleEditFormChange("partnerName", event.target.value)}
                      className="border-border"
                      placeholder="거래처명을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">스타일넘버</Label>
                    <Input
                      value={editForm.styleNo}
                      onChange={(event) => handleEditFormChange("styleNo", event.target.value)}
                      className="border-border"
                      placeholder="스타일넘버를 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">오더수량</Label>
                    <Input
                      type="number"
                      value={editForm.orderQuantity}
                      onChange={(event) => handleEditFormChange("orderQuantity", event.target.value)}
                      className="border-border"
                      placeholder="오더수량을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">입고일</Label>
                    <Input
                      type="date"
                      value={editForm.receiveDate}
                      onChange={(event) => handleEditFormChange("receiveDate", event.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">진행 상태</Label>
                    <Select value={editForm.status} onValueChange={(value) => handleEditFormChange("status", value)}>
                      <SelectTrigger className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recordStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">단가</Label>
                    <Input
                      type="number"
                      value={editForm.unitPrice}
                      onChange={(event) => handleEditFormChange("unitPrice", event.target.value)}
                      className="border-border"
                      placeholder="단가를 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">예상 출고일</Label>
                    <Input
                      type="date"
                      value={editForm.expectedShipDate}
                      onChange={(event) => handleEditFormChange("expectedShipDate", event.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">출고일</Label>
                    <Input
                      type="date"
                      value={editForm.shipDate}
                      onChange={(event) => handleEditFormChange("shipDate", event.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">작업 수량</Label>
                    <Input
                      type="number"
                      value={editForm.workQuantity}
                      onChange={(event) => handleEditFormChange("workQuantity", event.target.value)}
                      className="border-border"
                      placeholder="작업 수량을 입력하세요"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">디자인팀 메모</Label>
                  <Textarea
                    value={editForm.designMemo}
                    onChange={(event) => handleEditFormChange("designMemo", event.target.value)}
                    placeholder="디자인팀 메모를 입력하세요"
                    className="border-border"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">영업관리 메모</Label>
                  <Textarea
                    value={editForm.salesMemo}
                    onChange={(event) => handleEditFormChange("salesMemo", event.target.value)}
                    placeholder="영업관리 메모를 입력하세요"
                    className="border-border"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeEditDialog} className="bg-transparent">
                    취소
                  </Button>
                  <Button type="submit">저장</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <QuotePreviewDialog
          open={showStatementPreview}
          onOpenChange={setShowStatementPreview}
          statements={statementData}
          onDownload={() => downloadTransactionStatementsReactPdfPerPartner(statementData, "거래명세서")}
        />
      </div>
      <div className="pointer-events-none fixed left-[-2000px] top-0 -z-10 select-none opacity-0" aria-hidden>
        <WorkStatusCaptureView ref={captureViewRef} data={captureData} filterSummary={filterSummary} />
      </div>
    </AdminLayout>
  )
}
