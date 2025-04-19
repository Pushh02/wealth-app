"use client"

import { DollarSign, ExternalLink, CreditCard, BarChart } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Mock accounts data
const accounts = [
  {
    id: "1",
    name: "Chase Checking",
    type: "checking",
    balance: 12450.65,
    institution: "Chase",
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Chase Savings",
    type: "savings",
    balance: 25780.42,
    institution: "Chase",
    lastUpdated: "2 hours ago",
  },
  {
    id: "3",
    name: "Fidelity Investment",
    type: "investment",
    balance: 7000.82,
    institution: "Fidelity",
    lastUpdated: "1 day ago",
  },
]

export function AccountsOverview() {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  // Update the AccountsOverview component with a more modern design
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/30 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Manage your connected financial accounts</CardDescription>
        </div>
        <Button className="gradient-bg text-white shadow-sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Link New Account
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {accounts.map((account) => (
            <div key={account.id} className="account-card p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    {account.type === "checking" && <CreditCard className="h-5 w-5 text-primary" />}
                    {account.type === "savings" && <DollarSign className="h-5 w-5 text-green-600" />}
                    {account.type === "investment" && <BarChart className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground">
                        {account.institution} • Updated {account.lastUpdated}
                      </span>
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {account.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${account.balance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((account.balance / totalBalance) * 100)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4 bg-muted/30 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Distribution</span>
            <span className="text-sm font-medium">Total: ${totalBalance.toLocaleString()}</span>
          </div>
          {accounts.map((account) => (
            <div key={account.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{account.name}</span>
                <span className="font-medium">{Math.round((account.balance / totalBalance) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((account.balance / totalBalance) * 100)}%`,
                    background:
                      account.type === "checking"
                        ? "var(--gradient-primary)"
                        : account.type === "savings"
                          ? "var(--gradient-success)"
                          : "var(--gradient-secondary)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard/accounts">
            Manage All Accounts
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

