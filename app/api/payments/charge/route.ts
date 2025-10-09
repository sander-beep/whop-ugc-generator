import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Verify user token from Whop headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Parse request body
    const { packageId, amount, tokens } = await request.json();
    
    // Validate inputs
    if (!packageId || !amount || !tokens) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create charge using Whop SDK
    const result = await whopSdk.payments.chargeUser({
      userId,
      amount,
      currency: "usd",
      metadata: {
        packageId,
        tokens,
      },
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error creating charge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create charge' },
      { status: 500 }
    );
  }
}

