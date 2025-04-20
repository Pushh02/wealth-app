import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import plaidClient from "@/lib/plaid";
import { decrypt } from "@/utils/Cryptography/decrypt";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");

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

        const response = await plaidClient.accountsGet({
            access_token: decrypt(account.bankAccount[0].accessToken || ""),
        });

        const balance = response.data.accounts.map((account) => {
            return {
                name: account.name,
                balance: account.balances.current,
            };
        });

        return NextResponse.json({ balance, accounts: response.data.accounts }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
