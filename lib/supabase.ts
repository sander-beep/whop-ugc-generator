import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  token_balance: number
  created_at: string
}

export type Video = {
  id: string
  user_id: string
  prompt_data: {
    target_audience: string
    ugc_character: string
    aspect_ratio: string
    scenes: Array<{
      description: string
      script: string
    }>
    product_image_url?: string
  }
  video_url: string | null
  status: 'processing' | 'completed' | 'failed'
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  tokens_purchased: number
  payment_id: string
  created_at: string
}
