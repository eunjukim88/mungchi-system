"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type NumericKeypadInputProps = {
  value?: string | number | null
  onValueChange: (value: string) => void
  placeholder?: string
  inputClassName?: string
  modalTitle?: string
  confirmLabel?: string
  clearLabel?: string
  digits?: string[]
}

const DEFAULT_DIGITS = ["8", "2", "9", "7", "3", "6", "5", "1", "4"]

export function NumericKeypadInput({
  value,
  onValueChange,
  placeholder,
  inputClassName,
  modalTitle = "숫자 입력",
  confirmLabel = "확인",
  clearLabel = "전체삭제",
  digits = DEFAULT_DIGITS,
}: NumericKeypadInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingValue, setPendingValue] = useState("")

  const stringValue = value ?? ""
  const displayValue = typeof stringValue === "number" ? String(stringValue) : String(stringValue)

  const openKeypad = () => {
    setPendingValue(displayValue)
    setIsOpen(true)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPendingValue(displayValue)
    }
    setIsOpen(nextOpen)
  }

  const handleAppend = (digit: string) => {
    setPendingValue((prev) => {
      const nextRaw = `${prev}${digit}`
      return nextRaw.replace(/^0+(?!$)/g, "")
    })
  }

  const handleDelete = () => {
    setPendingValue((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setPendingValue("")
  }

  const handleConfirm = () => {
    onValueChange(pendingValue)
    setIsOpen(false)
  }

  return (
    <>
      <Input
        className={inputClassName}
        value={displayValue}
        readOnly
        inputMode="numeric"
        placeholder={placeholder}
        onFocus={openKeypad}
        onClick={openKeypad}
      />
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-xs rounded-3xl border-none bg-primary text-primary-foreground p-6 shadow-2xl">
          <DialogHeader className="mb-4 space-y-1">
            <DialogTitle className="text-center text-base font-semibold tracking-wide">{modalTitle}</DialogTitle>
            <div className="text-center text-3xl font-bold text-white/90">{pendingValue || "0"}</div>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit) => (
              <Button
                key={digit}
                type="button"
                variant="secondary"
                className="h-14 rounded-2xl bg-white/15 text-2xl font-semibold text-primary-foreground hover:bg-white/25"
                onClick={() => handleAppend(digit)}
              >
                {digit}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="h-14 rounded-2xl bg-white/10 text-sm font-medium text-primary-foreground hover:bg-white/20"
              onClick={handleClear}
            >
              {clearLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-14 rounded-2xl bg-white/15 text-2xl font-semibold text-primary-foreground hover:bg-white/25"
              onClick={() => handleAppend("0")}
            >
              0
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-14 rounded-2xl bg-white/15 text-2xl font-semibold text-primary-foreground hover:bg-white/25"
              onClick={handleDelete}
            >
              ⌫
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" className="w-full rounded-2xl bg-white text-primary hover:bg-white/90" onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
