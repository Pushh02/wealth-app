import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }

        const skip = (page - 1) * limit;

        const [alertTransactions, total] = await Promise.all([
            prisma.alertTransactions.findMany({
                where: {
                    bankAccount: {
                        accountId: accountId,
                    },
                },
                include: {
                    violatedRule: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.alertTransactions.count({
                where: {
                    bankAccount: {
                        accountId: accountId,
                    },
                },
            })
        ]);

        const sortedAlertTransactions = alertTransactions.sort((a, b) => {
            if (!a.isApproved && !a.isRejected && (b.isApproved || b.isRejected)) return -1;
            if (!b.isApproved && !b.isRejected && (a.isApproved || a.isRejected)) return 1;
            return 0;
        });

        return NextResponse.json({ 
            alertTransactions: sortedAlertTransactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error getting alert transactions:", error);
        return NextResponse.json({ error: "Failed to get alert transactions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const { transactionId, amount, transactionType, category, violatedRuleId } = await request.json();

        if (!accountId || !transactionId) {
            return NextResponse.json({ error: "Account ID and transaction ID are required" }, { status: 400 });
        }

        const user = await verifyUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = await prisma.user.findFirst({
            where: {
                email: {
                    equals: user.email,
                    mode: "insensitive",
                },
            },
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const account = await prisma.account.findFirst({
            where: {
                id: accountId,
                userId: userData.id,
            },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const transaction = await prisma.alertTransactions.create({
            data: {
                bankAccount: {
                    connect: {
                        accountId: account.id,
                    },
                },
                transactionId: transactionId,
                amount: amount,
                transactionType: transactionType,
                category: category,
                violatedRuleId,
            },
        });

        return NextResponse.json({ message: "Transaction approved" }, { status: 200 });

    } catch (error) {
        console.error("Error approving transaction:", error);
        return NextResponse.json({ error: "Failed to approve transaction" }, { status: 500 });
    }
}