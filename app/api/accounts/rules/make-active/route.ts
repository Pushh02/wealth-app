import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/utils/verify-user";

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ruleId = searchParams.get("ruleId");
        const accountId = searchParams.get("accountId");
        const user = await verifyUser();

        if (!ruleId) {
            return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
        }
        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isActive } = await request.json();

        if (typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Invalid isActive value" }, { status: 400 });
        }

        if (isActive) {
            await prisma.rules.updateMany({
                where: {
                    accountId: accountId,
                },
                data: {
                    isActive: false,
                },
            });
        }

        const rule = await prisma.rules.update({
            where: { id: ruleId, accountId: accountId },
            data: { isActive }
        });

        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}   