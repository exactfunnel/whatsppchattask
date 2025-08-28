# 📱 WhatsApp Business API Setup Guide

## 🎯 After Cloudflare Deployment - Next Steps

Once your bot is deployed to Cloudflare Pages, follow these steps to connect it with WhatsApp Business API.

## 📋 Prerequisites

✅ **Completed**: Bot deployed to Cloudflare Pages  
✅ **Completed**: D1 database created and configured  
⏳ **Next**: WhatsApp Business API setup  
⏳ **Next**: Webhook configuration  
⏳ **Next**: Testing and go-live  

## 🔧 Step 1: Get Your Production URLs

After deployment, you should have:
- **Main URL**: `https://whatsapp-taskbot.pages.dev`
- **Webhook URL**: `https://whatsapp-taskbot.pages.dev/webhook`
- **Health Check**: `https://whatsapp-taskbot.pages.dev/health`

Test these URLs to ensure they're working:
```bash
curl https://whatsapp-taskbot.pages.dev/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 🏢 Step 2: WhatsApp Business Account Setup

### 2.1 Business Verification
1. **WhatsApp Business Account** (if you don't have one)
   - Download WhatsApp Business app
   - Verify your business phone number
   - Complete business profile

2. **Meta Business Account** 
   - Go to https://business.facebook.com
   - Create or use existing business account
   - Verify your business (required for API access)

### 2.2 Meta Developer Account
1. **Facebook Developers Portal**
   - Go to https://developers.facebook.com
   - Create developer account if needed
   - Verify your account

## 🚀 Step 3: Create WhatsApp Business API App

### 3.1 Create Facebook App
1. **Go to Facebook Developers**: https://developers.facebook.com/apps
2. **Create App** → Choose **Business** type
3. **App Name**: `WhatsApp TaskBot` (or your preferred name)
4. **Contact Email**: Your business email
5. **Business Account**: Select your Meta Business account

### 3.2 Add WhatsApp Product
1. In your app dashboard, click **"Add Product"**
2. Find **WhatsApp** → Click **"Set up"**
3. **Choose Business Account** → Select your verified business
4. **Add Phone Number** → Add your WhatsApp Business number

### 3.3 Get API Credentials
After setup, you'll get:
- **App ID**: `123456789012345`
- **App Secret**: `abcd1234efgh5678ijkl9012mnop3456`
- **Phone Number ID**: `987654321098765`
- **Business Account ID**: `456789012345678`

## 🔌 Step 4: Configure Webhook

### 4.1 Set Webhook URL
1. In WhatsApp product settings
2. **Configuration** → **Webhook**
3. **Callback URL**: `https://whatsapp-taskbot.pages.dev/webhook`
4. **Verify Token**: `taskbot_verify_token_2025`
5. Click **"Verify and Save"**

### 4.2 Subscribe to Webhook Fields
Check these webhook fields:
- ✅ **messages** (required)
- ✅ **message_deliveries** (optional)
- ✅ **message_reads** (optional)

### 4.3 Test Webhook
1. Click **"Test"** button in webhook settings
2. Should see success message
3. Check your Cloudflare Pages logs for verification

## 🔑 Step 5: Get Access Token

### 5.1 Temporary Token (Testing)
1. In WhatsApp API setup page
2. **API Setup** → **Temporary Access Token**
3. Copy the token (valid for 24 hours)

### 5.2 Permanent Token (Production)
1. **System Users** → Create system user
2. **Assets** → Assign WhatsApp permissions
3. **Generate Access Token** → Copy permanent token

## ⚙️ Step 6: Update Environment Variables

Add these to your Cloudflare Pages environment:

```bash
# In Cloudflare Pages Settings → Environment Variables
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxx  # Your access token
WHATSAPP_VERIFY_TOKEN=taskbot_verify_token_2025
PHONE_NUMBER_ID=987654321098765  # Your phone number ID
```

### 6.1 Update Code with Phone Number ID
In your deployed code, update this line in `src/index.tsx`:
```typescript
// Replace YOUR_PHONE_NUMBER_ID with actual ID
const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`
```

To:
```typescript
const response = await fetch(`https://graph.facebook.com/v17.0/987654321098765/messages`
```

## 🧪 Step 7: Test Your Bot

### 7.1 Send Test Messages
1. **Add your phone number** to WhatsApp test numbers (in developer console)
2. **Send messages** to your WhatsApp Business number:
   ```
   help
   add Buy groceries
   list
   complete 1
   ```

### 7.2 Check Logs
- **Cloudflare Pages** → Functions → View logs
- Look for webhook messages and responses

### 7.3 Expected Bot Responses
```
You: "help"
Bot: "🤖 Task Manager Bot
     Commands:
     • add [task] - Add new task
     • list - Show all pending tasks
     ..."

You: "add Buy groceries"  
Bot: "✅ Task added: Buy groceries
     Type 'list' to see all your tasks!"
```

## 🏭 Step 8: Production Setup

### 8.1 Business Verification (Required for Production)
1. **Business Verification**: Complete Meta business verification
2. **App Review**: Submit WhatsApp app for review
3. **Phone Number**: Get official WhatsApp Business phone number

### 8.2 Rate Limits
- **Development**: 50 messages/day to 5 test numbers
- **Production**: 1,000+ messages/day to any number

### 8.3 Webhook Security (Recommended)
Add webhook signature verification for production:
```typescript
// Verify webhook signature
const signature = req.headers['x-hub-signature-256']
const payload = req.body
// Validate signature with app secret
```

## 🔍 Step 9: Monitoring & Maintenance

### 9.1 Monitor Usage
- **Meta Business Dashboard** → WhatsApp API usage
- **Cloudflare Analytics** → Pages traffic and errors
- **Database Usage** → D1 operations and storage

### 9.2 Error Handling
Common issues and solutions:
- **Token expiry** → Regenerate access token
- **Rate limiting** → Implement queue system
- **Webhook failures** → Check endpoint health

### 9.3 Updates and Maintenance
- **Code updates** → Push to GitHub → Auto-deploy
- **Database migrations** → Apply via wrangler CLI
- **Feature additions** → Update webhook handlers

## 🎯 Success Checklist

After completing all steps, you should have:

- ✅ **Bot deployed** to Cloudflare Pages
- ✅ **Webhook configured** and verified
- ✅ **WhatsApp Business API** connected
- ✅ **Environment variables** set
- ✅ **Database** working with migrations applied
- ✅ **Test messages** working correctly
- ✅ **All bot commands** responding properly

## 📞 Support Resources

- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Meta Business Help**: https://business.facebook.com/help

## 🚨 Troubleshooting

### Common Issues:
1. **Webhook not receiving messages** → Check URL and verify token
2. **Bot not responding** → Check environment variables and logs
3. **Database errors** → Verify D1 database ID and migrations
4. **Token errors** → Regenerate access token

Your WhatsApp Task Manager Bot will be fully operational once these steps are complete! 🎉