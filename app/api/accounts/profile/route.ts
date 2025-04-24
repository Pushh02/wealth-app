import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyUser } from "@/utils/verify-user"

export async function GET(request: NextRequest) {
    try {
        const user = await verifyUser()
        const { searchParams } = new URL(request.url)
        const accountId = searchParams.get("accountId")

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userData = await prisma.user.findFirst({
            where: {
                email: {
                    equals: user.email,
                    mode: "insensitive"
                }
            },
            include: {
                accounts: {
                    include: {
                        bankAccount: true,
                        approvers: true
                    }
                }
            }
        })

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const account = userData.accounts.find(account => account.id === accountId)

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 })
        }

        return NextResponse.json({
            bankAccountsCount: userData.accounts.length,
            approversInfo: account.approvers.map((approver) => ({
                id: approver.id,
                name: approver.name,
                email: approver.email,
            }))
        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyUser()
        const { searchParams } = new URL(request.url)
        const accountId = searchParams.get("accountId")

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
        }

        await prisma.account.delete({
            where: {
                id: accountId,
                user: {
                    email: {
                        equals: user.email,
                        mode: "insensitive"
                    }
                }
            }
        })
        
        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 })
    } catch (err) {
        console.log(err)
    }
}