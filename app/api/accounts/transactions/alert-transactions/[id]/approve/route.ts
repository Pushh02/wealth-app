import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/utils/verify-user";

export async function POST(request: NextRequest) {
    const user = await verifyUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { approved } = await request.json();

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
        include: {
            approverAccounts: true,
        },
    });

    if (!userData) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const alertTransaction = await prisma.alertTransactions.findFirst({
        where: {
            id: id,
        },
    });

    if (!alertTransaction) {
        return NextResponse.json({ error: "Alert transaction not found" }, { status: 404 });
    }

    if (alertTransaction.approvedBy.includes(userData.id)) {
        return NextResponse.json({ error: "User already approved this transaction" }, { status: 400 });
    }

    const approvedBy = [...alertTransaction.approvedBy, userData.id];

    const isApprovedByAll = userData.approverAccounts.map((account) => account.id).every((approverAccountId) => approvedBy.includes(approverAccountId));

    const transaction = await prisma.alertTransactions.update({
        where: { id },
        data: {
            approvedBy: {
                push: userData.id
            },
            isApproved: isApprovedByAll,
        },
    });

    return NextResponse.json({ transaction }, { status: 200 });
}
