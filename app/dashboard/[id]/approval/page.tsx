"use client"
import { useState } from "react"
import { Search } from "lucide-react"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PendingApprovals } from "@/components/pending-approvals"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/context/user-context"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"

export default function ApprovalPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.accountId, searchQuery, severity, date, page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/accounts/fraud-alert?accountId=${user?.accountId}&searchQuery=${searchQuery}&severity=${severity}&startDate=${date.from?.toISOString()}&endDate=${date.to?.toISOString()}&page=${page}&limit=${limit}`)
      return response.data
    },
    enabled: !!user?.accountId
  })
  
  const approveTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await axios.post(`/api/accounts/transactions/alert-transactions/${transactionId}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountDetails"] })
      toast({
        title: "Transaction approved",
        description: "The transaction has been approved successfully.",
      })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to approve the transaction"
      const errorDetails = error.response?.data?.details || "Please try again"

      toast({
        title: "Error",
        description: `${errorMessage}. ${errorDetails}`,
        variant: "destructive",
      })
    }
  })

  const rejectTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await axios.post(`/api/accounts/transactions/alert-transactions/${transactionId}/reject`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountDetails"] })
      toast({
        title: "Transaction rejected",
        description: "The transaction has been rejected successfully.",
      })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to reject the transaction"
      const errorDetails = error.response?.data?.details || "Please try again"

      toast({
        title: "Error",
        description: `${errorMessage}. ${errorDetails}`,
        variant: "destructive",
      })
    }
  })

  const handleApprove = (transactionId: string) => {
    approveTransactionMutation.mutate(transactionId)
  }

  const handleReject = (transactionId: string) => {
    rejectTransactionMutation.mutate(transactionId)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Transaction Approval</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Transaction Approvals</h2>
            <p className="text-muted-foreground mt-1">Review and approve pending transactions.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter transactions by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search-approvals">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-approvals" 
                    placeholder="Search approvals" 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-approvals">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="account-approvals">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate || { from: new Date(), to: addDays(new Date(), 7) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Review and manage transactions requiring your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
            ) : (
              <PendingApprovals 
                transactions={transactions?.transactions} 
                extended 
                pagination={transactions?.pagination}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

