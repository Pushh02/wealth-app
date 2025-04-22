"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, CreditCard, DollarSign, ShoppingCart } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Transaction } from "plaid"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"

interface RecentTransactionsProps {
  extended?: boolean
  accountId: string
  searchQuery?: string
  selectedAccount?: string
  selectedCategory?: string
  dateRange?: { start: Date; end: Date }
  transactions?: any[]
}

export function RecentTransactions({ 
  extended = false, 
  accountId,
  searchQuery = "",
  selectedAccount = "all",
  selectedCategory = "all",
  dateRange,
  transactions: externalTransactions
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)

  const fetchTransactions = async (cursor?: string) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/accounts/transactions?accountId=${accountId}${cursor ? `&cursor=${cursor}` : ''}`)
      const data = response.data
      
      if (!cursor) {
        setTransactions(data.added || [])
      } else {
        setTransactions(prev => [...prev, ...(data.added || [])])
      }
      
      setHasMore(data.has_more && (data.added?.length > 0))
      setNextCursor(data.next_cursor)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!externalTransactions) {
      fetchTransactions()
    }
  }, [accountId, externalTransactions])

  const loadMore = () => {
    if (nextCursor) {
      fetchTransactions(nextCursor)
    }
  }

  const getCategoryIcon = (category: string[]) => {
    if (category.includes("Shopping")) return ShoppingCart
    if (category.includes("Income")) return DollarSign
    if (category.includes("Food and Drink")) return CreditCard
    return CreditCard
  }

  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        transaction.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.name?.toLowerCase().includes(searchQuery.toLowerCase())

      // Account filter
      const matchesAccount = selectedAccount === "all" || 
        transaction.account_id === selectedAccount

      // Category filter
      const matchesCategory = selectedCategory === "all" || 
        transaction.payment_channel === selectedCategory

      // Date range filter
      let matchesDateRange = true
      if (dateRange) {
        const transactionDate = new Date(transaction.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        
        // Set time to start/end of day for proper comparison
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        transactionDate.setHours(12, 0, 0, 0)
        
        matchesDateRange = transactionDate >= startDate && transactionDate <= endDate
      }

      return matchesSearch && matchesAccount && matchesCategory && matchesDateRange
    })
  }

  const transactionsToDisplay = externalTransactions || transactions
  const filteredTransactions = filterTransactions(transactionsToDisplay)
  const displayTransactions = extended ? filteredTransactions : filteredTransactions.slice(0, 5)

  if (loading && transactions.length === 0) {
    return (
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {extended && (
                <TableHead className="w-[50px]">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              {extended && <TableHead>Category</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: extended ? 10 : 5 }).map((_, i) => (
              <TableRow key={i}>
                {extended && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      {!extended && <Skeleton className="h-3 w-24" />}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                {extended && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            {extended && (
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
            )}
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            {extended && <TableHead>Category</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.map((transaction) => {
            const Icon = getCategoryIcon(transaction.category || [])
            return (
              <TableRow key={transaction.transaction_id} className="transaction-row">
                {extended && (
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.category?.includes("Shopping")
                          ? "bg-purple-100 text-purple-700"
                          : transaction.category?.includes("Income")
                            ? "bg-green-100 text-green-700"
                            : transaction.category?.includes("Food and Drink")
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium">{transaction.merchant_name || transaction.name || "Unknown"}</span>
                      {!extended && <p className="text-xs text-muted-foreground">{transaction.category?.[0] || "Uncategorized"}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                {extended && <TableCell>{transaction.category?.[0] || "Uncategorized"}</TableCell>}
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 font-medium ${transaction.amount > 0 ? "text-green-600" : ""}`}
                  >
                    {transaction.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`status-badge ${transaction.pending ? "pending" : "completed"}`}>
                    {transaction.pending ? "Pending" : "Completed"}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {extended && hasMore && !externalTransactions && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}

