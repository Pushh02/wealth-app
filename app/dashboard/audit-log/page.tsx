"use client"

import { useState } from "react"
import { AlertTriangle, Calendar, Check, CreditCard, Download, FileText, Search, Shield, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock audit log data
const auditLogs = [
  {
    id: "1",
    action: "Transaction Flagged",
    description: "International Transfer of $1,500.00 was flagged for review",
    date: "2023-03-23T14:32:00",
    user: "System",
    status: "flagged",
    details: "Unusual location detected",
  },
  {
    id: "2",
    action: "Transaction Approved",
    description: "Wire Transfer of $3,200.00 was approved",
    date: "2023-03-21T10:15:00",
    user: "Jane Smith",
    status: "approved",
    details: "Dual authorization completed",
  },
  {
    id: "3",
    action: "Transaction Rejected",
    description: "ATM Withdrawal of $800.00 was rejected",
    date: "2023-03-20T16:45:00",
    user: "Robert Johnson",
    status: "rejected",
    details: "Suspicious activity",
  },
  {
    id: "4",
    action: "Rule Created",
    description: "New dual authorization rule 'High-Value Transfers' was created",
    date: "2023-03-18T09:20:00",
    user: "John Doe",
    status: "system",
    details: "Threshold set to $1,000.00",
  },
  {
    id: "5",
    action: "Account Linked",
    description: "Chase Savings account was linked",
    date: "2023-03-15T11:30:00",
    user: "John Doe",
    status: "system",
    details: "Via Plaid API",
  },
]

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Filter logs based on search term and status filter
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || log.status === filterStatus

    return matchesSearch && matchesStatus
  })

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
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status" className="h-10 rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="date-range" placeholder="Select date range" className="pl-10 h-10 rounded-lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>{filteredLogs.length} entries found</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full">
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
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="transaction-row">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.action === "Transaction Flagged" && (
                          <div className="rounded-full bg-red-100 p-2 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        )}
                        {log.action === "Transaction Approved" && (
                          <div className="rounded-full bg-green-100 p-2 text-green-700">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        {log.action === "Transaction Rejected" && (
                          <div className="rounded-full bg-red-100 p-2 text-red-700">
                            <X className="h-4 w-4" />
                          </div>
                        )}
                        {log.action === "Rule Created" && (
                          <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                            <Shield className="h-4 w-4" />
                          </div>
                        )}
                        {log.action === "Account Linked" && (
                          <div className="rounded-full bg-purple-100 p-2 text-purple-700">
                            <CreditCard className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>
                      {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <span
                        className={`status-badge ${
                          log.status === "flagged"
                            ? "flagged"
                            : log.status === "approved"
                              ? "completed"
                              : log.status === "rejected"
                                ? "pending"
                                : ""
                        }`}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 rounded-full">
                        <FileText className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

