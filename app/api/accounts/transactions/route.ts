import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import plaidClient from "@/lib/plaid";
import { decrypt } from "@/utils/Cryptography/decrypt";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const accountIds = searchParams.get("accountIds");

    if (!startDate) {
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10);
    }

    if (!endDate) {
        endDate = new Date().toISOString().slice(0, 10);
    }

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
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const account = await prisma.account.findFirst({
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

    try {
        const response = await plaidClient.transactionsGet({
            access_token: decrypt(account.bankAccount[0].accessToken || ""),
            start_date: startDate,
            end_date: endDate,
            options: {
                offset: offset,
                account_ids: accountIds ? accountIds.split(",") : undefined,
            },
        });

        const total_transactions = response.data.total_transactions;
        const has_more = response.data.transactions.length < total_transactions;
        const next_offset = has_more ? offset + response.data.transactions.length : null;

        return NextResponse.json({
            transactions: response.data.transactions,
            total_transactions,
            has_more,
            next_offset,
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}