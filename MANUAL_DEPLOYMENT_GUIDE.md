# 🚀 Manual Deployment Guide - TaskChat Bot

## 🔑 API Token Issue Resolution

The current API token has limited permissions. Here's how to publish manually through Cloudflare Dashboard.

## 📋 Manual Publishing Steps (15 minutes)

### Step 1: Cloudflare Dashboard Setup

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Navigate to Pages**: Left sidebar → Pages
3. **Create a project**: Click "Create a project"

### Step 2: Connect GitHub Repository

1. **Connect to Git**: Choose "Connect to Git"
2. **Authorize GitHub**: Connect your GitHub account
3. **Select Repository**: `exactfunnel/whatsapp-taskbot`
4. **Begin setup**: Click "Begin setup"

### Step 3: Configure Build Settings

```
Project name: taskchat-bot
Production branch: main
Framework preset: None
Build command: npm run build
Output directory: dist
Root directory: / (leave default)
Node.js version: 18 (default)
```

### Step 4: Environment Variables

**Add these in "Environment variables" section:**

```
WHATSAPP_TOKEN = your_whatsapp_business_api_token
WHATSAPP_VERIFY_TOKEN = taskbot_verify_token_2025  
PHONE_NUMBER_ID = your_phone_number_id_from_facebook
```

**Note**: Leave these empty for now - you'll get the values from Facebook Developer setup.

### Step 5: Deploy and Save

1. **Save and Deploy**: Click "Save and Deploy"
2. **Wait for build**: Should complete in 2-3 minutes
3. **Get URL**: Copy your deployment URL (e.g., `https://taskchat-bot.pages.dev`)

## 🗄️ Database Setup (Manual)

### Step 1: Create D1 Database

1. **Cloudflare Dashboard** → **Workers & Pages** → **D1**
2. **Create database**: 
   - Name: `taskchat-production`
   - Click "Create"
3. **Copy Database ID**: Save the UUID (e.g., `12345678-abcd-1234-efgh-123456789012`)

### Step 2: Update Repository

**Update `wrangler.jsonc` in your GitHub repository:**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "taskchat-bot",
  "compatibility_date": "2025-08-28",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "taskchat-production",
      "database_id": "YOUR_REAL_DATABASE_ID_HERE"  // Replace with copied ID
    }
  ]
}
```

### Step 3: Commit and Redeploy

```bash
git add wrangler.jsonc
git commit -m "Add production database ID"
git push origin main
```

This will trigger automatic redeployment.

### Step 4: Apply Database Migrations

**In Cloudflare D1 Console:**

1. **D1 Database** → **taskchat-production** → **Console**
2. **Run these SQL commands**:

```sql
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#10B981',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table  
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  due_date DATE,
  category_id INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Default categories
INSERT OR IGNORE INTO categories (name, color) VALUES 
  ('Personal', '#10B981'),
  ('Work', '#3498DB'), 
  ('Shopping', '#F39C12'),
  ('Health', '#E74C3C'),
  ('Learning', '#8B5CF6');
```

## 📱 WhatsApp Business API Setup

### Step 1: Facebook Developer Account

1. **Go to**: https://developers.facebook.com
2. **Create App**: Choose "Business" type
3. **App Name**: TaskChat Bot
4. **Business Use Case**: Task management and communication

### Step 2: Add WhatsApp Product

1. **Add Product**: Find WhatsApp → "Set up"
2. **Phone Number**: Add your business phone number
3. **Verify**: Complete SMS verification

### Step 3: Get Credentials

**Copy these values:**
- **Phone Number ID**: From WhatsApp setup page
- **Access Token**: Temporary token for testing

### Step 4: Configure Webhook

**In WhatsApp Configuration:**
```
Callback URL: https://taskchat-bot.pages.dev/webhook
Verify Token: taskbot_verify_token_2025
Webhook Fields: ☑️ messages
```

Click "Verify and save" - should show ✅ Success.

### Step 5: Update Environment Variables

**Back in Cloudflare Pages** → Settings → Environment variables:

```
WHATSAPP_TOKEN = EAAxxxxxxxxxxxxxx (your access token)
WHATSAPP_VERIFY_TOKEN = taskbot_verify_token_2025
PHONE_NUMBER_ID = 123456789012345 (your phone number ID)
```

**Save** → This will redeploy your app.

## 🧪 Testing Your Published App

### Step 1: Test Deployment

```bash
# Health check
curl https://taskchat-bot.pages.dev/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Step 2: Test Webhook

```bash
# Webhook verification
curl "https://taskchat-bot.pages.dev/webhook?hub.mode=subscribe&hub.verify_token=taskbot_verify_token_2025&hub.challenge=test123"

# Should return: test123
```

### Step 3: Test Bot Commands

Send these messages to your WhatsApp Business number:

```
help
```
**Expected**: Full command menu

```
add Test production deployment due today
```
**Expected**: "✅ Task added: Test production deployment..."

```
list
```
**Expected**: Shows your test task

```
complete 1
```
**Expected**: "🎉 Completed: Test production deployment..."

## ✅ Success Indicators

Your TaskChat Bot is successfully published when:

- [ ] **Cloudflare Pages deployed** with green build status
- [ ] **D1 database created** and migrated  
- [ ] **Environment variables** configured
- [ ] **Webhook verified** by Facebook (✅ Success)
- [ ] **Bot responds** to "help" command
- [ ] **Tasks work**: add, list, complete, delete
- [ ] **Categories work**: create and assign

## 🌐 Your Published URLs

After successful deployment:

- **Main App**: https://taskchat-bot.pages.dev
- **Webhook**: https://taskchat-bot.pages.dev/webhook
- **Health Check**: https://taskchat-bot.pages.dev/health

## 🎯 Next Steps After Publishing

### 1. Custom Domain (Optional)
- Add your own domain (e.g., taskchat.exactfunnel.com)
- Update WhatsApp webhook URL accordingly

### 2. Production WhatsApp Setup
- Get permanent access token (24h+ validity)
- Complete business verification for higher limits
- Add team members to test recipients

### 3. Monitoring
- **Cloudflare Analytics**: Monitor traffic and performance
- **Pages Functions**: Check logs for errors
- **D1 Database**: Monitor queries and usage

## 🚨 Troubleshooting

### Common Issues:

**1. "Connection timed out" Error**
- **Cause**: Database ID placeholder still in wrangler.jsonc
- **Fix**: Update with real database ID, commit, redeploy

**2. Webhook verification fails**  
- **Cause**: Verify token mismatch or URL incorrect
- **Fix**: Ensure exact match: `taskbot_verify_token_2025`

**3. Bot doesn't respond**
- **Cause**: Environment variables missing or incorrect  
- **Fix**: Check all 3 variables in Cloudflare Pages settings

**4. Database errors**
- **Cause**: Tables not created or migrations not applied
- **Fix**: Run SQL commands in D1 Console

## 🎉 Congratulations!

Your TaskChat Bot is now **LIVE** and ready for business use!

### What You've Accomplished:
✅ **Professional messaging bot** deployed globally  
✅ **100% original branding** with TaskChat identity  
✅ **Trademark-free** business application  
✅ **Scalable architecture** with Cloudflare infrastructure  
✅ **Production-ready** task management system  

Your TaskChat Bot is now accessible worldwide and ready to help manage tasks through secure messaging! 🚀

## 📞 Support Resources

- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp  
- **Your Repository**: https://github.com/exactfunnel/whatsapp-taskbot