"use client"

import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, Paperclip } from "lucide-react"

type FileUploadDropzoneProps = {
  value: File[]
  onChange: (files: File[]) => void
  acceptExtensions?: string[]
  title: string
  description?: string
  hint?: string
  buttonLabel?: string
  listTitle?: string
  removeLabel?: string
  className?: string
  dropzoneClassName?: string
}

const normalizeExtensions = (extensions?: string[]) =>
  extensions?.map((ext) => (ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`)) ?? []

const buildFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

export function FileUploadDropzone({
  value,
  onChange,
  acceptExtensions,
  title,
  description,
  hint,
  buttonLabel = "파일 선택",
  listTitle = "선택된 파일:",
  removeLabel = "삭제",
  className,
  dropzoneClassName,
}: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const normalizedAccept = normalizeExtensions(acceptExtensions)

  const filterByAccept = (file: File) => {
    if (normalizedAccept.length === 0) return true
    const lowerName = file.name.toLowerCase()
    return normalizedAccept.some((ext) => lowerName.endsWith(ext))
  }

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return
    const existingKeys = new Set(value.map(buildFileKey))
    const nextFiles = incoming.filter(filterByAccept).filter((file) => !existingKeys.has(buildFileKey(file)))
    if (nextFiles.length === 0) return
    onChange([...value, ...nextFiles])
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    addFiles(files)
    event.target.value = ""
  }

  const triggerFileDialog = () => {
    inputRef.current?.click()
  }

  const handleRemove = (target: File) => {
    onChange(value.filter((file) => file !== target))
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    const files = Array.from(event.dataTransfer?.files ?? [])
    addFiles(files)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          dropzoneClassName,
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileDialog}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={normalizedAccept.join(",") || undefined}
          onChange={handleInputChange}
          className="hidden"
          ref={inputRef}
        />
        <div className="space-y-3 cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-primary">{title}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <Button
            type="button"
            variant="outline"
            className="bg-transparent"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              triggerFileDialog()
            }}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2 text-sm font-medium text-foreground">
          <p className="text-sm font-medium text-primary">{listTitle}</p>
          <ul className="space-y-1">
            {value.map((file) => (
              <li key={buildFileKey(file)} className="flex items-center gap-2 text-sm">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate text-foreground/90">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(file)}
                >
                  {removeLabel}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
