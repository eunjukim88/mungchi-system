"use client"

import React from "react"
import { PDFViewer } from "@react-pdf/renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown } from "lucide-react"
import { downloadQuoteReactPdf, printQuoteReactPdf, downloadQuotesZipReactPdf, QuoteDocument } from "@/lib/quoteReactPdf"

export type QuoteItem = {
  no: number
  productName: string
  quantity: number
  unitPrice: number
  amount: number
  note: string
}

export type CompanyInfo = {
  companyName?: string
  manager?: string
  phone?: string
}

export type Quote = {
  partnerName: string
  items: QuoteItem[]
  totalAmount: number
  tax: number
  finalAmount: number
  date: string
  companyInfo?: CompanyInfo
}

interface QuotePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotes: Quote[]
  onDownload: () => void
}

const QuotePreviewDialog: React.FC<QuotePreviewDialogProps> = ({ open, onOpenChange, quotes, onDownload }) => {
  const partnerNames = quotes.map((q) => q.partnerName)
  const [selectedPartner, setSelectedPartner] = React.useState<string>(partnerNames[0] || "")

  const selectedQuote = quotes.find((q) => q.partnerName === selectedPartner)
  const handleDownloadSelected = async () => {
    if (!selectedQuote) return
    await downloadQuoteReactPdf(selectedQuote, "견적서")
  }
  const handlePrintSelected = async () => {
    if (!selectedQuote) return
    await printQuoteReactPdf(selectedQuote)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 mt-8">
            견적서 미리보기
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="w-[200px] border-border">
                    <SelectValue placeholder="거래처 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={handleDownloadSelected}>
                <FileDown className="mr-2 h-4 w-4" />
                선택 다운로드
              </Button>
              <Button variant="outline" onClick={handlePrintSelected}>
                인쇄
              </Button>
              {onDownload && (
                <Button
                  variant="outline"
                  onClick={() => downloadQuotesZipReactPdf(quotes, "견적서_일괄").catch(() => onDownload())}
                >
                  전체 다운로드
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>선택한 거래처의 견적서를 미리보고, 거래처별 PDF로 저장합니다.</DialogDescription>
        </DialogHeader>

        {/* 동일 렌더러 미리보기: PDFViewer로 선택 거래처 문서를 그대로 표시 */}
        <div className="w-full flex justify-center">
          {selectedQuote && (
            <PDFViewer style={{ width: "210mm", height: "297mm", border: "none" }} showToolbar={false}>
              <QuoteDocument quote={selectedQuote} />
            </PDFViewer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuotePreviewDialog
