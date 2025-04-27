"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/user-context"
import { Badge } from "@/components/ui/badge"

export function DashboardSidebar({ pendingAlerts }: { pendingAlerts: number }) {
  const pathname = usePathname()
  const { user } = useUser()
  const router = useRouter()
  const isApprover = user?.role === "approver"
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract user ID from the pathname
  const userId = pathname.split('/')[2] || ''
  
  // Navigation items for Primary User
  const primaryNavItems = [
    { name: "Dashboard", href: `/dashboard/${userId}`, icon: Home },
    { name: "Transactions", href: `/dashboard/${userId}/transactions`, icon: CreditCard },
    { name: "Fraud Alerts", href: `/dashboard/${userId}/fraud-alerts`, icon: AlertTriangle, showCount: true },
    { name: "Dual Authorization", href: `/dashboard/${userId}/dual-auth`, icon: Shield },
    { name: "Audit Log", href: `/dashboard/${userId}/audit-log`, icon: FileText },
  ]

  // Navigation items for Approver
  const approverNavItems = [
    { name: "Dashboard", href: `/dashboard/${userId}`, icon: Home },
    { name: "Transaction Approval", href: `/dashboard/${userId}/approval`, icon: ClipboardList, showCount: true },
    { name: "Audit Log", href: `/dashboard/${userId}/audit-log`, icon: FileText },
  ]

  const navItems = isApprover ? approverNavItems : primaryNavItems

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">WealthGuard</span>
              <span className="text-xs text-muted-foreground">Secure Transfers</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="sidebar-highlight"
                    data-active={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {item.showCount && pendingAlerts > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {pendingAlerts}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === `/dashboard/${userId}/profile`}>
                  <Link href={`/dashboard/${userId}/profile`}>
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-primary/10">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || ''}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} User</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-muted/50">
                <Users className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

