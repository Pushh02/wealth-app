import { verifyUser } from "@/utils/verify-user";
import { NextRequest, NextResponse } from "next/server";
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

        const approvers = await prisma.account.findFirst({
            where: {
                id: accountId,
            },
            include: {
                approvers: true,
            },
        });

        return NextResponse.json(approvers?.approvers, { status: 200 });
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

        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Missing required fields", details: { name, email } }, { status: 400 });
        }
        
        let approver = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
            },
        });
        
        if (!approver) {
            // approver = await prisma.user.create({
            //     data: {
            //         name,
            //         email,
            //         password: Math.random().toString(36).substring(2, 15),
            //     },
            // });
            //todo: setup smtp server to send email to approver
            return NextResponse.json({ error: "Approver does not have an account" }, { status: 404 });
        }

        await prisma.account.update({
            where: { id: accountId },
            data: { approvers: { connect: { id: approver.id } } },
        });

        return NextResponse.json({ message: "Approver added successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("accountId");
        const approverId = searchParams.get("approverId");
        const user = await verifyUser();

        if (!accountId) {
            return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
        }
        if (!approverId) {
            return NextResponse.json({ error: "Approver ID is required" }, { status: 400 });
        }
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // First verify the approver belongs to the account
        const approver = await prisma.account.findFirst({
            where: {
                id: accountId,
                approvers: {
                    some: {
                        id: approverId
                    }
                }
            }
        });

        if (!approver) {
            return NextResponse.json({ error: "Approver not found in this account" }, { status: 404 });
        }

        // Remove the approver from the account
        await prisma.account.update({
            where: { id: accountId },
            data: { 
                approvers: { 
                    disconnect: { id: approverId } 
                } 
            },
        });

        return NextResponse.json({ message: "Approver removed successfully" }, { status: 200 });
        
    } catch (error) {
        console.error("[APPROVERS_DELETE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}