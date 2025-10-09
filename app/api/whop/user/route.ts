import { whopSdk } from "@/lib/whop-sdk";
import { ensureUserExists } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Verify user token from Whop headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Get full user details from Whop
    const user = await whopSdk.users.getUser({ userId });
    
    // Ensure user exists in Supabase with Whop ID
    await ensureUserExists(userId, user.email);
    
    return NextResponse.json({ 
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
      }
    });
  } catch (error) {
    console.error('Error getting Whop user:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

