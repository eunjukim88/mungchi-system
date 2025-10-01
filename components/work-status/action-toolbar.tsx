"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export type WorkStatusActionToolbarProps = {
  onDownloadExcel: () => void
  onGenerateQuote: () => void
  captureButton: React.ReactNode
  isQuoteDisabled: boolean
}

export function WorkStatusActionToolbar({
  onDownloadExcel,
  onGenerateQuote,
  captureButton,
  isQuoteDisabled,
}: WorkStatusActionToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onDownloadExcel}>
        <Download className="mr-2 h-4 w-4" />
        엑셀 다운로드
      </Button>
      {captureButton}
      <Button onClick={onGenerateQuote} disabled={isQuoteDisabled} className="bg-blue-600 hover:bg-blue-700">
        <FileText className="mr-2 h-4 w-4" />
        거래명세서 출력
      </Button>
    </div>
  )
}
