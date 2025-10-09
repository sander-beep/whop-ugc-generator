import { whopSdk } from "@/lib/whop-sdk";
import { supabaseAdmin, deductTokens } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Verify user token from Whop headers
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const promptData = JSON.parse(formData.get('promptData') as string);
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    // Deduct 1 token for video generation
    await deductTokens(userId, 1);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${videoFile.name}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('videos')
      .upload(fileName, buffer, {
        contentType: videoFile.type,
        upsert: false,
      });
    
    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      // Refund token if upload fails
      await deductTokens(userId, -1);
      return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('videos')
      .getPublicUrl(fileName);
    
    // Create video record in database
    const { data: videoData, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        user_id: userId,
        prompt_data: promptData,
        video_url: publicUrl,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating video record:', dbError);
      // Clean up uploaded file
      await supabaseAdmin.storage.from('videos').remove([fileName]);
      // Refund token
      await deductTokens(userId, -1);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      video: videoData 
    });
    
  } catch (error) {
    console.error('Error in video upload:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}

