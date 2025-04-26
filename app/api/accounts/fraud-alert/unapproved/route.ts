import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  try {
    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const fraudAlerts = await prisma.alertTransactions.findMany({
      where: {
        bankAccount: {
          accountId: accountId,
        },
        isApproved: false,
        isRejected: false,
      },
    });
    console.log("fraudAlerts", fraudAlerts)

    return NextResponse.json({ pendingAlerts: fraudAlerts.length }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
