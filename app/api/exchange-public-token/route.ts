import { NextRequest, NextResponse } from "next/server";
import plaidClient from "@/lib/plaid";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { encrypt } from "@/utils/Cryptography/encrypt";

export async function POST(req: NextRequest) {
  const { public_token } = await req.json();

  console.log("public_token", public_token);
  if (!public_token || public_token.trim() === "") {
    return NextResponse.json(
      {
        status: 400,
        message: "Public token is required",
        success: false,
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = response.data.access_token;

    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const encryptedToken = encrypt(accessToken);

    const userAccount = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      
    });

    if (!userAccount) {
      return NextResponse.json(
        {
          status: 401,
          message: "Unauthorized",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const account = accountsResponse.data.accounts[0];

    const transactionResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: "2024-01-01",
      end_date: "2025-04-08",
    });

    const transactions = transactionResponse.data.transactions;

    return NextResponse.json(
      {
        status: 200,
        message: "Token exchanged successfully",
        success: true,
        data: transactions[0],
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
