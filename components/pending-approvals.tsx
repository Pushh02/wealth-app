"use client"

import { Check, DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTransactions } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { useUser } from "@/context/user-context"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination"

interface PendingApprovalsProps {
  extended?: boolean
  transactions?: (AlertTransactions & {
    bankAccount: {
      name: string
    },
    violatedRule: {
      description: string
    }
    id: string
    transactionType: string
    createdAt: Date
    category: string
    amount: number
  })[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

export function PendingApprovals({ extended = false, transactions, pagination, onPageChange }: PendingApprovalsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useUser()

  const approveTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await axios.post(`/api/accounts/transactions/alert-transactions/${transactionId}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountDetails", "transactions"] })
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
      queryClient.invalidateQueries({ queryKey: ["accountDetails", "transactions"] })
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

  if (!transactions) {
    if (extended) {
      return (
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gradient-border">
            <Card className="border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  if (extended) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((transaction) => (
                <TableRow key={transaction.id} className="transaction-row">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{transaction.transactionType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.transactionType}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{transaction.bankAccount.name}</TableCell>
                  <TableCell className="text-right font-medium">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {(!transaction.isApproved && !transaction.isRejected && !transaction.approvedBy?.some(u => u === user?.id) && !transaction.rejectedBy?.some(u => u === user?.id)) && (<div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={() => handleApprove(transaction.id)}
                        disabled={approveTransactionMutation.isPending}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        {approveTransactionMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleReject(transaction.id)}
                        disabled={rejectTransactionMutation.isPending}
                      >
                        <X className="mr-1 h-3 w-3" />
                        {rejectTransactionMutation.isPending ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>)}
                    {(transaction.isApproved || transaction.approvedBy.some(u => u === user?.id)) && (<div className="flex items-center justify-center gap-2 bg-green-100 p-2 rounded-md text-sm text-green-600">
                      <span className="text-green-600">Approved</span>
                    </div>)}
                    {(transaction.isRejected || transaction.rejectedBy.some(u => u === user?.id)) && (<div className="flex items-center justify-center gap-2 bg-red-100 p-2 rounded-md text-sm text-red-600">
                      <span className="text-red-600">Rejected</span>
                    </div>)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange?.(page)}
                      isActive={page === pagination.page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions?.slice(0, 6).map((transaction) => (
        <div key={transaction.id} className="gradient-border">
          <Card className="border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.name}</h4>
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {transaction.bankAccount.name} • {new Date(transaction.createdAt).toLocaleDateString()} •{" "}
                    <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Requested by:</span> {transaction.bankAccount.name}
                  </p>
                  <div className="bg-muted/50 p-2 rounded-md text-sm">
                    <span className="font-medium">Reason:</span> {transaction.violatedRule?.description}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full"
                    onClick={() => handleApprove(transaction.id)}
                    disabled={approveTransactionMutation.isPending}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    {approveTransactionMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleReject(transaction.id)}
                    disabled={rejectTransactionMutation.isPending}
                  >
                    <X className="mr-1 h-3 w-3" />
                    {rejectTransactionMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
