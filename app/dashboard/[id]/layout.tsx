"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <main className="flex flex-col">{children}</main>
      </div>
    </SidebarProvider>
  )
}

