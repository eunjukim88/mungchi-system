"use client"

import { ChangeEvent, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building } from "lucide-react"
import { CompanyInfo, loadCompanyInfo, saveCompanyInfo } from "@/lib/settings/storage"

export default function SettingsPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => loadCompanyInfo())
  const [isSaving, setIsSaving] = useState(false)

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSealUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleCompanyInfoChange("sealImageDataUrl", reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveSeal = () => {
    handleCompanyInfoChange("sealImageDataUrl", "")
  }

  const handleSaveCompanyInfo = async () => {
    setIsSaving(true)
    try {
      saveCompanyInfo(companyInfo)
      alert("회사 정보가 저장되었습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">설정</h1>
          <p className="text-muted-foreground">회사 정보를 관리하세요</p>
        </div>

        <div className="max-w-4xl">
          {/* Company Information Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                회사 정보 설정
              </CardTitle>
              <CardDescription>거래명세서에 표시될 공급자 정보를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명</Label>
                  <Input
                    id="companyName"
                    value={companyInfo.companyName}
                    onChange={(e) => handleCompanyInfoChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representativeName">대표자</Label>
                  <Input
                    id="representativeName"
                    value={companyInfo.representativeName ?? ""}
                    onChange={(e) => handleCompanyInfoChange("representativeName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">담당자</Label>
                  <Input
                    id="manager"
                    value={companyInfo.manager ?? ""}
                    onChange={(e) => handleCompanyInfoChange("manager", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={companyInfo.phone}
                    onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email ?? ""}
                    onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">사업자등록번호</Label>
                  <Input
                    id="registrationNumber"
                    value={companyInfo.registrationNumber}
                    onChange={(e) => handleCompanyInfoChange("registrationNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">사업장 주소</Label>
                  <Input
                    id="businessAddress"
                    value={companyInfo.businessAddress}
                    onChange={(e) => handleCompanyInfoChange("businessAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="accountNumber">계좌번호</Label>
                  <Input
                    id="accountNumber"
                    value={companyInfo.accountNumber}
                    onChange={(e) => handleCompanyInfoChange("accountNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="seal">도장 이미지</Label>
                  <Input id="seal" type="file" accept="image/*" onChange={handleSealUpload} />
                  {companyInfo.sealImageDataUrl && (
                    <div className="flex items-center gap-4">
                      <img
                        src={companyInfo.sealImageDataUrl}
                        alt="회사 도장 미리보기"
                        className="h-16 w-16 rounded border bg-white object-contain"
                      />
                      <Button type="button" variant="outline" onClick={handleRemoveSeal}>
                        도장 제거
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSaveCompanyInfo} className="mt-4" disabled={isSaving}>
                {isSaving ? "저장 중..." : "회사 정보 저장"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
