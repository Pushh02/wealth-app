"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Calendar, Check, CreditCard, Download, FileText, Search, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useUser } from "@/context/user-context"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { useDebounce } from "@/hooks/use-debounce"

const convertToCSV = (transactions: any[]) => {
  const headers = [
    "Transaction ID",
    "Type",
    "Name",
    "Amount",
    "Date",
    "Category",
    "Account",
    "Status",
    "Created At",
    "Violated Rule"
  ]

  const rows = transactions.map(txn => [
    txn.id,
    txn.type,
    txn.name,
    txn.amount,
    txn.date,
    Array.isArray(txn.category) ? txn.category.join(" > ") : txn.category,
    txn.account,
    txn.status,
    new Date(txn.createdAt).toLocaleString(),
    txn.violatedRule?.description || ""
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n")

  return csvContent
}

const downloadCSV = (transactions: any[]) => {
  const csvContent = convertToCSV(transactions)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `audit-transactions-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AuditLogPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [date, setDate] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const limit = 10

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, filterStatus, date])

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["auditLogs", user?.accountId, page, limit, debouncedSearchTerm, filterStatus, date],
    queryFn: async () => {
      const params = new URLSearchParams({
        accountId: user?.accountId || "",
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearchTerm,
        status: filterStatus,
      })

      if (date.from) {
        params.append("startDate", date.from.toISOString())
      }
      if (date.to) {
        params.append("endDate", date.to.toISOString())
      }

      const response = await axios.get(`/api/accounts/audit-log?${params.toString()}`)
      return response.data
    },
    enabled: !!user?.accountId
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusChange = (value: string) => {
    setFilterStatus(value)
  }

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate || { from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed'
      case 'approved':
        return 'completed'
      case 'rejected':
        return 'pending'
      case 'pending':
        return 'flagged'
      default:
        return ''
    }
  }

  const getActionIcon = (type: string, status: string) => {
    if (type === 'alert') {
      if (status === 'approved') {
        return <Check className="h-4 w-4" />
      } else if (status === 'rejected') {
        return <X className="h-4 w-4" />
      } else {
        return <AlertTriangle className="h-4 w-4" />
      }
    } else {
      return <CreditCard className="h-4 w-4" />
    }
  }

  const getActionColor = (type: string, status: string) => {
    if (type === 'alert') {
      if (status === 'approved') {
        return 'bg-green-100 text-green-700'
      } else if (status === 'rejected') {
        return 'bg-red-100 text-red-700'
      } else {
        return 'bg-yellow-100 text-yellow-700'
      }
    } else {
      return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Audit Log</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Activity Audit Log</h2>
          <p className="text-muted-foreground mt-1">
            Track all system activities, flagged transactions, and user actions
          </p>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg mb-8">
          <CardHeader className="border-b bg-muted/30 px-6">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Narrow down the audit log entries</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by action, description, or user"
                    className="pl-10 h-10 rounded-lg"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status" className="h-10 rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <DateRangePicker
                  value={date}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 px-6 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>{auditLogs?.pagination?.total || 0} entries found</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full md:w-auto w-full mt-4 md:mt-0" onClick={() => downloadCSV(auditLogs?.transactions || [])} disabled={!auditLogs?.transactions?.length}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  auditLogs?.transactions.map((log: any) => (
                    <TableRow key={log.id} className="transaction-row">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full p-2 ${getActionColor(log.type, log.status)}`}>
                            {getActionIcon(log.type, log.status)}
                          </div>
                          <span className="font-medium">
                            {log.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>
                        {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>${log.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`status-badge ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-full"
                          onClick={() => setSelectedTransaction(log)}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {auditLogs?.pagination && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((auditLogs.pagination.page - 1) * auditLogs.pagination.limit) + 1} to {Math.min(auditLogs.pagination.page * auditLogs.pagination.limit, auditLogs.pagination.total)} of {auditLogs.pagination.total} results
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(auditLogs.pagination.page - 1)}
                        disabled={auditLogs.pagination.page === 1}
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    {Array.from({ length: auditLogs.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={pageNum === auditLogs.pagination.page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(auditLogs.pagination.page + 1)}
                        disabled={auditLogs.pagination.page === auditLogs.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedTransaction && (
        <TransactionDetailsDialog
          transaction={selectedTransaction}
          open={!!selectedTransaction}
          onOpenChange={(open) => !open && setSelectedTransaction(null)}
        />
      )}
    </div>
  )
}

