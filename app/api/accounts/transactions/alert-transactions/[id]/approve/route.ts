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
        console.log("Attempting to approve transaction:", transactionId)

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

        const isAlreadyApproved = transaction.approvedBy.some(user => user === userData.id)

        if (isAlreadyApproved) {
            return NextResponse.json({
                error: "This transaction has already been approved"
            }, { status: 400 })
        }

        const approvedBy = [...transaction.approvedBy, userData.id]

        const isApprovedByAll = approvedBy.every(user => transaction.bankAccount.account.approvers.some(approver => approver.id === user))
        const rejectedBy = transaction.rejectedBy.filter(user => user !== userData.id)

        // Update the transaction to mark it as approved
        await prisma.alertTransactions.update({
            where: { id: transactionId },
            data: {
                isApproved: isApprovedByAll,
                approvedBy: {
                    push: userData.id
                },
                rejectedBy: rejectedBy,
                isRejected: false
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
