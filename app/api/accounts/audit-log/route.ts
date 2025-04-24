import { NextRequest, NextResponse } from "next/server"
import { verifyUser } from "@/utils/verify-user"
import prisma from "@/lib/prisma"
import { decrypt } from "@/utils/Cryptography/decrypt"
import plaidClient from "@/lib/plaid"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    const user = await verifyUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: {
        email: user.email?.toLowerCase()
      }
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        OR: [
          { userId: userData.id },
          { approvers: { some: { id: userData.id } } }
        ]
      },
      include: {
        bankAccount: true
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Get Plaid transactions
    const plaidTransactions = await plaidClient.transactionsGet({
      access_token: decrypt(account.bankAccount?.accessToken || ""),
      start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    })

    // Get Alert transactions
    const alertTransactions = await prisma.alertTransactions.findMany({
      where: {
        bankAccountId: account.bankAccount?.id,
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
          lte: endDate ? new Date(endDate) : new Date(),
        }
      },
      include: {
        violatedRule: true,
        bankAccount: true,
      }
    })

    // Combine and format transactions
    const combinedTransactions = [
      ...plaidTransactions.data.transactions.map(txn => ({
        id: txn.transaction_id,
        type: 'plaid',
        name: txn.name,
        amount: txn.amount,
        date: txn.date,
        category: txn.category,
        account: txn.account_id,
        status: 'completed',
        createdAt: new Date(txn.date)
      })),
      ...alertTransactions.map(txn => ({
        id: txn.id,
        type: 'alert',
        name: txn.name,
        amount: txn.amount,
        date: txn.createdAt,
        category: txn.category,
        account: txn.bankAccount.name,
        status: txn.isApproved ? 'approved' : txn.isRejected ? 'rejected' : 'pending',
        createdAt: txn.createdAt,
        violatedRule: txn.violatedRule
      }))
    ]

    // Apply search filter
    const searchFilteredTransactions = search
      ? combinedTransactions.filter(txn =>
          txn.name.toLowerCase().includes(search.toLowerCase()) ||
          (Array.isArray(txn.category) ? txn.category.join(' ').toLowerCase() : txn.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
          txn.amount.toString().toLowerCase().includes(search.toLowerCase())
        )
      : combinedTransactions

    // Apply status filter
    const statusFilteredTransactions = status !== 'all'
      ? searchFilteredTransactions.filter(txn => txn.status === status)
      : searchFilteredTransactions

    // Sort by creation date
    statusFilteredTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedTransactions = statusFilteredTransactions.slice(start, end)

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: {
        total: statusFilteredTransactions.length,
        page,
        limit,
        totalPages: Math.ceil(statusFilteredTransactions.length / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error("[AUDIT_LOG]", error)
    return NextResponse.json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
