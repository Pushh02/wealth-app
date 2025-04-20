import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }

        const alertTransactions = await prisma.alertTransactions.findMany({
            where: {
                bankAccount: {
                    accountId: accountId,
                },
            },
            include: {
                violatedRule: true,
            },
        });

        return NextResponse.json({ alertTransactions }, { status: 200 });
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
                id: transactionId,
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