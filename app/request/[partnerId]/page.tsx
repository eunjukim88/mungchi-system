"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NumericKeypadInput } from "@/components/ui/numeric-keypad-input"
import { FileUploadDropzone } from "@/components/ui/file-upload-dropzone"
import { FileText } from "lucide-react"

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
    workType: "main",
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

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
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
    setFormData((prev) => {
      if (name === "workType") {
        return {
          ...prev,
          workType: value,
          styleNumber: value === "sample" ? "" : prev.styleNumber,
        }
      }

      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.orderQuantity.trim()) {
      alert("오더 수량을 입력해주세요.")
      return
    }
    if (!formData.quantity) {
      alert("입고일을 선택해주세요.")
      return
    }
    if (formData.workType === "main" && !formData.styleNumber.trim()) {
      alert("메인 작업일 경우 스타일번호를 입력해주세요.")
      return
    }
    console.log("Work request submitted:", { partnerId, partner, formData, uploadedFiles })
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
                <CardContent className="p-6">
                  <FileUploadDropzone
                    value={uploadedFiles}
                    onChange={setUploadedFiles}
                    acceptExtensions={["pdf", "jpg", "jpeg", "png"]}
                    title="작업지시서 첨부 (서면 또는 PDF)"
                    description="파일을 선택하거나 이 영역으로 드래그하세요"
                    hint="PDF, JPG, PNG 파일을 업로드하세요"
                  />
                </CardContent>
              </Card>

              {/* Additional Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">작업 유형</Label>
                  <div className="grid grid-cols-2 gap-2 md:w-fit">
                    {[
                      { value: "sample", label: "샘플 작업" },
                      { value: "main", label: "메인 작업" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.workType === option.value ? "default" : "outline"}
                        className={`h-10 ${formData.workType === option.value ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                        onClick={() => handleInputChange("workType", option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {formData.workType === "main" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-primary"># 스타일번호</Label>
                    <Input
                      value={formData.styleNumber}
                      onChange={(e) => handleInputChange("styleNumber", e.target.value)}
                      placeholder="예:  YY251AC001"
                      className="border-border"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">오더 수량 <span className="text-destructive">*</span></Label>
                  <NumericKeypadInput
                    value={formData.orderQuantity}
                    onValueChange={(nextValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderQuantity: nextValue,
                      }))
                    }
                    placeholder="수량을 입력하세요"
                    inputClassName="border-border"
                    modalTitle="오더 수량 입력"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">입고일 <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="w-full border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-primary">메모 (선택)</Label>
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
