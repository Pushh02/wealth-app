import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/utils/verify-user";

export async function GET(request: NextRequest) {
  const user = await verifyUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: {
      user: {
        email: {
          equals: user.email,
          mode: "insensitive",
        },
      },
    },
  });

  // get all accounts where the user is the approver
  const approverAccounts = await prisma.account.findMany({
    where: {
      approvers: {
        some: {
          email: user.email,
        },
      },
    },
  });

  // remove the accessToken from both arrays
  let responseAccounts = [...accounts, ...approverAccounts].map((account) => {
    const { accessToken, ...rest } = account;
    return rest;
  });

  // append the userRole = "approver" to the approverAccounts
  responseAccounts = responseAccounts.map(account => {
    if (approverAccounts.some(a => a.id === account.id)) {
      return { ...account, userRole: "approver" };
    }
    return account;
  });

  // append the userRole = "user" to the accounts
  responseAccounts = responseAccounts.map(account => {
    if (accounts.some(a => a.id === account.id)) {
      return { ...account, userRole: "user" };
    }
    return account;
  });

  return NextResponse.json(responseAccounts, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { name, institution, approverEmails } = await request.json();

    const user = await verifyUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || !institution) {
      return NextResponse.json({ error: "Name and institution are required" }, { status: 400 });
    }

    if (approverEmails && approverEmails.length > 0) {
      // Validate all approvers first
      for (const email of approverEmails) {
        const approver = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
          },
        });

        if (!approver) {
          return NextResponse.json({ error: `Approver email ${email} is not valid` }, { status: 400 });
        }

        if (user.email === email) {
          return NextResponse.json({ error: "Approver email cannot be the same as the user email" }, { status: 400 });
        }
      }

      // Create account with all approvers
      const account = await prisma.account.create({
        data: {
          name,
          institution,
          approvers: {
            connect: approverEmails.map((email: string) => ({ email: email.toLowerCase() })),
          },
          user: {
            connect: {
              email: user.email,
            },
          },
        },
      });

      return NextResponse.json({ message: "Account created successfully", account }, { status: 200 });
    } else {
      // Create account without approvers
      const account = await prisma.account.create({
        data: {
          name,
          institution,
          user: { connect: { email: user.email } },
        },
      });

      return NextResponse.json({ message: "Account created successfully", account }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
