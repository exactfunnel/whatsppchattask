# 🚨 Cloudflare Error 522 - Connection Timed Out Fix

## 🔍 Problem Analysis

**Error**: Connection timed out (Error code 522)  
**Domain**: `whatsapp.skyroofingconstructiontx.co`  
**Location**: Marseille (Cloudflare edge server)

## 🛠️ What Error 522 Means

Error 522 occurs when Cloudflare cannot connect to your origin server (Cloudflare Pages) within the timeout period. This usually means:

1. **Pages deployment issue** - App not properly deployed
2. **Custom domain misconfiguration** - DNS not pointing correctly  
3. **Pages function timeout** - Code taking too long to respond
4. **Database connection issue** - D1 database not accessible

## 🔧 Step-by-Step Fix

### Step 1: Check Cloudflare Pages Deployment

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Pages** → **whatsapp-taskbot** (or your project name)
3. **Check deployment status**:
   - ✅ Should show "Success" with green checkmark
   - ❌ If failed, check build logs

### Step 2: Verify Custom Domain Configuration

1. **In your Pages project** → **Custom domains** tab
2. **Check domain status**:
   ```
   whatsapp.skyroofingconstructiontx.co
   Status: ✅ Active (should be green)
   SSL: ✅ Active
   ```

3. **If not active**, remove and re-add the domain:
   - Click **"Remove"** next to the domain
   - **"Set up a custom domain"** → Re-enter the domain
   - Follow DNS configuration steps

### Step 3: Fix DNS Configuration

**Check your DNS settings at your domain provider:**

```
Type: CNAME
Name: whatsapp
Target: whatsapp-taskbot.pages.dev
TTL: 300 (or Auto)
Proxy: ✅ Proxied (orange cloud in Cloudflare)
```

**Important**: Make sure the CNAME points to your actual Cloudflare Pages URL, not a placeholder.

### Step 4: Test the Original Pages URL

Before fixing the custom domain, test if your app works on the default URL:

```bash
# Test the default Cloudflare Pages URL
curl https://whatsapp-taskbot.pages.dev/health

# Should return:
{"status":"ok","timestamp":"2025-08-28T11:41:20.000Z"}
```

**If this fails**, your Pages deployment has an issue.

### Step 5: Check Database Configuration

The 522 error might be caused by the invalid database UUID we discussed earlier:

1. **Go to Cloudflare Dashboard** → **D1**
2. **Create database** if not exists: `whatsapp-taskbot-production`
3. **Copy the real Database ID**
4. **Update wrangler.jsonc** in your code:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB", 
      "database_name": "whatsapp-taskbot-production",
      "database_id": "REAL_DATABASE_ID_HERE"  // ← Replace placeholder
    }
  ]
}
```

5. **Redeploy** after fixing the database ID

### Step 6: Check Environment Variables

In Cloudflare Pages → Settings → Environment variables:

```
WHATSAPP_TOKEN = your_whatsapp_token
WHATSAPP_VERIFY_TOKEN = taskbot_verify_token_2025
```

Missing environment variables can cause 522 errors.

## 🧪 Testing & Verification

### 1. Test Default URL First:
```bash
curl https://whatsapp-taskbot.pages.dev
curl https://whatsapp-taskbot.pages.dev/health
curl https://whatsapp-taskbot.pages.dev/webhook
```

### 2. Test Custom Domain After Fix:
```bash
curl https://whatsapp.skyroofingconstructiontx.co/health
```

### 3. Check DNS Propagation:
```bash
dig whatsapp.skyroofingconstructiontx.co
nslookup whatsapp.skyroofingconstructiontx.co
```

## 🎯 Most Likely Causes & Solutions

### Cause 1: Invalid Database ID (90% likely)
**Fix**: Create real D1 database, update wrangler.jsonc, redeploy

### Cause 2: Build/Deployment Failure  
**Fix**: Check Pages build logs, fix code errors, redeploy

### Cause 3: DNS Misconfiguration
**Fix**: Verify CNAME record points to correct Pages URL

### Cause 4: Pages Function Timeout
**Fix**: Check function logs, optimize database queries

## 📋 Diagnostic Checklist

Run through this checklist:

- [ ] **Pages deployment status**: Success ✅
- [ ] **Database created**: Real UUID in wrangler.jsonc ✅  
- [ ] **Environment variables**: Set correctly ✅
- [ ] **Default URL works**: `https://whatsapp-taskbot.pages.dev/health` ✅
- [ ] **DNS configuration**: CNAME pointing to Pages URL ✅
- [ ] **Custom domain status**: Active in Pages dashboard ✅
- [ ] **SSL certificate**: Active and valid ✅

## 🚀 Quick Fix Commands

If you have the real database ID:

```bash
# 1. Update wrangler.jsonc with real database ID
# 2. Commit and push to GitHub (if using Git deployment)
git add wrangler.jsonc
git commit -m "Fix database UUID for production deployment"
git push origin main

# 3. Or redeploy manually
npm run build
npx wrangler pages deploy dist --project-name whatsapp-taskbot
```

## 📞 Alternative Solution: Remove Custom Domain Temporarily

If urgent, remove the custom domain and use the default URL:

1. **Pages dashboard** → **Custom domains** → **Remove domain**
2. **Use default URL**: `https://whatsapp-taskbot.pages.dev/webhook`
3. **Update WhatsApp webhook** to use default URL temporarily
4. **Fix issues** then re-add custom domain later

## 🎯 Expected Resolution Time

- **Database ID fix**: Immediate after redeploy
- **DNS changes**: 10-60 minutes  
- **SSL certificate**: 5-15 minutes
- **Full propagation**: Up to 24 hours

## 📱 Immediate Workaround for WhatsApp

While fixing the custom domain, you can use the default Cloudflare Pages URL:

**Webhook URL**: `https://whatsapp-taskbot.pages.dev/webhook`

Update this in your WhatsApp Business API configuration temporarily until the custom domain is fixed.

Your WhatsApp bot should work perfectly once we resolve the 522 error! 🚀