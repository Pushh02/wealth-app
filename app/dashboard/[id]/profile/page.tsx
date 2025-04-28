"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { User, Mail, Phone, Building, Shield, Users, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useUser } from "@/context/user-context"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

function ApproversDialog({ approvers }: { approvers: any[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          View Approvers
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approvers Information</DialogTitle>
          <DialogDescription>List of users who can approve transactions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {approvers?.length > 0 ? (
            approvers.map((approver) => (
              <div key={approver.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{approver.name}</p>
                  <p className="text-sm text-muted-foreground">{approver.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No approvers found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", user?.accountId],
    queryFn: () =>
      axios.get(`/api/accounts/profile?accountId=${user?.accountId}`)
        .then((res) => res.data),
    enabled: !!user?.accountId,
  })

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/accounts?accountId=${user?.accountId}`)
      setUser(null)
      router.push('/accounts')
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      })
    } catch (error) {
      console.error('Delete account error:', error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <Skeleton className="h-6 w-24" />
          </div>
        </header>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30 px-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30 px-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg md:col-span-2">
              <CardHeader className="border-b bg-muted/30 px-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Profile</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Profile Settings</h2>
            <p className="text-muted-foreground mt-1">View your account information and preferences.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30 px-6">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Accounts Connected</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.bankAccountsCount || "Not provided"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/30 px-6">
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account settings and role</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{user.role} User</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Approvers Info</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData?.approversInfo?.length || 0} Approvers</span>
                  <ApproversDialog approvers={profileData?.approversInfo} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account ID</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{user.accountId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === "primary" && (
            <Card className="overflow-hidden border-0 shadow-lg md:col-span-2">
              <CardHeader className="border-b bg-muted/30 px-6">
                <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-rose-500">Delete Account</p>
                      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
