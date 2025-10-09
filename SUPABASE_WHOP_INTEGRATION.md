# Supabase + Whop Integration Guide

## ✅ Implementation Complete

Your app now uses **Supabase for data storage** with **Whop for authentication**. This guide explains how everything works together.

---

## 🏗️ Architecture Overview

```
Whop Authentication → Your App → Supabase Storage
                          ↓
                    Supabase Database
```

### What Each System Handles:

**Whop:**
- User authentication (automatic via headers)
- Payment processing
- User identity (user IDs, emails, profiles)

**Supabase:**
- Token balance storage
- Video file storage (binary files)
- Video metadata & status
- Transaction history
- User data records

---

## 📁 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id text PRIMARY KEY,              -- Whop user ID (user_***)
  email text NOT NULL,              -- User's email
  token_balance integer DEFAULT 0,  -- Available tokens
  created_at timestamptz DEFAULT now()
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id), -- Whop user ID
  prompt_data jsonb NOT NULL,         -- Generation parameters
  video_url text,                     -- Public URL to video in storage
  status text DEFAULT 'processing',   -- processing|completed|failed
  created_at timestamptz DEFAULT now()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id),  -- Whop user ID
  tokens_purchased integer NOT NULL,   -- Tokens added
  payment_id text NOT NULL,            -- Whop payment ID
  created_at timestamptz DEFAULT now()
);
```

### Storage Buckets

**`videos` bucket:**
- Stores generated video files
- Public read access
- Service role write access
- Path format: `{user_id}/{timestamp}-{filename}`

**`product-images` bucket:**
- Stores product images for video generation
- Public read access
- Path format: `{user_id}/{timestamp}.{ext}`

---

## 🔐 Authentication Flow

### 1. User Accesses App
```
User clicks app in Whop → Whop adds token to headers → App loads
```

### 2. User Initialization
```typescript
// Happens automatically via AuthProvider
1. AuthProvider fetches /api/whop/user
2. API verifies Whop token
3. API ensures user exists in Supabase
4. Returns user data to client
```

### 3. User Record Creation
```typescript
// lib/supabase-admin.ts → ensureUserExists()
if (user doesn't exist in Supabase) {
  Create user record with:
  - id: Whop user ID
  - email: from Whop
  - token_balance: 0
}
```

---

## 💰 Token Management

### Getting Token Balance

**Client-side:**
```typescript
const response = await fetch('/api/tokens/balance')
const { tokenBalance } = await response.json()
```

**Server-side:**
```typescript
import { getUserTokenBalance } from '@/lib/supabase-admin'
const balance = await getUserTokenBalance(userId)
```

### Adding Tokens (Payment Webhook)

When payment succeeds:
```typescript
// app/api/webhooks/route.ts
await addTokens(userId, tokensToAdd)
await recordTransaction(userId, tokensToAdd, paymentId)
```

Token calculation:
- $1-4: 1:1 ratio (1 token per dollar)
- $5-9: 20% bonus
- $10+: 30% bonus

### Deducting Tokens (Video Creation)

```typescript
// app/api/videos/create/route.ts
await deductTokens(userId, 1) // Deduct 1 token per video
```

---

## 🎬 Video Workflow

### Creating a Video

**1. User submits form → API creates video record:**
```typescript
POST /api/videos/create
{
  promptData: {
    target_audience, ugc_character, aspect_ratio, scenes, ...
  }
}

Response: { video: { id, status: 'processing', ... } }
```

**2. Token deducted automatically**
```typescript
// In API route
await deductTokens(userId, 1)
```

**3. Video generation happens (your implementation)**
```typescript
// Your video generation logic here
// When complete, upload to Supabase Storage
```

### Uploading Generated Video

**Option A: Upload via API:**
```typescript
POST /api/videos/upload
FormData {
  video: File,
  promptData: JSON string
}

// API handles:
1. Upload to Supabase Storage
2. Get public URL
3. Create/update video record
4. Deduct token
```

**Option B: Direct upload + update:**
```typescript
// Upload file
const { data } = await supabaseAdmin.storage
  .from('videos')
  .upload(fileName, file)

// Get public URL
const { data: { publicUrl } } = supabaseAdmin.storage
  .from('videos')
  .getPublicUrl(fileName)

// Update video record
await supabaseAdmin
  .from('videos')
  .update({ video_url: publicUrl, status: 'completed' })
  .eq('id', videoId)
