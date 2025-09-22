"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText } from "lucide-react"

// Mock partner data - in real app, this would come from a database
const partnerData: Record<string, { name: string; contactPerson: string; phone: string }> = {
  "bpartner-001": { name: "A파트너", contactPerson: "이파트", phone: "010-7777-7777" },
  "apartner-002": { name: "B파트너", contactPerson: "김파트", phone: "010-7172-9698" },
  "apartner-003": { name: "C파트너", contactPerson: "박파트", phone: "010-7172-9698" },
  "apartner-004": { name: "D파트너", contactPerson: "공파트", phone: "010-7172-9698" },
}

export default function WorkRequestPage() {
  const params = useParams()
  const partnerId = params.partnerId as string
  const partner = partnerData[partnerId]

  const [formData, setFormData] = useState({
    requiredDays: "",
    modaDays: "",
    estimatedAmount: "",
    status: "예술입고",
    completionDate: undefined as Date | undefined,
    styleNumber: "",
    orderQuantity: "",
    quantity: "",
    memo: "",
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h1 className="text-xl font-semibold mb-2">잘못된 접근</h1>
            <p className="text-muted-foreground">유효하지 않은 거래처 URL입니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Work request submitted:", { partnerId, partner, formData, uploadedFile })
    alert("작업 요청이 성공적으로 등록되었습니다!")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-2.5">
        {/* Header Card */}
        <Card className="bg-primary text-primary-foreground py-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">디자인팀 작업 요청</CardTitle>
            <p className="text-primary-foreground/80">새로운 작업 요청서를 작성해 주세요</p>
          </CardHeader>
        </Card>

        {/* Work Request Form */}
        <Card className="bg-background text-foreground">
          <CardContent className="p-6 space-y-6 py-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Section */}
              <Card className="border-dashed border-2 border-muted-foreground/25 py-3.5">
                <CardContent className="p-6 py-0">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">작업지시서 첨부 (서면 또는 PDF)</h3>
                      <p className="text-sm text-muted-foreground mt-1">파일을 선택 또는 여기로 업로드</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG 파일을 업로드하세요</p>
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="bg-transparent"
                      >
                        파일 선택
                      </Button>
                    </div>
                    {uploadedFile && (
                      <p className="text-sm text-primary font-medium">선택된 파일: {uploadedFile.name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary"># 스타일번호</Label>
                  <Input
                    value={formData.styleNumber}
                    onChange={(e) => handleInputChange("styleNumber", e.target.value)}
                    placeholder="예: ST-2024-001"
                    className="border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">오더 수량</Label>
                  <Input className="border-border"
                    value={formData.orderQuantity}
                    onChange={(e) => handleInputChange("orderQuantity", e.target.value)}
                    placeholder="수량을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">완료일</Label>
                  <Input
                    type="date"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="w-full border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary">메모</Label>
                  <Textarea
                    value={formData.memo}
                    onChange={(e) => handleInputChange("memo", e.target.value)}
                    placeholder="추가 메모사항을 입력하세요"
                    className="min-h-[100px] border-border"
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-lg font-medium">
                작업등록하기
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">작업 요청서 제출 후 담당자가 연락드리겠습니다.</div>
      </div>
    </div>
  )
}
