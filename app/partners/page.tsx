"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building,
  Info,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { loadPartners, PartnerRecord, savePartners } from "@/lib/partners/storage"

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerRecord[]>(() => loadPartners())
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPartnerDialogOpen, setIsNewPartnerDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 // 4*2 grid

  const filteredPartners = useMemo(
    () =>
      partners.filter((partner) => {
        const lowerTerm = searchTerm.toLowerCase()
        return (
          partner.name.toLowerCase().includes(lowerTerm) ||
          partner.contactPerson.toLowerCase().includes(lowerTerm) ||
          partner.phone.includes(searchTerm) ||
          partner.registrationNumber.replace(/-/g, "").includes(searchTerm.replace(/-/g, ""))
        )
      }),
    [partners, searchTerm],
  )

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPartners = filteredPartners.slice(startIndex, endIndex)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const copyUniqueUrl = (uniqueId: string) => {
    const url = `${window.location.origin}/request/${uniqueId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "URL 복사됨",
      description: "작업 요청 URL이 클립보드에 복사되었습니다.",
    })
  }

  const handleAddPartner = (partner: PartnerRecord) => {
    setPartners((prev) => {
      const next = [...prev, partner]
      savePartners(next)
      return next
    })
    toast({
      title: "거래처 등록 완료",
      description: `${partner.name}이(가) 성공적으로 등록되었습니다.`,
    })
  }

  const openDetail = (partner: PartnerRecord) => {
    setSelectedPartner(partner)
    setIsDetailDialogOpen(true)
  }

  const closeDetail = () => {
    setIsDetailDialogOpen(false)
    setSelectedPartner(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">거래처 관리</h1>
            <p className="text-muted-foreground">거래처 정보를 관리하고 고유 URL을 생성하세요</p>
          </div>
          <Dialog open={isNewPartnerDialogOpen} onOpenChange={setIsNewPartnerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                거래처 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 거래처 등록</DialogTitle>
                <DialogDescription>새로운 거래처 정보를 입력하세요</DialogDescription>
              </DialogHeader>
              <NewPartnerForm
                onClose={() => setIsNewPartnerDialogOpen(false)}
                onSubmit={(partner) => {
                  handleAddPartner(partner)
                  setIsNewPartnerDialogOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg">거래처 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="거래처명/담당자명/연락처 검색"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Partners Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {currentPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{partner.name}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">담당자명</div>
                    <div className="font-medium">{partner.contactPerson}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">연락처</div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">{partner.phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigator.clipboard.writeText(partner.phone)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => openDetail(partner)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    상세보기
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => copyUniqueUrl(partner.uniqueId)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    URL 복사
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                    disabled
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Updated Empty State */}
      {currentPartners.length === 0 && filteredPartners.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">검색 조건에 맞는 거래처가 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination Info */}
      {filteredPartners.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          총 {filteredPartners.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredPartners.length)}개 표시
        </div>
      )}
    </div>
    <Dialog
      open={isDetailDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeDetail()
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{selectedPartner?.name ?? "거래처 상세 정보"}</DialogTitle>
          <DialogDescription>추가로 입력한 거래처 상세 정보를 확인하세요.</DialogDescription>
        </DialogHeader>
        {selectedPartner && (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">대표자명</span>
              <span className="font-medium">{selectedPartner.representativeName}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">사업자등록번호</span>
              <span className="font-medium">{selectedPartner.registrationNumber}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">사업장 주소</span>
              <span className="font-medium">{selectedPartner.businessAddress}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">이메일</span>
              <span className="font-medium">{selectedPartner.email}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">담당자명</span>
              <span className="font-medium">{selectedPartner.contactPerson}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm text-muted-foreground">담당자 연락처</span>
              <span className="font-medium">{selectedPartner.phone}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </AdminLayout>
  )
}

function NewPartnerForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (partner: PartnerRecord) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    businessAddress: "",
    contactPerson: "",
    phone: "",
    representativeName: "",
    email: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const timestamp = Date.now()
    const normalizedName = formData.name.trim()
    const uniqueId = `${normalizedName.toLowerCase().replace(/\s+/g, "")}-${timestamp.toString().slice(-4)}`
    const newPartner: PartnerRecord = {
      id: `${timestamp}`,
      name: normalizedName,
      registrationNumber: formData.registrationNumber.trim(),
      businessAddress: formData.businessAddress.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      representativeName: formData.representativeName.trim(),
      email: formData.email.trim(),
      uniqueId,
      createdAt: new Date(timestamp).toISOString().split("T")[0],
    }
    onSubmit(newPartner)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">거래처명 *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="거래처명을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrationNumber">사업자등록번호 *</Label>
        <Input
          id="registrationNumber"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleInputChange}
          placeholder="000-00-00000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">사업장 주소 *</Label>
        <Input
          id="businessAddress"
          name="businessAddress"
          value={formData.businessAddress}
          onChange={handleInputChange}
          placeholder="사업장 주소를 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">담당자명 *</Label>
        <Input
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleInputChange}
          placeholder="담당자명을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">담당자 연락처 *</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="010-0000-0000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="representativeName">대표자명 *</Label>
        <Input
          id="representativeName"
          name="representativeName"
          value={formData.representativeName}
          onChange={handleInputChange}
          placeholder="대표자명을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일 *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="email@example.com"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          취소
        </Button>
        <Button type="submit" className="flex-1">
          등록
        </Button>
      </div>
    </form>
  )
}
