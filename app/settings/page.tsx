"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building } from "lucide-react"

export default function SettingsPage() {
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "우리회사",
    manager: "김담당",
    phone: "02-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    businessNumber: "123-45-67890",
    email: "contact@ourcompany.com",
  })

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveCompanyInfo = () => {
    localStorage.setItem("companyInfo", JSON.stringify(companyInfo))
    alert("회사 정보가 저장되었습니다.")
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
              <CardDescription>견적서에 표시될 공급자 정보를 설정하세요</CardDescription>
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
                  <Label htmlFor="manager">담당자</Label>
                  <Input
                    id="manager"
                    value={companyInfo.manager}
                    onChange={(e) => handleCompanyInfoChange("manager", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">연락처</Label>
                  <Input
                    id="companyPhone"
                    value={companyInfo.phone}
                    onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자번호</Label>
                  <Input
                    id="businessNumber"
                    value={companyInfo.businessNumber}
                    onChange={(e) => handleCompanyInfoChange("businessNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={companyInfo.address}
                    onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveCompanyInfo} className="mt-4">
                회사 정보 저장
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
