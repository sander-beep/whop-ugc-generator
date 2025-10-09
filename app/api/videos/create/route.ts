import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin, deductTokens, addTokens } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Verify user token from Whop headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Parse request body
    const body = await request.json();
    const { promptData } = body;
    
    if (!promptData) {
      return NextResponse.json({ error: 'No prompt data provided' }, { status: 400 });
    }
    
    // Deduct 100 tokens for video generation
    await deductTokens(userId, 100);
    
    // Create video record in database with processing status
    const { data: videoData, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        prompt_data: promptData,
        video_url: null,
        status: 'processing',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating video record:', dbError);
      // Refund tokens if creation fails
      await addTokens(userId, 100);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      video: videoData 
    });
    
  } catch (error) {
    console.error('Error in video creation:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Creation failed' 
    }, { status: 500 });
  }
}

