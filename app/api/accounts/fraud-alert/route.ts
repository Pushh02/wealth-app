import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/utils/verify-user";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const searchQuery = searchParams.get("search")?.toLowerCase() || "";
        const severity = searchParams.get("severity") || "all";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
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
            return NextResponse.json({ error: "User/Account/Alert Transactions not found" }, { status: 404 });
        }

        const account = await prisma.account.findFirst({
            where: {
                id: accountId,
                OR: [
                    {
                        userId: userData.id,
                    },
                    {
                        approvers: { some: { id: userData.id } },
                    },
                ],
            },
            include: {
                bankAccount: {
                    include: {
                        alertTransactions: {
                            include: {
                                violatedRule: true,
                                bankAccount: true,
                            },
                        },
                    },
                },
            },
        });
        
        

        let transactions = account?.bankAccount?.alertTransactions;

        // Apply search filter
        if (searchQuery) {
            transactions = transactions?.filter(transaction => 
                transaction.transactionType?.toLowerCase().includes(searchQuery) ||
                transaction.bankAccount.name?.toLowerCase().includes(searchQuery) ||
                transaction.amount.toString().includes(searchQuery)
            );
        }

        // Apply severity filter
        if (severity !== "all") {
            transactions = transactions?.filter(transaction => {
                const amount = Math.abs(transaction.amount);
                const threshold = transaction.violatedRule?.threshold || 0;
                
                if (severity === "high") {
                    return amount > threshold;
                } else if (severity === "medium") {
                    return amount <= threshold && amount > threshold / 2;
                } else if (severity === "low") {
                    return amount <= threshold / 2;
                }
                return true;
            });
        }

        // Apply pagination
        const total = transactions?.length || 0;
        const paginatedTransactions = transactions?.slice(skip, skip + limit);

        return NextResponse.json({ 
            transactions: paginatedTransactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}