"use client"
import { Calendar, Check, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Reuse the PendingApprovals component with extended view
import { PendingApprovals } from "@/components/pending-approvals"

export default function ApprovalPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Transaction Approval</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve or reject transactions requiring dual authorization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter pending approvals by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search-approvals">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="search-approvals" placeholder="Search approvals" className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-approvals">Account</Label>
                <Select>
                  <SelectTrigger id="account-approvals">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    <SelectItem value="checking">Chase Checking</SelectItem>
                    <SelectItem value="savings">Chase Savings</SelectItem>
                    <SelectItem value="investment">Fidelity Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range-approvals">Date Range</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="date-range-approvals" placeholder="Select date range" className="pl-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transactions Requiring Approval</CardTitle>
              <CardDescription>Review and take action on pending transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Check className="mr-2 h-4 w-4 text-green-600" /> Approve All
              </Button>
              <Button variant="outline" size="sm">
                <X className="mr-2 h-4 w-4 text-destructive" /> Reject All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PendingApprovals extended />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

