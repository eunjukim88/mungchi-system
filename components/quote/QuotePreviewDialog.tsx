"use client"

import React from "react"
import { PDFViewer } from "@react-pdf/renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown } from "lucide-react"
import {
  downloadTransactionStatementReactPdf,
  downloadTransactionStatementsZipReactPdf,
  printTransactionStatementReactPdf,
  TransactionStatementDocument,
} from "@/lib/quoteReactPdf"
import type { TransactionStatement } from "@/lib/work-status/exporters"

interface QuotePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statements: TransactionStatement[]
  onDownload: () => void
}

const QuotePreviewDialog: React.FC<QuotePreviewDialogProps> = ({ open, onOpenChange, statements, onDownload }) => {
  const buyerNames = React.useMemo(() => statements.map((s) => s.buyer.name), [statements])
  const [selectedPartner, setSelectedPartner] = React.useState<string>(buyerNames[0] || "")

  React.useEffect(() => {
    if (!buyerNames.length) {
      setSelectedPartner("")
      return
    }
    if (!buyerNames.includes(selectedPartner)) {
      setSelectedPartner(buyerNames[0])
    }
  }, [buyerNames, selectedPartner])

  const selectedStatement = statements.find((s) => s.buyer.name === selectedPartner)
  const handleDownloadSelected = async () => {
    if (!selectedStatement) return
    await downloadTransactionStatementReactPdf(selectedStatement, "거래명세서")
  }
  const handlePrintSelected = async () => {
    if (!selectedStatement) return
    await printTransactionStatementReactPdf(selectedStatement)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 mt-8">
            거래명세서 미리보기
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="w-[200px] border-border">
                    <SelectValue placeholder="거래처 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyerNames.map((name) => (
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
                  onClick={() =>
                    downloadTransactionStatementsZipReactPdf(statements, "거래명세서_일괄").catch(() => onDownload())
                  }
                >
                  전체 다운로드
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>선택한 거래처의 거래명세서를 미리보고, 거래처별 PDF로 저장합니다.</DialogDescription>
        </DialogHeader>

        {/* 동일 렌더러 미리보기: PDFViewer로 선택 거래처 문서를 그대로 표시 */}
        <div className="w-full flex justify-center">
          {selectedStatement && (
            <PDFViewer style={{ width: "210mm", height: "297mm", border: "none" }} showToolbar={false}>
              <TransactionStatementDocument statement={selectedStatement} />
            </PDFViewer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuotePreviewDialog
