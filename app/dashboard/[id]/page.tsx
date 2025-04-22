"use client"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  DollarSign,
  Shield,
  Bell,
  Search,
  ArrowUpRight,
  TestTube,
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

export default function DashboardPage() {
  const { user } = useUser()
  const isApprover = user?.role === "approver"

  const { data: accountDetails, isLoading: accountDetailsLoading } = useQuery({
    queryKey: ["accountDetails", user?.accountId],
    queryFn: () =>
      axios.get(`/api/accounts/details?accountId=${user?.accountId}`)
        .then((res) => res.data),
    enabled: !!user?.accountId
  })

  const totalBalance = accountDetails?.balance.reduce((acc: number, curr: { balance: number }) => acc + curr.balance, 0)
  const bankAccounts = {
    length: accountDetails?.accounts.length,
    // map the accounts to an object and if the new sub-type arrives, add it to the object and if the subtype already exists increment the count
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

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              axios.get("/api/test").then((res) => {
                console.log("Test response:", res.data);
              }).catch((error) => {
                console.error("Test error:", error);
              });
            }}
          >
            <TestTube className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-6">
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
                    <h3 className="text-2xl font-bold">${totalBalance}</h3>
                    <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +20.1% from last month
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="stat-card success">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Linked Accounts</p>
                    <h3 className="text-2xl font-bold">{bankAccounts.length || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{bankAccounts.accounts ? Object.entries(bankAccounts.accounts).map(([key, value]) => `${value} ${key}`).join(", ") : ""}</p>
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
                    <Link href="/dashboard/transactions">
                      View All Transactions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="col-span-3 overflow-hidden border-0 shadow-lg">
                <CardHeader className="border-b bg-muted/30 px-6">
                  <CardTitle>Fraud Alerts</CardTitle>
                  <CardDescription>Recent suspicious activities detected</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <FraudAlerts accountId={user.accountId} />
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-6 py-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/fraud-alerts">
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

