# 🛠️ Facebook Developer Account Setup - Step by Step

## 📱 Complete WhatsApp Business API Setup Guide

Follow these exact steps to get your WhatsApp Task Manager Bot connected.

## 🚀 Step 1: Create Facebook Developer Account (3 minutes)

### 1.1 Go to Facebook Developers
1. **Open**: https://developers.facebook.com
2. **Click "Get Started"** (top right)
3. **Log in** with your Facebook account
4. **Accept Terms** and complete verification if prompted

### 1.2 Verify Developer Account
- **Phone verification** may be required
- **Email confirmation** if needed
- **Complete developer profile**

## 🏢 Step 2: Create Business App (4 minutes)

### 2.1 Create New App
1. **Click "My Apps"** → **"Create App"**
2. **Choose "Business"** as app type ⭐
3. **Fill in app details**:

```
App Display Name: Sky Roofing TaskBot
App Contact Email: your-business-email@domain.com
Business Account: [Select or create new]
```

4. **Click "Create App"**

### 2.2 App Dashboard Access
- You'll be taken to your app dashboard
- **App ID** will be visible (save this)
- **App Secret** available in Basic Settings

## 📱 Step 3: Add WhatsApp Product (5 minutes)

### 3.1 Add WhatsApp to Your App
1. **In App Dashboard** → **"Add Product"** 
2. **Find "WhatsApp"** → **"Set up"**
3. **Get Started** with WhatsApp Business API

### 3.2 Business Account Setup
You'll see options to:
- **Create new WhatsApp Business Account**, OR
- **Connect existing Business Account**

**Choose**: **"Create new WhatsApp Business Account"**

### 3.3 Business Portfolio Creation
Fill in business details:
```
Business Portfolio Name: Sky Roofing Construction TX
Business Name: Sky Roofing Construction TX  
Business Website: https://skyroofingconstructiontx.co (if you have one)
Business Category: Construction/Home Improvement
```

## 📞 Step 4: Add Phone Number (3 minutes)

### 4.1 Add Your Business Phone Number
1. **In WhatsApp Setup** → **"Add phone number"**
2. **Enter your business phone number**
3. **Choose verification method**: SMS or Voice call
4. **Enter verification code** received

### 4.2 Phone Number Configuration
- **Display Name**: Sky Roofing Construction TX
- **About/Status**: Professional roofing and construction services
- **Profile Setup**: Complete business information

## 🔑 Step 5: Get Your Credentials (2 minutes)

After phone number setup, you'll see:

### 5.1 Phone Number ID ⭐
```
Phone Number ID: 123456789012345
```
**Copy this number** - you'll need it for environment variables

