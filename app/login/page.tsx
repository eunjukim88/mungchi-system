"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // Added error state for login validation
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.username === "admin" && formData.password === "1234") {
      // Store login state in localStorage
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("username", "admin")

      setTimeout(() => {
        setIsLoading(false)
        router.push("/partners")
      }, 1000)
    } else {
      setTimeout(() => {
        setIsLoading(false)
        setError("아이디 또는 비밀번호가 올바르지 않습니다.")
      }, 1000)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center">
            <Image src="/logo-emb.png" alt="MUNGCHI SYSTEM Logo" width={64} height={64} className="object-contain" priority />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">작업 관리 시스템</CardTitle>
            <CardDescription>아이디와 비밀번호로 로그인하세요</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                className="border-border"
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                className="border-border"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    rememberMe: checked as boolean,
                  }))
                }
                className="border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                자동 로그인
              </Label>
            </div>
            <div className="text-xs text-muted-foreground text-center">데모 계정: admin / 1234</div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
