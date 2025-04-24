"use client"

import { AlertTriangle, Eye, ShieldAlert, ThumbsDown, ThumbsUp, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/context/user-context"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

interface FraudAlertsProps {
  accountId: string
  extended?: boolean
  searchQuery?: string
  severity?: string
  dateRange?: { start: Date; end: Date }
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AlertTransaction {
  id: string
  transactionType: string
  createdAt: string
  amount: number
  isApproved: boolean
  isRejected: boolean
  bankAccount: {
    name: string
  }
  violatedRule?: {
    severity: string
    description: string
    name: string
    threshold: number
  }
}

export function FraudAlerts({ accountId, extended = false, searchQuery = "", severity = "all", dateRange }: FraudAlertsProps) {
  const { user } = useUser()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRule, setSelectedRule] = useState<any>(null)
  const limit = 10

  const fraudAlerts = useQuery({
    queryKey: ["fraud-alerts", accountId, searchQuery, severity, dateRange, currentPage],
    queryFn: () => {
      const params = new URLSearchParams({
        accountId,
        search: searchQuery,
        severity,
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(dateRange && {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        })
      })
      return axios.get(`/api/accounts/fraud-alert?${params}`).then((res) => res.data)
    },
    enabled: !!user?.accountId
  })

  const pagination = fraudAlerts.data?.pagination as PaginationInfo | undefined

  if (fraudAlerts.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
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

  if (fraudAlerts.isError) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-destructive">Error loading fraud alerts</div>
        </CardContent>
      </Card>
    )
  }

  const transactions = fraudAlerts.data?.transactions || []

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No fraud alerts found
      </div>
    )
  }

  if (extended) {
    return (
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Severity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((alert: AlertTransaction) => (
              <TableRow key={alert.id} className="transaction-row">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{alert.transactionType}</span>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(alert.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>{alert.bankAccount.name}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="sm"
                        className="h-8 rounded-full hover:bg-gray-100"
                        onClick={() => setSelectedRule(alert.violatedRule)}
                      >
                        <Info className="mr-1.5 h-3.5 w-3.5 text-gray-600" />
                        <span className="text-sm font-medium">View Rule</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-[425px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold">
                          Rule Details
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-1">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">Threshold Amount</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            ${alert.violatedRule?.threshold.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">Rule Description</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {alert.violatedRule?.description}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">Rule Name</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {alert.violatedRule?.name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">Severity</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {alert.violatedRule?.severity}
                          </p>
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          onClick={() => setSelectedRule(null)}
                          className="hover:bg-gray-50"
                        >
                          Close
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
                <TableCell className="text-right font-medium">${alert.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={alert.violatedRule?.severity === "high" ? "destructive" : "secondary"}
                  >
                    {alert.violatedRule?.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className={`text-sm px-2 rounded-full ${alert.isApproved ? "bg-green-200 text-green-700" : alert.isRejected ? "bg-red-200 text-red-700" : "bg-yellow-200 text-yellow-700"}`}>{alert.isApproved ? "Approved" : alert.isRejected ? "Rejected" : "Pending"}</p>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.total)} of {pagination.total} alerts
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 2).map((alert: AlertTransaction) => (
        <div key={alert.id} className="gradient-border">
          <Card className="border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{alert.transactionType}</h4>
                      <Badge
                        variant={alert.violatedRule?.severity === "high" ? "destructive" : "secondary"}
                      >
                        {alert.violatedRule?.severity} severity
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.bankAccount.name} • {format(new Date(alert.createdAt), "MMM d, yyyy")} •{" "}
                    <span className="font-medium">${alert.amount.toFixed(2)}</span>
                  </p>
                  <div className="bg-muted/50 p-2 rounded-md text-sm">
                    <span className="font-medium">Reason:</span> {alert.violatedRule?.description}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-full">
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    Legitimate
                  </Button>
                  <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                    <ThumbsDown className="mr-1 h-3 w-3" />
                    Fraudulent
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

