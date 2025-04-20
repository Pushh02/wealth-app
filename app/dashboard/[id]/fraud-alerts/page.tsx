"use client"
import { AlertTriangle, Calendar, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Reuse the FraudAlerts component with extended view
import { FraudAlerts } from "@/components/fraud-alerts"

export default function FraudAlertsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Fraud Alerts</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fraud Detection</h2>
            <p className="text-muted-foreground">Review and manage suspicious activities</p>
          </div>
          <Button variant="outline">
            <AlertTriangle className="mr-2 h-4 w-4" /> Configure Alert Rules
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter fraud alerts by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search-alerts">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="search-alerts" placeholder="Search alerts" className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range-alerts">Date Range</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="date-range-alerts" placeholder="Select date range" className="pl-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fraud Alerts</CardTitle>
              <CardDescription>Review and manage suspicious activities</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <FraudAlerts extended />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

