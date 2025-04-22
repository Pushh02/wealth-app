import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/utils/verify-user";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const user = await verifyUser();

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rules = await prisma.rules.findMany({
            where: {
                accountId: accountId,
            },
            include: {
                account: {
                    include: {
                        approvers: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const user = await verifyUser();

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, threshold, isActive, description } = await request.json();

        if (!name || !threshold || !description) {
            return NextResponse.json({ error: "Missing required fields", details: { name, threshold, description } }, { status: 400 });
        }

        if (isActive) {
            await prisma.rules.updateMany({
                where: {
                    accountId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });
            
        }

        const rule = await prisma.rules.create({
            data: {
                name,
                threshold,
                description,
                accountId,
                isActive,
            },
        });

        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ruleId = searchParams.get("ruleId");
        const user = await verifyUser();
        if (!ruleId) {
            return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, threshold, description } = await request.json();

        if (!name || !threshold || !description) {
            return NextResponse.json({ error: "Missing required fields", details: { name, threshold, description } }, { status: 400 });
        }
        console.log(name, threshold, description);

        const rule = await prisma.rules.update({
            where: { id: ruleId },
            data: { name, threshold: parseFloat(threshold), description },
        });

        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const ruleId = searchParams.get("ruleId");
        const user = await verifyUser();

        if (!accountId || !ruleId) {
            return NextResponse.json({ error: "Account ID and Rule ID are required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.rules.delete({ where: { id: ruleId, accountId } });

        return NextResponse.json({ message: "Rule deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
