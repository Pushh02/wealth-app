// /pages/api/plaid/webhook.ts

import plaidClient from "@/lib/plaid";
import prisma from "@/lib/prisma";
import { decrypt } from "@/utils/Cryptography/decrypt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Received Plaid Webhook:", body);

    const webhookType = body.webhook_type;
    const itemId = body.item_id;

    if (webhookType === "TRANSACTIONS") {
      try {
        const bankAccount = await prisma.bankAccount.findFirst({
          where: { itemId: itemId }, // ✅ correct field now
          include: {
            account: {
              include: {
                rules: {
                  where: {
                    isActive: true,
                  }
                }
              }
            }
          },
        });

        if (!bankAccount) {
          console.error("No bank account found for item_id:", itemId);
          return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
        }

        const accessToken = decrypt(bankAccount.accessToken ?? "");
        const rules = bankAccount.account.rules;

        if (!rules || rules.length === 0) {
          console.log("No rules attached to this account.");
          return NextResponse.json({ message: "No rules to check" }, { status: 200 });
        }

        const { added } = await fetchNewTransactions(accessToken || "");

        const transactions = await prisma.alertTransactions.findMany({
          where: {
            bankAccountId: bankAccount.id,
          },
        });

        for (const txn of added) {
          for (const rule of rules) {
            if ((txn.amount > rule.threshold) && !transactions.some(t => t.transactionId === txn.transaction_id)) {
              await prisma.alertTransactions.create({
                data: {
                  name: txn.name,
                  amount: txn.amount,
                  transactionId: txn.transaction_id,
                  transactionType: txn.payment_channel || "unknown",
                  category: txn.category ? txn.category.join(" > ") : "Uncategorized",
                  bankAccountId: bankAccount.id,
                  violatedRuleId: rule.id,
                  approvedBy: [],
                  isApproved: false,
                },
              });

              console.log(`Transaction ${txn.transaction_id} triggered rule: ${rule.name}`);
            }
          }
        }

        return NextResponse.json({ message: "Processed transactions" }, { status: 200 });
      } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message: "Webhook ignored" }, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function fetchNewTransactions(accessToken: string) {
  let cursor = null; // Start fresh for now
  let added = [];

  const response = await plaidClient.transactionsSync({
    access_token: accessToken,
    cursor: cursor || undefined,
  });

  added = response.data.added;

  return { added };
}