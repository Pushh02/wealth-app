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

        const { name, threshold, transactionType, description } = await request.json();

        const rule = await prisma.rules.create({
            data: {
                name,
                threshold,
                transactionType,
                description,
                accountId,
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
        const accountId = searchParams.get("accountId");
        const user = await verifyUser();

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, threshold, transactionType, description } = await request.json();

        const rule = await prisma.rules.update({
            where: { id },
            data: { name, threshold, transactionType, description },
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
        const user = await verifyUser();

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();

        await prisma.rules.delete({ where: { id } });

        return NextResponse.json({ message: "Rule deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
