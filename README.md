# TaskChat Bot - Professional Task Management 🤖

## Project Overview
- **Name**: TaskChat Bot
- **Goal**: Manage tasks directly through secure messaging using natural language
- **Type**: Business Messaging API Integration Bot
- **Features**: Natural language task management, category organization, due date tracking

## 📱 Live Demo & Setup
- **Production URL**: https://whatsapp-taskbot.pages.dev
- **Git Repository**: https://github.com/exactfunnel/whatsppchattask
- **Auto-Deploy**: Connected to GitHub main branch
- **Webhook Endpoint**: https://3000-ii4iwenlvds1ly2ypyfdu-6532622b.e2b.dev/webhook
- **Health Check**: https://3000-ii4iwenlvds1ly2ypyfdu-6532622b.e2b.dev/health

## ✨ TaskChat Commands

### 🎯 Basic Task Management
```
add Buy groceries
add Call dentist due tomorrow  
add Meeting prep cat Work
add Buy milk due today cat Shopping
```

### 📋 Viewing Tasks
```
list          - Show pending tasks
done          - Show completed tasks  
all           - Show all tasks
```

### ✅ Task Operations
```
complete 2    - Mark task #2 as done
delete 3      - Remove task #3
```

### 📁 Category Management
```
categories    - List all categories
newcat Work   - Create "Work" category
```

### ❓ Help
```
help          - Show command menu
menu          - Show command menu
```

## 🎮 How to Use in WhatsApp

### Step 1: Add a Task
Just type: **`add Buy groceries`**

The bot will respond: 
> ✅ Task added: **Buy groceries**
> 
> Type `list` to see all your tasks!

### Step 2: Add Task with Due Date
Type: **`add Call dentist due tomorrow`**

Response:
> ✅ Task added: **Call dentist**  
> 📅 Due: Tomorrow
> 
> Type `list` to see all your tasks!

### Step 3: View Your Tasks
Type: **`list`**

Response:
> 📋 **Your Tasks:**
>
> ⭕ **1.** Buy groceries  
> ⭕ **2.** Call dentist 🔶Due Tomorrow
>
> 💡 **Quick actions:**  
> • `complete [number]` - Mark as done  
> • `delete [number]` - Remove task

### Step 4: Complete a Task
Type: **`complete 1`**

Response:
> 🎉 Completed: **Buy groceries**
>
> Great job! Type `list` to see remaining tasks.

### Step 5: Create Categories
Type: **`newcat Shopping`**

Then: **`add Buy milk cat Shopping`**

Response:
> ✅ Task added: **Buy milk**  
> 📁 Category: Shopping

## 🔧 WhatsApp Business API Setup

### Prerequisites
1. **WhatsApp Business Account**
2. **Facebook Developer Account**  
3. **Verified Business**

### Setup Steps

#### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app → Business → WhatsApp
3. Add WhatsApp product to your app

#### 2. Configure Webhook
1. In WhatsApp settings, add webhook URL:
   ```
   https://your-domain.pages.dev/webhook
   ```
2. Set verify token: `taskbot_verify_token_2025`
3. Subscribe to `messages` webhook field

#### 3. Environment Variables
Add to your Cloudflare Pages environment:
```bash
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=taskbot_verify_token_2025
```

#### 4. Phone Number Configuration
1. Get WhatsApp Business phone number ID
2. Update the phone number ID in the code:
   ```typescript
   // Replace YOUR_PHONE_NUMBER_ID with actual ID
   const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages'
   ```

## 📊 Data Architecture

