import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/utils/verify-user";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  //take the accountId from the query params of the request
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  console.log("accountId", accountId);

  if (!accountId) {
    return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
  }

  const user = await verifyUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
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
      approvers: true,
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  let userRole;
  // if the user is approver, appent the userRole = "approver" to the account
  if (account.approvers.some(approver => approver.email === user.email)) {
    userRole = "approver";
  } else {
    userRole = "primary";
  }

  return NextResponse.json({ account, userEmail: user.email, userRole, userName: userData.name, userId: userData.id }, { status: 200 });
}
