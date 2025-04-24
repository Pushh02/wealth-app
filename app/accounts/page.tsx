"use client"

import { CreditCard, ArrowRight, Wallet, LogOut } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkAccountDialog } from "@/components/link-account-dialog"
import { useUser } from "@/context/user-context"

interface Account {
  id: string
  name: string
  type: string
  balance: number
  lastFour: string
  institution: string
  userRole: string
  email: string
  role: string
}

export default function AccountsPage() {
  const { setUser, user } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => axios.get("/api/accounts").then((res) => res.data),
  });
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-start">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }


  const handleViewDetails = (account: any) => {
    setUser({
      email: accounts.userEmail,
      role: account.userRole as "primary" | "approver",
      accountId: account.id
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-bold tracking-tight gradient-text">Your Accounts</h2>
            <p className="text-muted-foreground mt-1">Manage and monitor all your linked accounts in one place.</p>
          </div>
          <Button onClick={handleLogout}><LogOut className="h-4 w-4" />Logout</Button>
        </div>

        {accounts.accounts.length === 0 ? (
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
            <LinkAccountDialog />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <LinkAccountDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.accounts.map((account: Account) => (
                <Card key={account.id} className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="border-b bg-muted/30 px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{account.institution}</CardDescription>
                        <div className="mt-1">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                            {account.userRole}
                          </span>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="border-t bg-muted/30 px-6 py-4">
                    <Button variant="outline" asChild className="w-full" onClick={() => handleViewDetails(account)}>
                      <Link href={`/dashboard/${account.id}`}>
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
