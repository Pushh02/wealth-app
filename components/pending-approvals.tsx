"use client"

import { Check, DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock pending approvals data
const pendingApprovals = [
  {
    id: "1",
    description: "International Transfer",
    amount: 1500.0,
    date: "2023-03-23",
    account: "Chase Savings",
    requestedBy: "John Doe",
    reason: "Dual authorization required for international transfers",
    status: "pending",
  },
  {
    id: "2",
    description: "Investment Purchase",
    amount: 5000.0,
    date: "2023-03-22",
    account: "Fidelity Investment",
    requestedBy: "John Doe",
    reason: "Dual authorization required for transactions over $2,500",
    status: "pending",
  },
  {
    id: "3",
    description: "Wire Transfer",
    amount: 3200.0,
    date: "2023-03-21",
    account: "Chase Checking",
    requestedBy: "John Doe",
    reason: "Dual authorization required for wire transfers",
    status: "pending",
  },
]

interface PendingApprovalsProps {
  extended?: boolean
}

export function PendingApprovals({ extended = false }: PendingApprovalsProps) {
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
            {pendingApprovals.map((approval) => (
              <TableRow key={approval.id} className="transaction-row">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{approval.description}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(approval.date).toLocaleDateString()}</TableCell>
                <TableCell>{approval.account}</TableCell>
                <TableCell>{approval.requestedBy}</TableCell>
                <TableCell className="max-w-[200px] truncate">{approval.reason}</TableCell>
                <TableCell className="text-right font-medium">${approval.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-full">
                      <Check className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                    <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                      <X className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingApprovals.map((approval) => (
        <div key={approval.id} className="gradient-border">
          <Card className="border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{approval.description}</h4>
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {approval.account} • {new Date(approval.date).toLocaleDateString()} •{" "}
                    <span className="font-medium">${approval.amount.toFixed(2)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Requested by:</span> {approval.requestedBy}
                  </p>
                  <div className="bg-muted/50 p-2 rounded-md text-sm">
                    <span className="font-medium">Reason:</span> {approval.reason}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-full">
                    <Check className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                    <X className="mr-1 h-3 w-3" />
                    Reject
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

