import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthGuard } from "@/components/auth-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "영업 관리 시스템",
  description: "MUNGCHI SYSTEM - 영업 관리 어드민",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthGuard>{children}</AuthGuard>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
