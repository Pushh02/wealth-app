import { NextResponse } from "next/server";
import plaidClient from "@/lib/plaid";
import { Products, CountryCode } from "plaid";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const databaseUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: user.email,
          mode: 'insensitive'
        },
      },
    });
    if (!databaseUser) {
      return NextResponse.json(
        {
          status: 401,
          message: "User not found",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: databaseUser.name,

      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return NextResponse.json(
      { error: "Unable to create link token" },
      { status: 500 }
    );
  }
}
