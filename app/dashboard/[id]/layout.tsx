"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "@/context/user-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

async function getAccount(id: string) {
  const response = await axios.get(`/api/accounts/get-context?accountId=${id}`);
  return response.data;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id } = useParams();
  const { setUser } = useUser();
  const router = useRouter();

  const { data: account, error } = useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccount(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      router.push('/accounts');
      return;
    }

    if (account) {
      setUser({
        accountId: account.account.id,
        email: account.userEmail,
        role: account.userRole,
        name: account.userName,
        id: account.userId,
      });
    }
  }, [account, error, setUser, router]);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <main className="flex flex-col">{children}</main>
      </div>
    </SidebarProvider>
  )
}

