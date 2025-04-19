"use client"

import { AlertTriangle, Eye, ShieldAlert, ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock fraud alerts data
const fraudAlerts = [
  {
    id: "1",
    description: "International Transfer",
    amount: 1500.0,
    date: "2023-03-23",
    account: "Chase Savings",
    reason: "Unusual location",
    severity: "high",
    status: "pending",
  },
  {
    id: "2",
    description: "ATM Withdrawal",
    amount: 800.0,
    date: "2023-03-22",
    account: "Chase Checking",
    reason: "Unusual amount",
    severity: "medium",
    status: "pending",
  },
]

interface FraudAlertsProps {
  extended?: boolean
}

export function FraudAlerts({ extended = false }: FraudAlertsProps) {
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
            {fraudAlerts.map((alert) => (
              <TableRow key={alert.id} className="transaction-row">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-red-100 p-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{alert.description}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(alert.date).toLocaleDateString()}</TableCell>
                <TableCell>{alert.account}</TableCell>
                <TableCell>{alert.reason}</TableCell>
                <TableCell className="text-right font-medium">${alert.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`status-badge ${
                      alert.severity === "high" ? "flagged" : alert.severity === "medium" ? "pending" : "completed"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-full">
                      <Eye className="mr-1 h-3 w-3" />
                      Details
                    </Button>
                    <Button size="sm" className="h-8 rounded-full bg-red-600 hover:bg-red-700">
                      <ShieldAlert className="mr-1 h-3 w-3" />
                      Report
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
      {fraudAlerts.map((alert) => (
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
                      <h4 className="font-medium">{alert.description}</h4>
                      <span
                        className={`status-badge ${
                          alert.severity === "high" ? "flagged" : alert.severity === "medium" ? "pending" : "completed"
                        }`}
                      >
                        {alert.severity} severity
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.account} • {new Date(alert.date).toLocaleDateString()} •{" "}
                    <span className="font-medium">${alert.amount.toFixed(2)}</span>
                  </p>
                  <div className="bg-muted/50 p-2 rounded-md text-sm">
                    <span className="font-medium">Reason:</span> {alert.reason}
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

