# 📱 Step-by-Step WhatsApp Business API Setup

## 🎉 Great News! Your Bot is Deployed Successfully

Since you can see the setup page, your Cloudflare deployment is working perfectly. Now let's connect it to WhatsApp Business API.

## 📋 What You'll Need (15 minutes setup)

- ✅ **Bot Deployed** - Done! ✅
- ⏳ **WhatsApp Business Account** - We'll set this up
- ⏳ **Facebook Developer Account** - We'll create this  
- ⏳ **Meta Business Account** - We'll verify this
- ⏳ **Environment Variables** - We'll configure these

## 🚀 Step 1: Create Meta Business Account (5 minutes)

### 1.1 Meta Business Manager
1. **Go to**: https://business.facebook.com
2. **Create Account** or **Sign In** with existing Facebook account
3. **Business Name**: `Sky Roofing Construction TX` (or your business name)
4. **Your Name**: Your full name
5. **Business Email**: Your business email

### 1.2 Verify Business (Important!)
1. **Business Settings** → **Business Info**
2. **Add business address** and phone number
3. **Business verification** may be required for production use

## 📱 Step 2: WhatsApp Business Account (3 minutes)

### 2.1 Download WhatsApp Business App
1. **Download**: WhatsApp Business from App Store/Google Play
2. **Register** with your business phone number
3. **Complete business profile**:
   - Business name: Sky Roofing Construction TX
   - Category: Construction/Home Improvement
   - Description: Award-winning roofing services
   - Business hours, location, etc.

### 2.2 Verify Phone Number
- **Important**: This will be your bot's WhatsApp number
- Keep this number active and accessible

## 🛠️ Step 3: Facebook Developer Account (5 minutes)

### 3.1 Create Developer Account
1. **Go to**: https://developers.facebook.com
2. **Get Started** → **Create Account**
3. **Accept Terms** and verify account
4. **Complete developer profile**

### 3.2 Create WhatsApp App
1. **My Apps** → **Create App**
2. **App Type**: Choose **Business**
3. **App Name**: `Sky Roofing TaskBot` (or your preferred name)
4. **Contact Email**: Your email
5. **Business Account**: Select the Meta Business account you created

## 🔌 Step 4: Add WhatsApp Product (7 minutes)

### 4.1 Add WhatsApp to Your App
1. In your app dashboard, find **WhatsApp**
2. Click **Set up** button
3. **Get Started** with WhatsApp Business API

### 4.2 Business Account Connection
1. **Select Business Portfolio**: Choose your business
2. **Create WhatsApp Business Account** or select existing
3. **Add Phone Number**: 
   - Click **Add phone number**
   - Enter your WhatsApp Business number
   - **Verify** with SMS code

### 4.3 Get Your Credentials
After setup, you'll see:
- **Phone Number ID**: `123456789012345` (copy this!)
- **WhatsApp Business Account ID**: `456789012345678`
- **Temporary Access Token**: `EAAxxxxxxxxxxxxxxx` (copy this!)

## ⚙️ Step 5: Configure Webhook (3 minutes)

### 5.1 Webhook Configuration
1. In WhatsApp API setup page
2. **Configuration** section → **Webhook**
3. **Callback URL**: `https://whatsapp.skyroofingconstructiontx.co/webhook`
4. **Verify Token**: `taskbot_verify_token_2025`
5. Click **Verify and save**

### 5.2 Subscribe to Events
Check these webhook fields:
- ✅ **messages** (required for bot to receive messages)
- ✅ **message_deliveries** (optional - message status)
- ✅ **message_reads** (optional - read receipts)

### 5.3 Test Webhook (Should succeed!)
Click **Test** button - should show ✅ Success

## 🔑 Step 6: Add Environment Variables (2 minutes)

### 6.1 Go to Cloudflare Pages
1. **Cloudflare Dashboard** → **Pages** → **whatsapp-taskbot**
2. **Settings** → **Environment variables**
3. **Add variables** for **Production**:

