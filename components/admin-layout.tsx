"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <main className={cn("transition-all duration-300", sidebarCollapsed ? "md:ml-16" : "md:ml-64", className)}>
        <div className="p-4 md:p-6 pt-16 md:pt-6">{children}</div>
      </main>
    </div>
  )
}
