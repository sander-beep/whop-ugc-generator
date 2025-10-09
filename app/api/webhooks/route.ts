import { makeWebhookValidator } from "@whop/api";
import { addTokens, recordTransaction } from "@/lib/supabase-admin";
import type { NextRequest } from "next/server";

const validateWebhook = makeWebhookValidator({
  webhookSecret: process.env.WHOP_WEBHOOK_SECRET ?? "fallback",
});

export async function POST(request: NextRequest): Promise<Response> {
  // Validate the webhook to ensure it's from Whop
  const webhookData = await validateWebhook(request);

  // Handle the webhook event
  if (webhookData.action === "payment.succeeded") {
    const { id, final_amount, amount_after_fees, currency, user_id, metadata } =
      webhookData.data;

    // final_amount is the amount the user paid (in cents)
    // amount_after_fees is the amount that is received by you, after card fees and processing fees are taken out

    console.log(
      `Payment ${id} succeeded for ${user_id} with amount ${final_amount} ${currency}`,
    );

    // Handle payment success asynchronously
    await handlePaymentSuccess(user_id, id, final_amount, currency, metadata);
  }

  // Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
  return new Response("OK", { status: 200 });
}

async function handlePaymentSuccess(
  user_id: string | null | undefined,
  payment_id: string,
  amount: number,
  currency: string,
  metadata?: Record<string, any>,
) {
  try {
    if (!user_id) {
      console.error('No user_id in payment webhook');
      return;
    }

    let tokensToAdd = 0;

    // Use exact amount from metadata (set by charge API)
    if (metadata?.tokens) {
      tokensToAdd = metadata.tokens;
    } else {
      // Fallback calculation (shouldn't happen with new flow)
      // Convert amount from cents to dollars
      const amountInDollars = amount / 100;
      
      // Match the token package structure
      if (amountInDollars >= 100) {
        tokensToAdd = 1500; // Premium package
      } else if (amountInDollars >= 30) {
        tokensToAdd = 600; // Growth package
      } else if (amountInDollars >= 10) {
        tokensToAdd = 200; // Starter package
      } else {
        // Generic fallback for custom amounts
        tokensToAdd = Math.floor(amountInDollars * 20);
      }
      
      console.warn(`Using fallback token calculation for amount $${amountInDollars} - metadata.tokens not found`);
    }

    // Add tokens to user's balance
    await addTokens(user_id, tokensToAdd);

    // Record the transaction
    await recordTransaction(user_id, tokensToAdd, payment_id);

    console.log(`Added ${tokensToAdd} tokens to user ${user_id} for payment ${payment_id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    // Don't throw - we don't want to trigger webhook retries for DB errors
  }
}