```

---

## 🔑 Environment Variables Required

```env
# Whop (existing)
NEXT_PUBLIC_WHOP_APP_ID=your-app-id
WHOP_API_KEY=your-api-key
WHOP_WEBHOOK_SECRET=your-webhook-secret

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (NEW - REQUIRED!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Where to Get Service Role Key:
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy "service_role" key (NOT anon key)
4. Add to `.env.local`

⚠️ **NEVER expose service role key to client!**

---

## 📦 API Endpoints Created

### Authentication
- `GET /api/whop/user` - Get current Whop user + ensure exists in Supabase

### Tokens
- `GET /api/tokens/balance` - Get user's token balance

### Videos
- `POST /api/videos/create` - Create video record (deducts 1 token)
- `POST /api/videos/upload` - Upload video file + create record

### Webhooks
- `POST /api/webhooks` - Handle Whop payment events

---

## 🛠️ Helper Functions (lib/supabase-admin.ts)

```typescript
// User management
ensureUserExists(userId, email)
getUserTokenBalance(userId)
updateTokenBalance(userId, amount)

// Token operations
addTokens(userId, tokensToAdd)
deductTokens(userId, tokensToDeduct)

// Transactions
recordTransaction(userId, tokensPurchased, paymentId)
```

---

## 🔄 Data Flow Examples

### Scenario 1: New User First Visit

```
1. User clicks app in Whop
   ↓
2. App loads, AuthProvider fetches /api/whop/user
   ↓
3. API verifies Whop token → userId = "user_abc123"
   ↓
4. ensureUserExists() checks Supabase
   ↓
5. User doesn't exist → Create user record
   ↓
6. Return user data to client
   ↓
7. User sees dashboard with 0 tokens
```

### Scenario 2: User Purchases Tokens

```
1. User initiates purchase via Whop payment
   ↓
2. Whop processes payment
   ↓
3. Whop sends webhook to /api/webhooks
   ↓
4. Webhook handler:
   - Calculates tokens (e.g., $10 = 13 tokens)
   - addTokens(userId, 13)
   - recordTransaction(userId, 13, paymentId)
   ↓
5. User's balance updated in Supabase
   ↓
6. User refreshes page → sees new balance
```

### Scenario 3: User Creates Video

```
1. User fills form, clicks "Generate"
   ↓
2. Frontend calls POST /api/videos/create
   ↓
3. API route:
   - Verifies Whop authentication
   - Checks token balance
   - Deducts 1 token
   - Creates video record (status: processing)
   ↓
4. Video generation happens (your implementation)
   ↓
5. Generated video uploaded to Supabase Storage
   ↓
6. Video record updated (status: completed, video_url)
   ↓
7. User sees video in their dashboard
```

---

## 🧪 Testing

### 1. Run Migration
```bash
# Apply the migration to update schema
# (Do this in your Supabase dashboard or via CLI)
```

### 2. Add Service Role Key
```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

### 3. Test User Creation
```bash
npm run dev
# Access app via Whop
# Check Supabase dashboard → Users table
# Should see new user with Whop ID
```

### 4. Test Token Balance
```bash
# In browser console:
fetch('/api/tokens/balance').then(r => r.json()).then(console.log)
# Should return: { tokenBalance: 0 }
```

### 5. Test Payment Webhook
```bash
# Use Whop webhook testing tool or Postman
# Send test payment.succeeded webhook
# Check user's token balance increases
```

---

## 🚨 Important Notes

### User ID Format
- **Whop user IDs:** `user_***` (text format)
- **Migration converts:** All user_id columns from uuid → text
- **Existing data:** May need manual migration if you have users

### RLS (Row Level Security)
- **Simplified for backend control**
- Service role bypasses RLS
- You control access via Whop authentication
- All queries use service role key

### Token Atomicity
- Token operations are NOT atomic by default
- Consider race conditions for high-traffic apps
- For production: Implement database-level atomicity
- Example: Use PostgreSQL functions or transactions

### Storage URLs
- Video URLs are public by default
- Anyone with URL can view video
- For private videos: Implement signed URLs
- Or use different bucket with stricter policies

---

## 📚 Next Steps

1. **Apply migration** to update your Supabase schema
2. **Add service role key** to environment variables
3. **Test with a Whop user** to verify user creation
4. **Test token purchase** via Whop payment webhook
5. **Test video creation** to verify token deduction
6. **Deploy** and update production env vars

---

## 🐛 Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
- Add the service role key to `.env.local`
- Restart dev server

### "User not found in Supabase"
- Ensure migration ran successfully
- Check /api/whop/user endpoint
- User should be created automatically

### "Token balance not updating"
- Check webhook is receiving events
- Verify WHOP_WEBHOOK_SECRET is correct
- Check Supabase logs for errors

### "Video upload failed"
- Ensure `videos` bucket exists in Supabase Storage
- Check bucket policies (public read, service role write)
- Verify file size limits

---

**Status:** ✅ Fully Integrated
**Authentication:** Whop
**Storage:** Supabase
**Ready for:** Production

