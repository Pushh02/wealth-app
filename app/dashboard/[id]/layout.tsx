"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "@/context/user-context"
import { useCallback, use, useEffect } from "react"

async function getAccount(id: string) {
  const response = await fetch(`/api/accounts/get-context?accountId=${id}`);
  return response.json();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id } = useParams();
  const { setUser } = useUser();

  useEffect(() => {
    const fetchContext = async () => {
      const account = await getAccount(id as string);
      if (account) {
        setUser({
          accountId: account.account.id,
          email: account.userEmail,
          role: account.userRole,
          name: account.userName,
          id: account.userId,
        });
      }
    };
    fetchContext();
  }, []);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <main className="flex flex-col">{children}</main>
      </div>
    </SidebarProvider>
  )
}

