"use client"

import { ArrowDownLeft, ArrowUpRight, CreditCard, DollarSign, ShoppingCart } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock transactions data
const transactions = [
  {
    id: "1",
    description: "Amazon.com",
    amount: -82.99,
    date: "2023-03-26",
    account: "Chase Checking",
    category: "Shopping",
    status: "completed",
    icon: ShoppingCart,
  },
  {
    id: "2",
    description: "Salary Deposit",
    amount: 2850.0,
    date: "2023-03-25",
    account: "Chase Checking",
    category: "Income",
    status: "completed",
    icon: DollarSign,
  },
  {
    id: "3",
    description: "Starbucks",
    amount: -4.5,
    date: "2023-03-24",
    account: "Chase Checking",
    category: "Food & Drink",
    status: "completed",
    icon: CreditCard,
  },
  {
    id: "4",
    description: "International Transfer",
    amount: -1500.0,
    date: "2023-03-23",
    account: "Chase Savings",
    category: "Transfer",
    status: "flagged",
    icon: CreditCard,
  },
  {
    id: "5",
    description: "Netflix Subscription",
    amount: -15.99,
    date: "2023-03-22",
    account: "Chase Checking",
    category: "Entertainment",
    status: "completed",
    icon: CreditCard,
  },
]

interface RecentTransactionsProps {
  extended?: boolean
}

export function RecentTransactions({ extended = false }: RecentTransactionsProps) {
  const displayTransactions = extended ? transactions : transactions.slice(0, 3)

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            {extended && (
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
            )}
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            {extended && <TableHead>Category</TableHead>}
            {extended && <TableHead>Account</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayTransactions.map((transaction) => (
            <TableRow key={transaction.id} className="transaction-row">
              {extended && (
                <TableCell>
                  <Checkbox />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      transaction.category === "Shopping"
                        ? "bg-purple-100 text-purple-700"
                        : transaction.category === "Income"
                          ? "bg-green-100 text-green-700"
                          : transaction.category === "Food & Drink"
                            ? "bg-orange-100 text-orange-700"
                            : transaction.category === "Transfer"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <transaction.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium">{transaction.description}</span>
                    {!extended && <p className="text-xs text-muted-foreground">{transaction.category}</p>}
                  </div>
                </div>
              </TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              {extended && <TableCell>{transaction.category}</TableCell>}
              {extended && <TableCell>{transaction.account}</TableCell>}
              <TableCell className="text-right">
                <div
                  className={`flex items-center justify-end gap-1 font-medium ${transaction.amount > 0 ? "text-green-600" : ""}`}
                >
                  {transaction.amount > 0 ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {transaction.status === "flagged" ? (
                  <span className="status-badge flagged">Flagged</span>
                ) : (
                  <span className="status-badge completed">Completed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