### 5.2 Access Token ⭐  
```
Temporary Access Token: EAAxxxxxxxxxxxxxxxxxxxxxx
```
**Copy this token** - valid for 24 hours (we'll get permanent later)

### 5.3 WhatsApp Business Account ID
```
WhatsApp Business Account ID: 987654321098765  
```
**Also copy this** for reference

## 🔌 Step 6: Configure Webhook (3 minutes)

### 6.1 Webhook Settings
1. **In WhatsApp Configuration** → **"Webhook"**
2. **Callback URL**: `https://whatsapp.skyroofingconstructiontx.co/webhook`
3. **Verify Token**: `taskbot_verify_token_2025`
4. **Click "Verify and Save"**

### 6.2 Subscribe to Webhook Fields
Check these boxes:
- ✅ **messages** (REQUIRED - to receive messages)
- ✅ **message_deliveries** (optional - delivery status)  
- ✅ **message_reads** (optional - read receipts)

### 6.3 Test Webhook
- **Click "Test"** button
- Should show ✅ **"Success"**
- If fails, check your webhook URL and verify token

## ⚙️ Step 7: Add Environment Variables to Cloudflare (2 minutes)

### 7.1 Go to Cloudflare Pages
1. **Cloudflare Dashboard** → **Pages** → **whatsapp-taskbot**
2. **Settings** → **Environment variables**
3. **Production** tab

### 7.2 Add These Variables
```
Variable: WHATSAPP_TOKEN
Value: EAAxxxxxxxxxxxxxxxxxxxxxx  (your access token from Step 5.2)

Variable: WHATSAPP_VERIFY_TOKEN  
Value: taskbot_verify_token_2025

Variable: PHONE_NUMBER_ID
Value: 123456789012345  (your phone number ID from Step 5.1)
```

### 7.3 Save and Redeploy
- **Save** all variables
- **Redeploy** your project to apply changes

## 🧪 Step 8: Test Your WhatsApp Bot (5 minutes)

### 8.1 Add Test Phone Number
1. **WhatsApp API Setup** → **"API Setup"** tab
2. **"To" field** → Add your personal phone number
3. **Send test message** to verify connection

### 8.2 Test Bot Commands
Send these messages to your **business phone number**:

#### Test 1: Help Command
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
• delete [number] - Delete task
• categories - Show categories
• newcat [name] - Create category
• help - Show this menu

Examples:
add Buy groceries due tomorrow cat Shopping
complete 2
list

Start by typing "add" followed by your task! 📝
```

#### Test 2: Add Task
```
add Buy roofing materials due tomorrow
```
**Expected Response**:
```
✅ Task added: Buy roofing materials
📅 Due: Tomorrow

Type 'list' to see all your tasks!
```

#### Test 3: List Tasks  
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

#### Test 4: Complete Task
```
complete 1
```
**Expected Response**:
```
🎉 Completed: Buy roofing materials

Great job! Type 'list' to see remaining tasks.
```

## 🎯 Success Indicators

Your WhatsApp bot is working when:
- ✅ **Webhook verified** successfully
- ✅ **Bot responds** to "help" command  
- ✅ **Tasks can be added** with "add" command
- ✅ **Tasks listed** with "list" command
- ✅ **Tasks completed** with "complete" command

## 🔧 Troubleshooting

### Webhook Verification Fails
- **Check URL**: Must be exact `https://whatsapp.skyroofingconstructiontx.co/webhook`
- **Check Token**: Must be exact `taskbot_verify_token_2025`
- **Test Endpoint**: `curl "https://whatsapp.skyroofingconstructiontx.co/webhook?hub.mode=subscribe&hub.verify_token=taskbot_verify_token_2025&hub.challenge=test"`

### Bot Doesn't Respond
- **Check Environment Variables**: Ensure all 3 variables added correctly
- **Redeploy**: After adding variables, redeploy Pages project
- **Check Phone Number**: Ensure test number added to recipients

### Message Limits
- **Development**: 50 messages/day to 5 test numbers
- **Production**: Need business verification for unlimited

## 🚀 Business Examples Ready to Use

Once working, perfect for your roofing business:

```
add Schedule Johnson roof inspection due Monday
add Order 20 bundles shingles cat Materials  
add Follow up Miller estimate due Friday cat Estimates
add Complete Wilson repair cat Active Jobs

newcat Estimates
newcat Materials  
newcat Active Jobs
newcat Inspections

list
complete 2
delete 4
```

## 📋 Credentials Summary

Keep these safe:
```
App ID: [from app dashboard]
Phone Number ID: 123456789012345
Access Token: EAAxxxxxxxxxxxxxxxxxxxxxx  
Business Account ID: 987654321098765
Webhook URL: https://whatsapp.skyroofingconstructiontx.co/webhook
Verify Token: taskbot_verify_token_2025
```

## 🎉 You're Done!

Your WhatsApp Task Manager Bot is now fully operational! 🚀

Test it with your team, use it for daily task management, and enjoy seamless task organization through WhatsApp messages.

## 📞 Support

If you encounter issues:
- **Check logs**: Cloudflare Pages → Functions → Logs
- **Verify webhook**: Test the webhook endpoint directly
- **Check token**: Ensure environment variables are correct

Your roofing business now has a professional task management bot! 🏗️📱