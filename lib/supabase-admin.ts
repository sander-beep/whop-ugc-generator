import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Supabase admin client with service role key
 * Use this for backend operations that need to bypass RLS
 * WARNING: Never expose this to the client!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Helper function to ensure a Whop user exists in Supabase
 */
export async function ensureUserExists(userId: string, email: string | null) {
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError)
    throw fetchError
  }

  if (!existingUser) {
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email || '',
        token_balance: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      throw insertError
    }

    return newUser
  }

  return existingUser
}

/**
 * Get user's token balance
 */
export async function getUserTokenBalance(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('token_balance')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching token balance:', error)
    throw error
  }

  return data.token_balance
}

/**
 * Update user's token balance
 */
export async function updateTokenBalance(userId: string, amount: number) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ token_balance: amount })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating token balance:', error)
    throw error
  }

  return data
}

/**
 * Add tokens to user's balance
 */
export async function addTokens(userId: string, tokensToAdd: number) {
  const currentBalance = await getUserTokenBalance(userId)
  return updateTokenBalance(userId, currentBalance + tokensToAdd)
}

/**
 * Deduct tokens from user's balance
 */
export async function deductTokens(userId: string, tokensToDeduct: number) {
  const currentBalance = await getUserTokenBalance(userId)
  
  if (currentBalance < tokensToDeduct) {
    throw new Error(`Insufficient token balance. Required: ${tokensToDeduct}, Available: ${currentBalance}`)
  }
  
  return updateTokenBalance(userId, currentBalance - tokensToDeduct)
}

/**
 * Record a token transaction
 */
export async function recordTransaction(
  userId: string, 
  tokensPurchased: number, 
  paymentId: string
) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: userId,
      tokens_purchased: tokensPurchased,
      payment_id: paymentId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording transaction:', error)
    throw error
  }

  return data
}