```
Variable name: WHATSAPP_TOKEN
Value: EAAxxxxxxxxxxxxxxx  (your access token from Step 4.3)

Variable name: WHATSAPP_VERIFY_TOKEN  
Value: taskbot_verify_token_2025

Variable name: PHONE_NUMBER_ID
Value: 123456789012345  (your phone number ID from Step 4.3)
```

### 6.2 Save and Deploy
- **Save** environment variables
- **Redeploy** your Pages project to apply changes

## 🧪 Step 7: Test Your Bot! (2 minutes)

### 7.1 Add Test Number
1. **WhatsApp API Setup** → **API Setup**  
2. **Recipient phone number** → Add your personal phone number
3. **Send test message** to verify connection

### 7.2 Send Bot Commands
Send these messages to your WhatsApp Business number:

```
help
```
**Expected Response**:
```
🤖 Task Manager Bot

Commands:
• add [task] - Add new task
• list - Show all pending tasks
• complete [number] - Mark task as done
...
```

### 7.3 Test Task Management
```
add Buy roofing materials due tomorrow
```
**Expected Response**:
```
✅ Task added: Buy roofing materials
📅 Due: Tomorrow

Type 'list' to see all your tasks!
```

```
list
```
**Expected Response**:
```
📋 Your Tasks:

⭕ 1. Buy roofing materials 🔶Due Tomorrow

💡 Quick actions:
• complete [number] - Mark as done
• delete [number] - Remove task
```

## 🎯 Step 8: Production Setup (Optional)

### 8.1 Get Permanent Access Token
The temporary token expires in 24 hours. For production:

1. **System Users** (in Meta Business Manager)
2. **Create system user** → Assign WhatsApp permissions
3. **Generate access token** → Copy permanent token
4. **Update environment variable** with permanent token

### 8.2 Business Verification
For production use (1000+ messages/day):
- **Complete business verification** in Meta Business Manager
- **Submit app for review** (WhatsApp Business API)
- **Official phone number** approval

## 🎉 Success Checklist

After completing all steps:

- [ ] ✅ **Meta Business account** created and verified
- [ ] ✅ **WhatsApp Business** app installed and configured
- [ ] ✅ **Facebook Developer** account created
- [ ] ✅ **WhatsApp API app** created with phone number
- [ ] ✅ **Webhook configured** and verified
- [ ] ✅ **Environment variables** added to Cloudflare Pages
- [ ] ✅ **Bot responds** to "help" command
- [ ] ✅ **Task management** working (add, list, complete)

## 📞 Your Bot is Live!

**WhatsApp Number**: Your business number  
**Webhook URL**: https://whatsapp.skyroofingconstructiontx.co/webhook  
**Commands**: help, add, list, complete, delete, categories, newcat

## 💡 Pro Tips for Sky Roofing Business

### Example Tasks for Your Business:
```
add Schedule roof inspection due tomorrow
add Order shingles cat Materials  
add Follow up with Johnson estimate due Friday
add Complete Miller roof repair cat Active Jobs
```

### Business Categories:
```
newcat Estimates
newcat Materials  
newcat Active Jobs
newcat Follow-ups
newcat Inspections
```

## 🚨 Troubleshooting

### Bot not responding?
1. **Check environment variables** in Cloudflare Pages
2. **Verify webhook URL** is correct
3. **Test webhook endpoint**: `curl https://whatsapp.skyroofingconstructiontx.co/webhook`
4. **Check access token** is valid and not expired

### Webhook verification failed?
1. **Verify token** must match exactly: `taskbot_verify_token_2025`
2. **URL** must include `/webhook` at the end
3. **HTTPS** is required (not HTTP)

### Messages not received?
1. **Phone number** must be added to test recipients
2. **Business verification** may be required
3. **Check message limits** (50/day for unverified apps)

Your WhatsApp Task Manager Bot should be fully operational within 30 minutes of following these steps! 🚀