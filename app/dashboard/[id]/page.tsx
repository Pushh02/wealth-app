"use client"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  DollarSign,
  Shield,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountsOverview } from "@/components/accounts-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { FraudAlerts } from "@/components/fraud-alerts"
import { PendingApprovals } from "@/components/pending-approvals"
import { useUser } from "@/context/user-context"
import PlaidConnect from "@/components/ui/Plaid/PlaidConnect"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const isApprover = user?.role === "approver"
  
  const { id } = useParams()

  const { data: accountDetails, isLoading: accountDetailsLoading, isError: accountDetailsError } = useQuery({
    queryKey: ["accountDetails", user?.accountId],
    queryFn: () =>
      axios.get(`/api/accounts/details?accountId=${user?.accountId}`)
        .then((res) => res.data),
    enabled: !!user?.accountId,
    retry: false,
  })

  const { data: userAccounts } = useQuery({
    queryKey: ["userAccounts"],
    queryFn: () =>
      axios.get("/api/accounts")
        .then((res) => res.data),
  })

  const handleAccountSwitch = (account: any) => {
    if (user) {
      setUser({
        ...user,
        accountId: account.id,
        role: account.userRole,
      })
      router.push(`/dashboard/${account.id}`)
    }
  }

  const handleLogout = () => {
    axios.post("/api/auth/logout")
      .then(() => {
        setUser(null)
        router.push("/login")
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to logout")
      })
  }

  const totalBalance = accountDetails?.balance.reduce((acc: number, curr: { balance: number }) => acc + curr.balance, 0)
  const bankAccounts = {
    length: accountDetails?.accounts.length,
    accounts: accountDetails?.accounts.reduce((acc: Record<string, number>, account: any) => {
      const accountType = account.subtype
      if (acc[accountType]) {
        acc[accountType]++
      } else {
        acc[accountType] = 1
      }
      return acc
    }, {})
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (accountDetailsError) {
    return (
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="font-medium">
                    {userAccounts?.accounts?.find((account: any) => account.id === user?.accountId)?.name || "Select Account"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userAccounts?.accounts?.map((account: any) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => handleAccountSwitch(account)}
                    className="flex items-center justify-between"
                  >
                    <span>{account.name}</span>
                    {account.id === user?.accountId && (
                      <span className="text-xs text-muted-foreground">Current</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center justify-between">
                <p className="flex items-center gap-2" onClick={() => router.push("/accounts")}>
                  <User className="h-5 w-5" /> Manage Accounts
                </p>
              </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center justify-between">
                  <p className="flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" /> Logout
                  </p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center h-full mt-24">
          <div className="text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">No Bank Account Connected</h3>
              <p className="text-muted-foreground max-w-md">
                Connect your bank account to start monitoring transactions and managing your finances.
              </p>
            </div>
            <PlaidConnect accountId={user.accountId} />
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
          <h1 className="font-semibold text-lg">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="font-medium">
                  {userAccounts?.accounts?.find((account: any) => account.id === user?.accountId)?.name || "Select Account"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userAccounts?.accounts?.map((account: any) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => handleAccountSwitch(account)}
                  className="flex items-center justify-between"
                >
                  <span>{account.name}</span>
                  {account.id === user?.accountId && (
                    <span className="text-xs text-muted-foreground">Current</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                <p className="flex items-center gap-2" onClick={() => router.push("/accounts")}>
                  <User className="h-5 w-5" /> Manage Accounts
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between">
                <p className="flex items-center gap-2" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" /> Logout
                </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Welcome back, {user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "User"}</h2>
            <p className="text-muted-foreground mt-1">Here's what's happening with your accounts today.</p>
          </div>
          {!isApprover && (
            <PlaidConnect accountId={user.accountId} />
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger
              value="overview"
              className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            {isApprover ? (
              <TabsTrigger
                value="pending"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Pending Approvals
              </TabsTrigger>
            ) : (
              <>
                <TabsTrigger
                  value="transactions"
                  className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="alerts"
                  className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Fraud Alerts
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="stat-card">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
                    <h3 className="text-2xl font-bold">${totalBalance?.toFixed(2) || "0.00"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Linked Accounts</p>
                    <h3 className="text-2xl font-bold">{bankAccounts.length || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Active bank accounts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isApprover ? "Pending Approvals" : "Pending Transactions"}
                    </p>
                    <h3 className="text-2xl font-bold">{accountDetails?.transactionsThisMonth || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Fraud Alerts</p>
                    <h3 className="text-2xl font-bold">{accountDetails?.alertTransactions.length || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Suspicious activities detected</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {isApprover ? <PendingApprovals transactions={accountDetails?.alertTransactions} /> : <AccountsOverview accounts={accountDetails?.balance} />}

            {!isApprover && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 overflow-hidden border-0 shadow-lg">
                <CardHeader className="border-b bg-muted/30 px-6">
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <RecentTransactions accountId={user.accountId} />
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-6 py-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/dashboard/${id}/transactions`}>
                      View All Transactions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="md:col-span-3 col-span-4 overflow-hidden border-0 shadow-lg">
                <CardHeader className="border-b bg-muted/30 px-6">
                  <CardTitle>Fraud Alerts</CardTitle>
                  <CardDescription>Recent suspicious activities detected</CardDescription>
                </CardHeader>
                <CardContent className="p-0 w-full">
                  <FraudAlerts accountId={user.accountId} />
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-6 py-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/dashboard/${id}/fraud-alerts`}>
                      View All Alerts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>View and monitor all your transactions across accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions extended accountId={user.accountId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Alerts</CardTitle>
                <CardDescription>Review and manage suspicious activities</CardDescription>
              </CardHeader>
              <CardContent>
                <FraudAlerts extended accountId={user.accountId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Transactions requiring your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <PendingApprovals transactions={accountDetails?.alertTransactions} extended />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

