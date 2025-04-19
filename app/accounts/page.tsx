"use client"

import { Plus, CreditCard, DollarSign, ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  lastFour: string
  institution: string
}

// Mock data - in a real app, this would come from an API
const mockAccounts: Account[] = []

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Your Accounts</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all your linked accounts in one place.</p>
        </div>

        {mockAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">No Accounts Found</h3>
              <p className="text-muted-foreground max-w-md">
                There are no accounts linked to your profile. Create an account to start using the application and manage your finances.
              </p>
            </div>
            <Button className="gradient-bg text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Link New Account
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <Button className="gradient-bg text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" /> Link New Account
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockAccounts.map((account) => (
                <Card key={account.id} className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="border-b bg-muted/30 px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{account.institution}</CardDescription>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Account Type</span>
                        <span className="font-medium capitalize">{account.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Account Number</span>
                        <span className="font-medium">•••• {account.lastFour}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold text-lg">
                            {account.balance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 px-6 py-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/accounts/${account.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
