"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status/StatusBadge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Filter, FileText, Paperclip, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { NumericKeypadInput } from "@/components/ui/numeric-keypad-input"

type ProductionItem = {
  id: string
  partnerName: string
  styleNo: string
  status: string
  arrivalDate: string
  orderQuantity: number
  workOrderFile: string
  salesImage: { name: string; url: string }
  workQuantity?: number | null
  plannedShipmentDate?: string | null
  shipmentDate?: string | null
  memo?: string
}

const initialProductionItems: ProductionItem[] = [
  {
    id: "PD-2024-001",
    partnerName: "B파트너",
    styleNo: "ST-001",
    status: "작업중",
    arrivalDate: "2025-09-13",
    orderQuantity: 1213,
    workOrderFile: "작업지시서_PD001.pdf",
    salesImage: { name: "영업 등록 이미지", url: "/Screenshot_1.png" },
    workQuantity: null,
    plannedShipmentDate: null,
    shipmentDate: null,
    memo: "긴급 대응 필요",
  },
  {
    id: "PD-2024-002",
    partnerName: "A파트너",
    styleNo: "ST-104",
    status: "후가공중",
    arrivalDate: "2025-09-10",
    orderQuantity: 850,
    workOrderFile: "작업지시서_PD002.pdf",
    salesImage: { name: "영업 등록 이미지", url: "/Screenshot_1.png" },
    workQuantity: 850,
    plannedShipmentDate: "2025-09-18",
    shipmentDate: null,
    memo: "",
  },
  {
    id: "PD-2024-003",
    partnerName: "C파트너",
    styleNo: "ST-220",
    status: "배송완료",
    arrivalDate: "2025-09-05",
    orderQuantity: 500,
    workOrderFile: "작업지시서_PD003.pdf",
    salesImage: { name: "영업 등록 이미지", url: "/Screenshot_1.png" },
    workQuantity: 500,
    plannedShipmentDate: "2025-09-12",
    shipmentDate: "2025-09-14",
    memo: "출고 완료",
  },
]

export default function ProductionManagementPage() {
  const [items, setItems] = useState<ProductionItem[]>(initialProductionItems)
  const [statusFilter, setStatusFilter] = useState("전체")
  const [partnerFilter, setPartnerFilter] = useState("전체")
  const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const partnerOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.partnerName))),
    [items],
  )

  const filteredItems = items.filter((item) => {
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

  const handleOpenDialog = (item: ProductionItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedItem(null)
  }

  const handleOpenImagePreview = (url: string) => {
    setPreviewImage(url)
    setIsPreviewOpen(true)
  }

  const handleCloseImagePreview = () => {
    setPreviewImage(null)
    setIsPreviewOpen(false)
  }

  const handleSave = (updated: ProductionItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    toast({
      title: "정보가 업데이트되었습니다.",
      description: `${updated.partnerName} / ${updated.styleNo} 진행상태가 ${updated.status}로 변경되었습니다.`,
    })
    handleCloseDialog()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">생산 관리</h1>
            <p className="text-muted-foreground">생산 진행 현황을 확인하고 작업 정보를 업데이트하세요</p>
          </div>
        </div>

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
                    <SelectItem value="작업중">작업중</SelectItem>
                    <SelectItem value="후가공중">후가공중</SelectItem>                    
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
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <button
                    type="button"
                    className="rounded-xl p-2"
                    onClick={() => handleOpenImagePreview(item.salesImage.url)}
                  >
                    <img
                      src={item.salesImage.url}
                      alt={item.salesImage.name}
                      className="h-[100px] w-[100px] rounded-lg object-cover"
                    />
                  </button>

                  <div className="flex-1 rounded-2xl bg-secondary/10 px-4 py-2 min-h-[120px] flex items-center">
                    <div>
                      <p className="text-sm text-foreground">메모</p>
                      <p className="mt-1 text-sm text-foreground leading-relaxed">
                        {item.memo && item.memo.trim().length > 0 ? item.memo : "등록된 메모가 없습니다."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">입고일</span>
                    <span className="font-medium">{item.arrivalDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">오더수량</span>
                    <span className="font-medium">{item.orderQuantity.toLocaleString()}개</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">첨부파일</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                      {item.workOrderFile}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleOpenDialog(item)}
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
              <p className="text-muted-foreground">조건에 맞는 생산 정보가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? handleCloseDialog() : setIsDialogOpen(open))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem ? `${selectedItem.partnerName} - ${selectedItem.styleNo}` : "정보 입력"}</DialogTitle>
            <DialogDescription>생산 진행에 필요한 정보를 입력하세요.</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <ProductionInfoForm
              item={selectedItem}
              onClose={handleCloseDialog}
              onSave={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isPreviewOpen} onOpenChange={(open) => (!open ? handleCloseImagePreview() : setIsPreviewOpen(open))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>이미지 확대 보기</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <div className="w-full overflow-hidden rounded-lg bg-muted">
                <img src={previewImage} alt="영업 등록 이미지" className="w-full h-auto object-contain" />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleCloseImagePreview}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

function ProductionInfoForm({
  item,
  onClose,
  onSave,
}: {
  item: ProductionItem
  onClose: () => void
  onSave: (item: ProductionItem) => void
}) {
  const [formData, setFormData] = useState({
    status: item.status,
    workQuantity: item.workQuantity ? String(item.workQuantity) : "",
    plannedShipmentDate: item.plannedShipmentDate || "",
    shipmentDate: item.shipmentDate || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...item,
      status: formData.status,
      workQuantity: formData.workQuantity ? Number(formData.workQuantity) : null,
      plannedShipmentDate: formData.plannedShipmentDate || null,
      shipmentDate: formData.shipmentDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="leading-8">진행 상태</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger className="border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="대기중">대기중</SelectItem>
            <SelectItem value="작업중">작업중</SelectItem>
            <SelectItem value="후가공중">후가공중</SelectItem>
            <SelectItem value="배송완료">배송완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="leading-8">작업수량</Label>
        <NumericKeypadInput
          value={formData.workQuantity}
          onValueChange={(nextValue) => setFormData((prev) => ({ ...prev, workQuantity: nextValue }))}
          placeholder="작업수량을 입력하세요"
          inputClassName="border-border"
          modalTitle="작업수량 입력"
        />
      </div>

      <div className="space-y-2">
        <Label className="leading-8">출고 예정일</Label>
        <Input
          className="border-border"
          type="date"
          value={formData.plannedShipmentDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, plannedShipmentDate: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label className="leading-8">출고일</Label>
        <Input
          className="border-border"
          type="date"
          value={formData.shipmentDate}
          onChange={(e) => setFormData((prev) => ({ ...prev, shipmentDate: e.target.value }))}
        />
      </div>

      <div className="flex gap-2 pt-2">
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
