import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import plaidClient from "@/lib/plaid";
import { decrypt } from "@/utils/Cryptography/decrypt";
import { Transaction, RemovedTransaction } from "plaid";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const cursor = searchParams.get("cursor");

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

    if (!account.bankAccount?.accessToken) {
        return NextResponse.json({ error: "Bank account access token not found" }, { status: 404 });
    }

    try {
        // Initialize arrays to store transactions
        let added: Transaction[] = [];
        let modified: Transaction[] = [];
        let removed: RemovedTransaction[] = [];
        let hasMore = true;
        let currentCursor = cursor || undefined;

        // Iterate through each page of new transaction updates
        while (hasMore) {
            const response = await plaidClient.transactionsSync({
                access_token: decrypt(account.bankAccount.accessToken),
                cursor: currentCursor,
            });

            const data = response.data;

            // Add this page of results
            added = added.concat(data.added || []);
            modified = modified.concat(data.modified || []);
            removed = removed.concat(data.removed || []);

            hasMore = data.has_more;
            currentCursor = data.next_cursor;

            // If we have a cursor from the request, only fetch one page
            if (cursor) {
                hasMore = false;
            }
        }

        return NextResponse.json({
            added,
            modified,
            removed,
            has_more: currentCursor !== undefined,
            next_cursor: currentCursor,
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}