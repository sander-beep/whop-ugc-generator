# Whop Embedded App Setup Guide

This guide will help you configure your Whop AI UGC Generator as an **embedded Whop app** with automatic authentication.

## ✅ What's Configured

The following has been set up in your application:

1. **Whop SDK Integration** - Full SDK setup with server-side configuration
2. **Embedded Authentication** - Header-based user verification (no OAuth needed!)
3. **Experience View** - Main app view at `/experiences/[experienceId]`
4. **Dashboard View** - Company admin dashboard at `/dashboard/[companyId]`
5. **Discover Page** - Public marketing page at `/discover`
6. **Webhooks Handler** - Payment and event processing at `/api/webhooks`

## 📋 Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Whop Configuration (REQUIRED)
# Get these from https://whop.com/dashboard/developer/
NEXT_PUBLIC_WHOP_APP_ID=your-app-id-here
WHOP_API_KEY=your-api-key-here

# Webhook Secret (REQUIRED for production)
# Get this from your Whop app settings
WHOP_WEBHOOK_SECRET=your-webhook-secret

# Optional: Agent user ID and Company ID
NEXT_PUBLIC_WHOP_AGENT_USER_ID=
NEXT_PUBLIC_WHOP_COMPANY_ID=

# Supabase (if using for data storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 Getting Your Whop Credentials

### Step 1: Create a Whop App

