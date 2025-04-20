"use client"

import { useState } from "react"
import { Check, Plus, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock approvers data
const approvers = [
  { id: "1", name: "Jane Smith", email: "jane.smith@example.com", role: "Finance Manager" },
  { id: "2", name: "Robert Johnson", email: "robert.johnson@example.com", role: "Accounting Director" },
]

// Mock dual authorization rules
const dualAuthRules = [
  {
    id: "1",
    name: "High-Value Transfers",
    threshold: 1000,
    transactionTypes: ["Transfer", "Wire"],
    approvers: ["Jane Smith", "Robert Johnson"],
    active: true,
  },
  {
    id: "2",
    name: "International Transactions",
    threshold: 500,
    transactionTypes: ["International Transfer"],
    approvers: ["Jane Smith"],
    active: true,
  },
  {
    id: "3",
    name: "Investment Purchases",
    threshold: 2500,
    transactionTypes: ["Investment"],
    approvers: ["Robert Johnson"],
    active: false,
  },
]

export default function DualAuthPage() {
  const [showAddRule, setShowAddRule] = useState(false)

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Dual Authorization</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Dual Authorization Settings</h2>
            <p className="text-muted-foreground mt-1">
              Configure rules for transactions that require additional approval
            </p>
          </div>
          <Button onClick={() => setShowAddRule(!showAddRule)} className="gradient-bg text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add New Rule
          </Button>
        </div>

        {showAddRule && (
          <Card className="overflow-hidden border-0 shadow-lg mb-8">
            <CardHeader className="border-b bg-muted/30 px-6">
              <CardTitle>Create New Rule</CardTitle>
              <CardDescription>Define when transactions require dual authorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="e.g., High-Value Transfers" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Amount Threshold ($)</Label>
                  <Input id="threshold" type="number" placeholder="1000" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-types">Transaction Types</Label>
                  <Select>
                    <SelectTrigger id="transaction-types" className="h-10">
                      <SelectValue placeholder="Select transaction types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="wire">Wire</SelectItem>
                      <SelectItem value="international">International Transfer</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvers">Required Approvers</Label>
                  <Select>
                    <SelectTrigger id="approvers" className="h-10">
                      <SelectValue placeholder="Select approvers" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.map((approver) => (
                        <SelectItem key={approver.id} value={approver.id}>
                          {approver.name} ({approver.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-xl">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active" className="font-medium">
                  Rule Active
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-4">
              <Button variant="outline" onClick={() => setShowAddRule(false)}>
                Cancel
              </Button>
              <Button className="gradient-bg text-white shadow-sm">
                <Shield className="mr-2 h-4 w-4" /> Create Rule
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="overflow-hidden border-0 shadow-lg mb-8">
          <CardHeader className="border-b bg-muted/30 px-6">
            <CardTitle>Current Rules</CardTitle>
            <CardDescription>Manage your existing dual authorization rules</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Transaction Types</TableHead>
                  <TableHead>Approvers</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dualAuthRules.map((rule) => (
                  <TableRow key={rule.id} className="transaction-row">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{rule.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${rule.threshold.toLocaleString()}</TableCell>
                    <TableCell>{rule.transactionTypes.join(", ")}</TableCell>
                    <TableCell>{rule.approvers.join(", ")}</TableCell>
                    <TableCell className="text-center">
                      {rule.active ? (
                        <span className="status-badge completed">
                          <Check className="mr-1 h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="status-badge">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 rounded-full">
                          Edit
                        </Button>
                        <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Approvers</CardTitle>
              <CardDescription>Manage users who can approve transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full">
              <Users className="mr-2 h-4 w-4" /> Add Approver
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvers.map((approver) => (
                  <TableRow key={approver.id} className="transaction-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{approver.name.charAt(0)}</span>
                        </div>
                        <div className="font-medium">{approver.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{approver.email}</TableCell>
                    <TableCell>{approver.role}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                        Remove
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

