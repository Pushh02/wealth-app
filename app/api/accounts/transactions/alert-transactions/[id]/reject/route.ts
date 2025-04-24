import { verifyUser } from "@/utils/verify-user"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const transactionId = (await params).id
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



        // Verify the transaction exists and belongs to the user's account
        const transaction = await prisma.alertTransactions.findFirst({
            where: {
                id: transactionId,
                bankAccount: {
                    account: {
                        approvers: {
                            some: {
                                id: userData.id
                            }
                        }
                    }
                }
            },
            include: {
                bankAccount: {
                    include: {
                        account: {
                            include: {
                                approvers: true
                            }
                        }
                    }
                }
                
            }
        })

        if (!transaction) {
            console.log("Transaction not found or unauthorized:", transactionId)
            return NextResponse.json({
                error: "Transaction not found or you don't have permission to approve it"
            }, { status: 404 })
        }

        const isAlreadyRejected = transaction.rejectedBy.some(user => user === userData.id)

        if (isAlreadyRejected) {
            return NextResponse.json({
                error: "This transaction has already been rejected"
            }, { status: 400 })
        }

        const rejectedBy = [...transaction.rejectedBy, userData.id]

        const isRejectedByAll = rejectedBy.every(user => transaction.bankAccount.account.approvers.some(approver => approver.id === user))
        const approvedBy = transaction.approvedBy.filter(user => user !== userData.id)

        // Update the transaction to mark it as approved
        await prisma.alertTransactions.update({
            where: { id: transactionId },
            data: {
                isRejected: isRejectedByAll,
                rejectedBy: {
                    push: userData.id
                },
                approvedBy: approvedBy,
                isApproved: false
            }
        })

        console.log("Transaction approved successfully:", transactionId)
        return NextResponse.json({ message: "Transaction approved successfully" }, { status: 200 })
    } catch (error) {
        console.error("[TRANSACTION_APPROVE]", error)
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
