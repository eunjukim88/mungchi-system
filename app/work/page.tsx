"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Filter, Upload, FileText, Paperclip } from "lucide-react"

type WorkItem = {
  id: string
  partnerName: string
  styleNo: string
  orderQuantity: number
  arrivalDate: string
  registrationDate: string
  status: string
  attachments: string[]
  unitPrice: number | null
  shipmentDate: string | null
  workQuantity: number | null
  dataFiles: string[]
  memo: string
  imageFiles: string[]
}

const workItems: WorkItem[] = [
  {
    id: "ST-2024-001",
    partnerName: "B파트너",
    styleNo: "ST-001",
    orderQuantity: 1213,
    arrivalDate: "2025-09-13",
    registrationDate: "2025-09-10",
    status: "대기중",
    attachments: ["작업지시서.pdf"],
    // Work input data (initially empty)
    unitPrice: null,
    shipmentDate: null,
    workQuantity: null,
    dataFiles: [],
    memo: "",
    imageFiles: [],
  },
  {
    id: "ST-2024-002",
    partnerName: "A파트너",
    styleNo: "ST-002",
    orderQuantity: 850,
    arrivalDate: "2025-09-15",
    registrationDate: "2025-09-12",
    status: "작업완료",
    attachments: ["design_spec.pdf"],
    unitPrice: 15000,
    shipmentDate: "2025-09-20",
    workQuantity: 850,
    dataFiles: ["data_file.xlsx"],
    memo: "",
    imageFiles: [],
  },
  {
    id: "ST-2024-003",
    partnerName: "C파트너",
    styleNo: "ST-003",
    orderQuantity: 500,
    arrivalDate: "2025-09-08",
    registrationDate: "2025-09-05",
    status: "배송완료",
    attachments: ["spec.pdf"],
    unitPrice: 12000,
    shipmentDate: "2025-09-18",
    workQuantity: 500,
    dataFiles: ["final_data.xlsx"],
    memo: "",
    imageFiles: [],
  },
]

const partnerOptions = Array.from(new Set(workItems.map((item) => item.partnerName)))

export default function WorkManagementPage() {
  const [statusFilter, setStatusFilter] = useState("전체")
  const [partnerFilter, setPartnerFilter] = useState("전체")
  const [selectedWorkItem, setSelectedWorkItem] = useState<any>(null)
  const [isWorkInputDialogOpen, setIsWorkInputDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

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

  const filteredItems = workItems.filter((item) => {
    const matchesStatus = statusFilter === "전체" || item.status === statusFilter
    const matchesPartner = partnerFilter === "전체" || item.partnerName === partnerFilter
    return matchesStatus && matchesPartner
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, partnerFilter])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const handleWorkInput = (item: any) => {
    setSelectedWorkItem(item)
    setIsWorkInputDialogOpen(true)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">영업 관리</h1>
            <p className="text-muted-foreground">영업 관련 요청을 관리하고 진행 상황을 추적하세요</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <Label className="md:whitespace-nowrap">거래처 필터</Label>
                <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                  <SelectTrigger className="border-border md:min-w-[200px]">
                    <SelectValue placeholder="거래처를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    {partnerOptions.map((partner) => (
                      <SelectItem key={partner} value={partner}>
                        {partner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <Label className="md:whitespace-nowrap">진행 상태</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-border md:min-w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="대기중">대기중</SelectItem>
                    <SelectItem value="작업완료">작업완료</SelectItem>
                    <SelectItem value="배송완료">배송완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setStatusFilter("전체")
                    setPartnerFilter("전체")
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  초기화
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Items */}
        <div className="grid gap-6 md:grid-cols-3">
          {paginatedItems.map((item) => (
            <Card
              key={item.id}
              className="rounded-3xl border border-muted-foreground/20 bg-background shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.partnerName}</h3>
                    <Badge variant="outline" className="mt-1">#{item.styleNo}</Badge>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">등록일</span>
                    <span className="font-medium">{item.registrationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">입고일</span>
                    <span className="font-medium">{item.arrivalDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">오더수량</span>
                    <span className="font-medium">{item.orderQuantity.toLocaleString()}개</span>
                  </div>
                  {item.attachments.length > 0 && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">첨부파일</span>
                      <div className="flex flex-col items-end gap-1">
                        {item.attachments.map((attachment: string, index: number) => (
                          <Button key={index} variant="link" size="sm" className="h-auto p-0 text-primary">
                            <FileText className="mr-1 h-3 w-3" />
                            {attachment}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleWorkInput(item)}
                >
                  정보 입력
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">검색 조건에 맞는 작업이 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {filteredItems.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              다음
            </Button>
          </div>
        )}

        <Dialog open={isWorkInputDialogOpen} onOpenChange={setIsWorkInputDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>정보 입력</DialogTitle>
              <DialogDescription className="text-sidebar">
                {selectedWorkItem && `${selectedWorkItem.partnerName} - ${selectedWorkItem.styleNo}`}
              </DialogDescription>
            </DialogHeader>
            {selectedWorkItem && (
              <WorkInputForm workItem={selectedWorkItem} onClose={() => setIsWorkInputDialogOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

function WorkInputForm({ workItem, onClose }: { workItem: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    status: workItem.status || "대기중",
    unitPrice: workItem.unitPrice || "",
    memo: workItem.memo || "",
    imageFiles: [] as File[],
    dataFiles: [] as File[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Work input submitted:", formData)
    onClose()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setFormData((prev) => ({
      ...prev,
      imageFiles: files,
    }))
  }

  const handleDataFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setFormData((prev) => ({
      ...prev,
      dataFiles: files,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="leading-8">진행 상태</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="대기중">대기중</SelectItem>
              <SelectItem value="작업완료">작업완료</SelectItem>
              <SelectItem value="배송완료">배송완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="leading-8">단가</Label>
          <Input
            className="border-border"
            type="number"
            placeholder="단가를 입력하세요"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="py-0 leading-7 my-0">이미지 첨부</Label>
          <Card className="py-px">
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center py-2.5">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-file-upload"
                />
                <label htmlFor="image-file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">이미지 파일 선택</p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG, JPEG, GIF 파일을 업로드하세요</p>
                </label>
              </div>
              {formData.imageFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">선택된 이미지:</p>
                  {formData.imageFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Paperclip className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label className="leading-8">메모</Label>
          <Textarea
            className="border-border"
            placeholder="추가 메모를 입력하세요"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label className="py-0 leading-7 my-0">데이터 파일 첨부 (.dst)</Label>
          <Card className="py-px">
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center py-2.5">
                <input
                  type="file"
                  multiple
                  accept=".dst"
                  onChange={handleDataFileChange}
                  className="hidden"
                  id="data-file-upload"
                />
                <label htmlFor="data-file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">데이터 파일 선택</p>
                  <p className="text-sm text-muted-foreground mt-1">DST 확장자 파일만 업로드할 수 있습니다</p>
                </label>
              </div>
              {formData.dataFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">선택된 데이터 파일:</p>
                  {formData.dataFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Paperclip className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          취소
        </Button>
        <Button type="submit" className="flex-1">
          저장
        </Button>
      </div>
    </form>
  )
}
