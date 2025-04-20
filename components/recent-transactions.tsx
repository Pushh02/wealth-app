"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, CreditCard, DollarSign, ShoppingCart } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface Transaction {
  transaction_id: string
  merchant_name: string
  amount: number
  date: string
  category: string[]
  status: string
}

interface RecentTransactionsProps {
  extended?: boolean
  accountId: string
}

export function RecentTransactions({ extended = false, accountId }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const pathname = usePathname()

  const fetchTransactions = async (offset = 0) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accounts/transactions?accountId=${accountId}&offset=${offset}`)
      const data = await response.json()
      
      if (offset === 0) {
        setTransactions(data.transactions)
      } else {
        setTransactions(prev => [...prev, ...data.transactions])
      }
      
      setHasMore(data.has_more)
      setNextOffset(data.next_offset)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [accountId])

  const loadMore = () => {
    if (nextOffset !== null) {
      fetchTransactions(nextOffset)
    }
  }

  const getCategoryIcon = (category: string[]) => {
    if (category.includes("Shopping")) return ShoppingCart
    if (category.includes("Income")) return DollarSign
    if (category.includes("Food and Drink")) return CreditCard
    return CreditCard
  }

  const displayTransactions = extended ? transactions : transactions.slice(0, 3)

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
            const Icon = getCategoryIcon(transaction.category)
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
                        transaction.category.includes("Shopping")
                          ? "bg-purple-100 text-purple-700"
                          : transaction.category.includes("Income")
                            ? "bg-green-100 text-green-700"
                            : transaction.category.includes("Food and Drink")
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium">{transaction.merchant_name || "Unknown"}</span>
                      {!extended && <p className="text-xs text-muted-foreground">{transaction.category[0]}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                {extended && <TableCell>{transaction.category[0]}</TableCell>}
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
                  <span className={`status-badge ${transaction.status === "pending" ? "flagged" : "completed"}`}>
                    {transaction.status === "pending" ? "Pending" : "Completed"}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {extended && hasMore && (
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

