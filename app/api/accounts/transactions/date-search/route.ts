import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import plaidClient from "@/lib/plaid";
import { decrypt } from "@/utils/Cryptography/decrypt";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!accountId || !startDate || !endDate) {
            return NextResponse.json({ error: "Account ID, start date, and end date are required" }, { status: 400 });
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

        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                userId: userData.id,
            },
            include: {
                bankAccount: true,
            },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const accessToken = decrypt(account.bankAccount?.accessToken || "");
        let allTransactions: any[] = [];

        try {
            const response = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
            });

            let transactions = response.data.transactions;
            const total_transactions = response.data.total_transactions;
            allTransactions = transactions;

            // Paginate through all transactions
            while (transactions.length < total_transactions) {
                const paginatedResponse = await plaidClient.transactionsGet({
                    access_token: accessToken,
                    start_date: startDate,
                    end_date: endDate,
                    options: {
                        offset: transactions.length,
                    },
                });
                transactions = transactions.concat(paginatedResponse.data.transactions);
                allTransactions = transactions;
            }

            return NextResponse.json({ 
                added: allTransactions,
                has_more: false,
                next_cursor: null
            }, { status: 200 });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}