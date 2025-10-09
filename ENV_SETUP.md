# Environment Variables Setup

Copy this to your `.env.local` file and fill in the values.

## Whop Configuration

Get these from https://whop.com/dashboard/developer/

```env
# Whop App ID (public, safe to expose)
NEXT_PUBLIC_WHOP_APP_ID=your-app-id-here

# Whop API Key (SECRET - never expose to client!)
WHOP_API_KEY=your-api-key-here

# Whop Webhook Secret (for verifying webhook signatures)
WHOP_WEBHOOK_SECRET=your-webhook-secret-here
```

## Supabase Configuration

Get these from https://app.supabase.com → Your Project → Settings → API

```env
# Supabase Project URL (public, safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase Anon Key (public key, safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (SECRET - NEVER expose to client!)
# ⚠️ THIS IS REQUIRED FOR THE APP TO WORK ⚠️
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Optional Whop Variables

```env
# Optional: Agent user ID (for API requests on behalf of user)
NEXT_PUBLIC_WHOP_AGENT_USER_ID=

# Optional: Company ID (for company-specific API requests)
NEXT_PUBLIC_WHOP_COMPANY_ID=
```

---

## Complete .env.local Template

```env
# ===================================
# WHOP CONFIGURATION
# ===================================
NEXT_PUBLIC_WHOP_APP_ID=
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=

# Optional
NEXT_PUBLIC_WHOP_AGENT_USER_ID=
NEXT_PUBLIC_WHOP_COMPANY_ID=

# ===================================
# SUPABASE CONFIGURATION
# ===================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## How to Get Each Value

### Whop Variables

1. **NEXT_PUBLIC_WHOP_APP_ID & WHOP_API_KEY:**
   - Go to https://whop.com/dashboard/developer/
   - Select your app
   - Copy "App ID" and "API Key"

2. **WHOP_WEBHOOK_SECRET:**
   - Same page, scroll to Webhooks section
   - Copy the webhook secret
   - Configure webhook URL: `https://yourdomain.com/api/webhooks`

### Supabase Variables

1. **NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Go to https://app.supabase.com
   - Select your project
   - Settings → API
   - Copy "Project URL" and "anon/public" key

2. **SUPABASE_SERVICE_ROLE_KEY:** ⚠️ IMPORTANT!
   - Same page (Settings → API)
   - Copy the **"service_role"** key (NOT anon key!)
   - This key has full database access
   - NEVER commit this to git or expose to client

---

## Security Notes

### Public Variables (safe to expose):
- ✅ `NEXT_PUBLIC_WHOP_APP_ID`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Secret Variables (NEVER expose):
- 🔒 `WHOP_API_KEY`
- 🔒 `WHOP_WEBHOOK_SECRET`
- 🔒 `SUPABASE_SERVICE_ROLE_KEY`

---

## Verification

After adding all variables, verify your setup:

```bash
# Start dev server
npm run dev

# In browser console, test:
fetch('/api/whop/user').then(r => r.json()).then(console.log)
# Should return your Whop user

fetch('/api/tokens/balance').then(r => r.json()).then(console.log)
# Should return: { tokenBalance: 0 }
```

If you see errors, check:
1. All variables are set (no empty values)
2. Service role key is correct (not anon key)
3. Dev server was restarted after adding variables

---

## Production Setup

For production (Vercel, etc.):

1. Add ALL environment variables to your hosting platform
2. Update Whop webhook URL to production domain
3. Verify WHOP_WEBHOOK_SECRET matches Whop dashboard
4. Test payment webhook in production

---

Need help? Check `SUPABASE_WHOP_INTEGRATION.md` for troubleshooting.

