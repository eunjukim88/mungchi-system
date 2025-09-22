"use client"

import type React from "react"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Search, Filter, Upload, FileText, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

const workItems = [
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
  },
]

export default function WorkManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("전체")
  const [selectedWorkItem, setSelectedWorkItem] = useState<any>(null)
  const [isWorkInputDialogOpen, setIsWorkInputDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "대기중":
        return <Badge className="bg-muted-foreground text-background" variant="secondary">{status}</Badge>
      case "작업완료":
        return <Badge className="text-primary-foreground bg-primary">{status}</Badge>
      case "배송완료":
        return <Badge className="bg-green-600 text-white">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.styleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "전체" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-2xl font-bold text-foreground">작업 관리</h1>
            <p className="text-muted-foreground">작업 요청을 관리하고 진행 상황을 추적하세요</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>거래처명/스타일NO 검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="예: B파트너 또는 ST-001"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>진행 상태</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-border w-50">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("전체")
                    }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    초기화
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Items */}
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow bg-background">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-lg">{item.partnerName}</h3>
                      <Badge variant="outline">#{item.styleNo}</Badge>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">오더수량:</span>
                        <span className="ml-1 font-medium">{item.orderQuantity.toLocaleString()}개</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">입고일:</span>
                        <span className="ml-1 font-medium">{item.arrivalDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">등록일:</span>
                        <span className="ml-1 font-medium">{item.registrationDate}</span>
                      </div>
                    </div>

                    {item.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">첨부파일:</span>
                        {item.attachments.map((attachment, index) => (
                          <Button key={index} variant="link" size="sm" className="h-auto p-0 text-primary">
                            <FileText className="mr-1 h-3 w-3" />
                            {attachment}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleWorkInput(item)}
                    >
                      작업 입력
                    </Button>
                  </div>
                </div>
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

        <Dialog open={isWorkInputDialogOpen} onOpenChange={setIsWorkInputDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>작업 입력</DialogTitle>
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
    status: workItem.status,
    unitPrice: workItem.unitPrice || "",
    shipmentDate: workItem.shipmentDate ? new Date(workItem.shipmentDate) : undefined,
    workQuantity: workItem.workQuantity || "",
    dataFiles: [] as File[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Work input submitted:", formData)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, dataFiles: Array.from(e.target.files) })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div>
          <Label className="leading-8">진행상태</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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

        <div>
          <Label className="leading-8">단가</Label>
          <Input className="border-border"
            type="number"
            placeholder="단가를 입력하세요"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
          />
        </div>

        <div>
          <Label className="leading-8">출고일</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.shipmentDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.shipmentDate ? format(formData.shipmentDate, "yyyy-MM-dd", { locale: ko }) : "출고일 선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.shipmentDate}
                onSelect={(date) => setFormData({ ...formData, shipmentDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="leading-8">작업수량</Label>
          <Input className="border-border"
            type="number"
            placeholder="작업수량을 입력하세요"
            value={formData.workQuantity}
            onChange={(e) => setFormData({ ...formData, workQuantity: e.target.value })}
          />
        </div>

        <div>
          <Label className="py-0 leading-7 my-0 mb-3">데이터 파일 첨부</Label>
          <Card className="py-px">
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center py-2.5">
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="data-file-upload"
                />
                <label htmlFor="data-file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">데이터 파일 선택</p>
                  <p className="text-sm text-muted-foreground mt-1">XLSX, XLS, CSV, PDF 파일을 업로드하세요</p>
                </label>
              </div>
              {formData.dataFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">선택된 파일:</p>
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