1. Go to the [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Click "Create New App" or select an existing app
3. Fill in your app details (name, description, etc.)

### Step 2: Configure Hosting Paths

1. In your app settings, scroll to the **Hosting** section
2. Set the following paths:

   **For Local Development:**
   - Base URL: `http://localhost:3000`
   - Experience View Path: `/experiences/[experienceId]`
   - Dashboard Path: `/dashboard/[companyId]`
   - Discover Path: `/discover`

   **For Production:**
   - Base URL: `https://yourdomain.com`
   - Keep the same paths as above

3. Copy your **App ID** and **API Key**

### Step 3: Configure Webhooks

1. In your app settings, scroll to the **Webhooks** section
2. Add webhook URL:
   - For local dev: `http://localhost:3000/api/webhooks`
   - For production: `https://yourdomain.com/api/webhooks`
3. Copy your **Webhook Secret**
4. Enable the events you want to receive (e.g., `payment.succeeded`)

## 🛠 Installation & Running

### Install Dependencies

```bash
npm install
```

### Run Development Server with Whop Proxy

```bash
npm run dev
```

This will start the Whop proxy which enables local testing within the Whop platform.

### Build for Production

```bash
npm run build
npm start
```

## 📁 App Structure

### Pages & Views

- **`/app/experiences/[experienceId]/page.tsx`** - Main experience view (users access your app here)
- **`/app/dashboard/[companyId]/page.tsx`** - Company admin dashboard
- **`/app/discover/page.tsx`** - Public marketing/discovery page
- **`/app/page.tsx`** - Root page (redirects to dashboard)

### API Routes

- **`/app/api/webhooks/route.ts`** - Handles Whop webhooks (payments, events)

### Utilities

- **`/lib/whop-sdk.ts`** - Whop SDK configuration
- **`/lib/supabase.ts`** - Supabase client (optional)

## 🔐 How Authentication Works

### Embedded Authentication (No OAuth Needed!)

When users access your app through Whop, they're **already authenticated**. Whop passes the user token in the request headers.

### Getting the Authenticated User

```tsx
import { headers } from "next/headers";
import { whopSdk } from "@/lib/whop-sdk";

export default async function MyPage() {
  // Get headers from the request
  const headersList = await headers();
  
  // Verify user token and get userId
  const { userId } = await whopSdk.verifyUserToken(headersList);
  
  // Get full user details
  const user = await whopSdk.users.getUser({ userId });
  
  return <div>Welcome {user.name}!</div>;
}
```

### Checking Access Levels

#### For Experience Access (Customer or Admin):

```tsx
const { experienceId } = await params;
const { userId } = await whopSdk.verifyUserToken(headersList);

const access = await whopSdk.access.checkIfUserHasAccessToExperience({
  userId,
  experienceId,
});

// access.hasAccess: boolean
// access.accessLevel: 'admin' | 'customer' | 'no_access'
```

#### For Company Access (Admin Only):

```tsx
const { companyId } = await params;
const { userId } = await whopSdk.verifyUserToken(headersList);

const access = await whopSdk.access.checkIfUserHasAccessToCompany({
  userId,
  companyId,
});

// access.hasAccess: boolean
// access.accessLevel: 'admin' | 'no_access'
```

## 🧪 Testing Your Integration

### Local Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **In your Whop app settings:**
   - Set Base URL to `http://localhost:3000`
   - Save settings

3. **Install the app to your Whop:**
   - Click the "Install" button in your app settings
   - Or visit the installation link

4. **Access your app:**
   - Go to your Whop
   - Click the settings/cog icon (top right)
   - Select "localhost" environment
   - Click your app in the sidebar
   - You should see the experience view with automatic authentication!

### Testing Different Views

- **Experience View:** Click your app from the Whop sidebar
- **Dashboard View:** Access from company settings (admin only)
- **Discover Page:** Visit `/discover` directly or share the link

### Testing Webhooks Locally

Use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

Then update your webhook URL in Whop settings to the ngrok URL.

## 🎯 Key Differences from OAuth Apps

### ✅ Embedded App (What You Have Now)

- Runs inside Whop platform (iframe)
- Automatic authentication via headers
- No OAuth flow needed
- Access via Whop sidebar
- Uses `whop-proxy` for local dev
- Users are already logged into Whop

### ❌ Standalone OAuth App (What You DON'T Have)

- Runs on separate domain
- Manual OAuth "Login with Whop"
- Separate authentication flow
- Direct URL access
- Normal Next.js dev server
- Users log in via OAuth

## 🔑 API Key Security

**IMPORTANT:** Never expose your `WHOP_API_KEY` or `WHOP_WEBHOOK_SECRET` to the client!

- ✅ Use in server components and API routes
- ✅ Use in server-side functions  
- ❌ Never use in client components
- ❌ Never expose in browser

The `NEXT_PUBLIC_WHOP_APP_ID` is safe to expose (it's public by design).

## 📚 Available Whop SDK Methods

### User Methods

```typescript
// Verify user from headers
const { userId } = await whopSdk.verifyUserToken(headers)

// Get user info
const user = await whopSdk.users.getUser({ userId })
```

### Access Methods

```typescript
// Check experience access
const access = await whopSdk.access.checkIfUserHasAccessToExperience({
  userId,
  experienceId
})

// Check company access (admin)
const access = await whopSdk.access.checkIfUserHasAccessToCompany({
  userId,
  companyId
})
```

### Company Methods

```typescript
// Get company info
const company = await whopSdk.companies.getCompany({ companyId })
```

### Experience Methods

```typescript
// Get experience info
const experience = await whopSdk.experiences.getExperience({ experienceId })
```

## 🎨 Views Overview

### Experience View (`/experiences/[experienceId]`)
- **Purpose:** Main app interface for users
- **Access:** Customers and admins of the Whop
- **Entry Point:** Users click your app in Whop sidebar
- **Features:** Your core app functionality

### Dashboard View (`/dashboard/[companyId]`)
- **Purpose:** Admin configuration panel
- **Access:** Company owners and moderators only
- **Entry Point:** Company settings in Whop
- **Features:** App settings, analytics, configuration

### Discover Page (`/discover`)
- **Purpose:** Marketing and discovery
- **Access:** Public (anyone can view)
- **Entry Point:** Direct link or Whop app marketplace
- **Features:** Showcase features, pricing, success stories

## 🔄 Webhooks

Your app can receive webhooks for various events:

### Payment Events

```typescript
// In /app/api/webhooks/route.ts
if (webhookData.action === "payment.succeeded") {
  const { id, final_amount, user_id, currency } = webhookData.data;
  // Handle payment success
  // - Update user credits
  // - Send confirmation
  // - Update database
}
```

### Other Events

- `membership.created` - New member joins
- `membership.deleted` - Member leaves
- `payment.failed` - Payment failed
- And more...

## 🐛 Troubleshooting

### "Invalid token" or authentication errors

- Ensure you're running with `npm run dev` (whop-proxy is required)
- Check that Base URL in Whop settings matches your dev server
- Verify environment variables are set correctly

### App not loading in Whop

- Set environment to "localhost" using the cog icon in Whop
- Ensure whop-proxy is running (check terminal output)
- Verify paths are set correctly in Whop dashboard

### Webhooks not receiving

- Check webhook URL is correct and accessible
- Verify WHOP_WEBHOOK_SECRET matches Whop dashboard
- For local dev, use ngrok or similar tunnel service

### "Access denied" errors

- Verify the user has proper access to the experience/company
- Check access level requirements in your code
- Ensure user is logged into Whop

## 📖 Next Steps

1. **Set up your environment variables** (`.env.local`)
2. **Configure your Whop app** in the developer dashboard
3. **Install your app** to a Whop for testing
4. **Test the experience view** by clicking your app in Whop
5. **Customize your app** functionality and UI
6. **Set up webhooks** for payment processing
7. **Deploy to production** and update Whop settings

## 🔗 Useful Links

- [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
- [Whop SDK Documentation](https://dev.whop.com)
- [Experience View Guide](https://dev.whop.com/apps/app-views/experience-view)
- [Webhooks Guide](https://dev.whop.com/apps/webhooks)

## 💡 Support

For issues specific to Whop integration, check the [Whop documentation](https://dev.whop.com) or contact Whop support.
