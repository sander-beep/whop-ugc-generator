import { whopSdk } from "@/lib/whop-sdk";
import { getUserTokenBalance } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Verify user token from Whop headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Get token balance from Supabase
    const tokenBalance = await getUserTokenBalance(userId);
    
    return NextResponse.json({ tokenBalance });
    
  } catch (error) {
    console.error('Error getting token balance:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to get balance' 
    }, { status: 500 });
  }
}

