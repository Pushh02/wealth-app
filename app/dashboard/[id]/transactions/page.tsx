"use client"
import { useState } from "react"
import { Calendar, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser } from "@/context/user-context"
// Reuse the RecentTransactions component with extended view
import { RecentTransactions } from "@/components/recent-transactions"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

export default function TransactionsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const accounts = useQuery({
    queryKey: ["accounts", user?.accountId],
    queryFn: () => axios.get(`/api/accounts/details?accountId=${user?.accountId}`).then((res) => res.data),
    enabled: !!user?.accountId
  })

  const dateFilteredTransactions = useQuery({
    queryKey: ["transactions", user?.accountId, dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return { added: [] }
      
      const startDate = format(dateRange.from, 'yyyy-MM-dd')
      const endDate = format(dateRange.to, 'yyyy-MM-dd')
      
      const response = await axios.get(
        `/api/accounts/transactions/date-search?accountId=${user?.accountId}&startDate=${startDate}&endDate=${endDate}`
      )
      return response.data
    },
    enabled: !!user?.accountId && !!dateRange?.from && !!dateRange?.to
  })

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Transactions</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Monitoring</h2>
          <p className="text-muted-foreground">View and monitor all transactions across your linked accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Narrow down transactions by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search-transactions">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-transactions" 
                    placeholder="Search transactions" 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.data?.accounts?.map((account: any) => (
                      <SelectItem key={account.account_id} value={account.account_id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in store">In Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range-transactions">Date Range</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View and monitor all your transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactions 
              extended 
              accountId={user.accountId}
              searchQuery={searchQuery}
              selectedAccount={selectedAccount}
              selectedCategory={selectedCategory}
              dateRange={dateRange ? { start: dateRange.from!, end: dateRange.to! } : undefined}
              transactions={dateFilteredTransactions.data?.added}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