### Database Schema (Simplified)
- **Categories**: `id`, `name`, `color`, `created_at`
- **Tasks**: `id`, `title`, `due_date`, `category_id`, `completed`, `created_at`, `updated_at`

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/webhook` | WhatsApp webhook verification |
| POST | `/webhook` | Receive WhatsApp messages |
| GET | `/health` | Health check |
| GET | `/` | Setup documentation |

### Message Processing Flow
1. **Receive** → WhatsApp sends message to `/webhook`
2. **Parse** → Extract command and parameters
3. **Process** → Execute database operations  
4. **Respond** → Send formatted response to WhatsApp

## 🎯 Supported Natural Language Patterns

### Task Creation
- `add [task name]`
- `add [task name] due [date]`
- `add [task name] cat [category]`
- `add [task name] due [date] cat [category]`

### Date Parsing
- **Today**: `due today`
- **Tomorrow**: `due tomorrow`  
- **Specific Date**: `due 2025-08-25` or `due Aug 25`

### Task Management
- **List**: `list`, `tasks`
- **Complete**: `complete [number]`, `done [number]`
- **Delete**: `delete [number]`, `remove [number]`
- **Show Done**: `done`, `completed`

### Categories
- **List**: `categories`, `cats`
- **Create**: `newcat [name]`

## 🚀 Deployment Status

### Current Environment
- **Platform**: Cloudflare Pages + D1 Database
- **Status**: ✅ Webhook Ready (Development)
- **Tech Stack**: Hono + TypeScript + D1 + WhatsApp Business API

### Production Deployment
1. **Setup Cloudflare API key** (Deploy tab)
2. **Deploy to production**:
   ```bash
   npm run deploy:prod
   ```
3. **Configure WhatsApp webhook** with production URL
4. **Add environment variables** in Cloudflare Pages

## ✅ Features Completed

### 🤖 WhatsApp Integration
- ✅ **Webhook Verification** - WhatsApp Business API integration
- ✅ **Message Processing** - Natural language command parsing
- ✅ **Response Formatting** - WhatsApp-friendly message formatting
- ✅ **Error Handling** - User-friendly error messages

### 📝 Task Management
- ✅ **Add Tasks** - `add [task]` with optional due date and category
- ✅ **List Tasks** - Show pending, completed, or all tasks
- ✅ **Complete Tasks** - Mark tasks as done with `complete [number]`
- ✅ **Delete Tasks** - Remove tasks with `delete [number]`

### 📁 Category System  
- ✅ **Category Creation** - `newcat [name]` command
- ✅ **Category Assignment** - Add tasks to categories
- ✅ **Category Listing** - View all available categories

### 📅 Due Date Management
- ✅ **Date Parsing** - Natural language dates (today, tomorrow)
- ✅ **Due Status** - Visual indicators for overdue/due tasks
- ✅ **Date Formatting** - Human-friendly date display

## 🔄 Features Not Yet Implemented
- [ ] Task editing/updating via chat
- [ ] Recurring task setup
- [ ] Task priority levels  
- [ ] Bulk operations (complete all, delete all)
- [ ] Task search within chat
- [ ] Multi-user support with user authentication
- [ ] Task reminders/notifications
- [ ] File attachments to tasks

## 🎯 Recommended Next Steps
1. **Production Setup**: Deploy to Cloudflare Pages with proper WhatsApp API configuration
2. **User Testing**: Test with real WhatsApp Business account
3. **Task Editing**: Add ability to modify existing tasks via chat
4. **Notifications**: Implement proactive task reminders
5. **Multiple Users**: Add user identification and separate task lists
6. **Advanced Parsing**: Support more natural language patterns

## 🛠️ Technical Implementation

### WhatsApp Message Flow
```
WhatsApp → Facebook Graph API → Webhook → Message Parser → Database → Response → WhatsApp
```

### Command Processing
1. **Message Received** → Parse text body
2. **Command Extraction** → Identify action (add, list, complete, etc.)
3. **Parameter Parsing** → Extract task details, numbers, dates
4. **Database Operations** → CRUD operations on tasks/categories
5. **Response Generation** → Format user-friendly response
6. **WhatsApp Delivery** → Send via Graph API

### Natural Language Processing
- **Regex Patterns** for command matching
- **Date Parsing** for relative dates (today, tomorrow)
- **Category Extraction** from messages
- **Task Number Recognition** for operations

## 📱 Usage Examples

### Complete Workflow Example
```
User: "help"
Bot: Shows complete command menu

User: "add Buy groceries due tomorrow cat Shopping"  
Bot: "✅ Task added: Buy groceries
     📅 Due: Tomorrow
     📁 Category: Shopping"

User: "list"
Bot: "📋 Your Tasks:
     ⭕ 1. Buy groceries 📁Shopping 🔶Due Tomorrow"

User: "complete 1"
Bot: "🎉 Completed: Buy groceries
     Great job! Type 'list' to see remaining tasks."
```

**Last Updated**: August 20, 2025