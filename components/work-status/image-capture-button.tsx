"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageDown, Loader2 } from "lucide-react"
import { toPng } from "html-to-image"
import download from "downloadjs"

type ImageCaptureButtonProps = {
  targetRef: React.RefObject<HTMLElement>
  fileName?: string
}

export function ImageCaptureButton({ targetRef, fileName = "work-status.png" }: ImageCaptureButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCapture = async () => {
    if (!targetRef.current) {
      console.warn("캡처할 영역을 찾을 수 없습니다.")
      return
    }

    setIsProcessing(true)
    try {
      const element = targetRef.current
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          const exclusionList = ["SCRIPT", "STYLE", "NOSCRIPT"]
          return !exclusionList.includes(node.tagName)
        },
      })

      download(dataUrl, fileName)
    } catch (error) {
      console.error("이미지 저장 중 오류가 발생했습니다.", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleCapture} disabled={isProcessing} className="gap-2">
      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
      {isProcessing ? "처리 중..." : "이미지 저장"}
    </Button>
  )
}
