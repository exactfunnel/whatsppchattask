import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
}

type Task = {
  id: number;
  title: string;
  due_date?: string;
  category_id?: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_color?: string;
}

type Category = {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

type WhatsAppMessage = {
  messaging_product: string;
  to: string;
  type: string;
  text: {
    body: string;
  };
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// ===== WHATSAPP WEBHOOK ENDPOINTS =====

// WhatsApp webhook verification
app.get('/webhook', (c) => {
  const mode = c.req.query('hub.mode')
  const token = c.req.query('hub.verify_token')
  const challenge = c.req.query('hub.challenge')
  
  const verifyToken = c.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token'
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED')
    return c.text(challenge)
  } else {
    return c.text('Forbidden', 403)
  }
})

// WhatsApp webhook for receiving messages
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json()
    console.log('Webhook received:', JSON.stringify(body, null, 2))
    
    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0]
      const phoneNumber = message.from
      const messageText = message.text.body.trim()
      
      console.log(`Message from ${phoneNumber}: ${messageText}`)
      
      // Process the message and send response
      await processWhatsAppMessage(c, phoneNumber, messageText)
    }
    
    return c.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// Process WhatsApp messages and respond
async function processWhatsAppMessage(c: any, phoneNumber: string, messageText: string) {
  const { env } = c
  let response = ''
  
  try {
    // Convert message to lowercase for processing
    const msg = messageText.toLowerCase()
    
    // Help command
    if (msg === 'help' || msg === '/help' || msg === 'menu') {
      response = `🤖 *Task Manager Bot*

*Commands:*
• \`add [task]\` - Add new task
• \`add [task] due [date]\` - Add task with due date
• \`add [task] cat [category]\` - Add task with category
• \`list\` - Show all pending tasks
• \`done\` - Show completed tasks
• \`all\` - Show all tasks
• \`complete [number]\` - Mark task as done
• \`delete [number]\` - Delete task
• \`categories\` - Show all categories
• \`newcat [name]\` - Create new category
• \`help\` - Show this menu

*Examples:*
\`add Buy groceries due tomorrow cat Shopping\`
\`complete 2\`
\`list\`
\`newcat Work\`

Start by typing *add* followed by your task! 📝`
      
    // Add task command
    } else if (msg.startsWith('add ')) {
      response = await handleAddTask(env, messageText.substring(4))
      
    // List tasks commands
    } else if (msg === 'list' || msg === 'tasks') {
      response = await handleListTasks(env, false)
    } else if (msg === 'done' || msg === 'completed') {
      response = await handleListTasks(env, true)
    } else if (msg === 'all') {
      response = await handleListTasks(env, null)
      
    // Complete task command
    } else if (msg.startsWith('complete ') || msg.startsWith('done ')) {
      const taskNumber = parseInt(msg.split(' ')[1])
      response = await handleCompleteTask(env, taskNumber)
      
    // Delete task command
    } else if (msg.startsWith('delete ') || msg.startsWith('remove ')) {
      const taskNumber = parseInt(msg.split(' ')[1])
      response = await handleDeleteTask(env, taskNumber)
      
    // Categories commands
    } else if (msg === 'categories' || msg === 'cats') {
      response = await handleListCategories(env)
    } else if (msg.startsWith('newcat ')) {
      const categoryName = messageText.substring(7).trim()
      response = await handleAddCategory(env, categoryName)
      
    // Default response
    } else {
      response = `❓ I didn't understand that command.

Type *help* to see all available commands.

Quick tip: Try \`add Buy milk\` to add a task! 📝`
    }
    
    // Send response back to WhatsApp
    await sendWhatsAppMessage(c, phoneNumber, response)
    
  } catch (error) {
    console.error('Message processing error:', error)
    await sendWhatsAppMessage(c, phoneNumber, '❌ Sorry, something went wrong. Please try again.')
  }
}

// Handle adding a new task
async function handleAddTask(env: any, taskInput: string): Promise<string> {
  try {
    let taskTitle = taskInput.trim()
    let dueDate = null
    let categoryName = null
    let categoryId = null
    
    // Parse due date
    const dueDateMatch = taskInput.match(/due\s+(.+?)(?:\s+cat\s|$)/i)
    if (dueDateMatch) {
      const dateStr = dueDateMatch[1].trim()
      dueDate = parseDateString(dateStr)
      taskTitle = taskTitle.replace(/due\s+.+?(?=\s+cat\s|$)/i, '').trim()
    }
    
    // Parse category
    const categoryMatch = taskInput.match(/cat\s+(.+?)$/i)
    if (categoryMatch) {
      categoryName = categoryMatch[1].trim()
      taskTitle = taskTitle.replace(/cat\s+.+$/i, '').trim()
      
      // Find or create category
      const existingCategory = await env.DB.prepare(`
        SELECT * FROM categories WHERE LOWER(name) = LOWER(?)
      `).bind(categoryName).first()
      
      if (existingCategory) {
        categoryId = existingCategory.id
      } else {
        // Create new category
        const newCategory = await env.DB.prepare(`
          INSERT INTO categories (name, color) VALUES (?, ?)
        `).bind(categoryName, '#10B981').run()
        categoryId = newCategory.meta.last_row_id
      }
    }
    
    if (!taskTitle) {
      return '❌ Please provide a task title.\n\nExample: `add Buy groceries`'
    }
    
    // Create the task
    const result = await env.DB.prepare(`
      INSERT INTO tasks (title, due_date, category_id)
      VALUES (?, ?, ?)
    `).bind(taskTitle, dueDate, categoryId).run()
    
    if (!result.success) {
      return '❌ Failed to add task. Please try again.'
    }
    
    let response = `✅ Task added: *${taskTitle}*`
    
    if (dueDate) {
      response += `\n📅 Due: ${formatDate(dueDate)}`
    }
    
    if (categoryName) {
      response += `\n📁 Category: ${categoryName}`
    }
    
    response += '\n\nType `list` to see all your tasks!'
    
    return response
    
  } catch (error) {
    console.error('Add task error:', error)
    return '❌ Failed to add task. Please try again.'
  }
}

// Handle listing tasks
async function handleListTasks(env: any, completed: boolean | null): Promise<string> {
  try {
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
    `
    
    const params = []
    if (completed !== null) {
      query += ' WHERE t.completed = ?'
      params.push(completed ? 1 : 0)
    }
    
    query += ' ORDER BY t.due_date ASC, t.created_at DESC'
    
    const result = await env.DB.prepare(query).bind(...params).all()
    const tasks = result.results as Task[]
    
    if (tasks.length === 0) {
      if (completed === true) {
        return '🎉 No completed tasks yet. Complete some tasks to see them here!'
      } else if (completed === false) {
        return '📝 No pending tasks! Add a new task with `add [task title]`'
      } else {
        return '📝 No tasks found. Add your first task with `add [task title]`'
      }
    }
    
    let response = ''
    if (completed === true) {
      response = '✅ *Completed Tasks:*\n\n'
    } else if (completed === false) {
      response = '📋 *Your Tasks:*\n\n'
    } else {
      response = '📋 *All Tasks:*\n\n'
    }
    
    tasks.forEach((task, index) => {
      const number = index + 1
      const status = task.completed ? '✅' : '⭕'
      const title = task.completed ? `~${task.title}~` : task.title
      
      response += `${status} *${number}.* ${title}`
      
      if (task.category_name) {
        response += ` 📁${task.category_name}`
      }
      
      if (task.due_date) {
        const dueStatus = getDueStatus(task.due_date)
        response += ` ${dueStatus.emoji}${dueStatus.text}`
      }
      
      response += '\n'
    })
    
    if (completed === false) {
      response += '\n💡 *Quick actions:*'
      response += '\n• `complete [number]` - Mark as done'
      response += '\n• `delete [number]` - Remove task'
    }
    
    return response
    
  } catch (error) {
    console.error('List tasks error:', error)
    return '❌ Failed to load tasks. Please try again.'
  }
}

// Handle completing a task
async function handleCompleteTask(env: any, taskNumber: number): Promise<string> {
  try {
    if (!taskNumber || taskNumber < 1) {
      return '❌ Please provide a valid task number.\n\nExample: `complete 2`'
    }
    
    // Get pending tasks to find the right one by number
    const result = await env.DB.prepare(`
      SELECT * FROM tasks WHERE completed = 0 ORDER BY due_date ASC, created_at DESC
    `).all()
    
    const tasks = result.results as Task[]
    
    if (taskNumber > tasks.length) {
      return `❌ Task ${taskNumber} not found. You have ${tasks.length} pending tasks.`
    }
    
    const task = tasks[taskNumber - 1]
    
    // Mark task as completed
    await env.DB.prepare(`
      UPDATE tasks SET completed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(task.id).run()
    
    return `🎉 Completed: *${task.title}*\n\nGreat job! Type \`list\` to see remaining tasks.`
    
  } catch (error) {
    console.error('Complete task error:', error)
    return '❌ Failed to complete task. Please try again.'
  }
}

// Handle deleting a task
async function handleDeleteTask(env: any, taskNumber: number): Promise<string> {
  try {
    if (!taskNumber || taskNumber < 1) {
      return '❌ Please provide a valid task number.\n\nExample: `delete 2`'
    }
    
    // Get all tasks to find the right one by number
    const result = await env.DB.prepare(`
      SELECT * FROM tasks ORDER BY completed ASC, due_date ASC, created_at DESC
    `).all()
    
    const tasks = result.results as Task[]
    
    if (taskNumber > tasks.length) {
      return `❌ Task ${taskNumber} not found. You have ${tasks.length} total tasks.`
    }
    
    const task = tasks[taskNumber - 1]
    
    // Delete the task
    await env.DB.prepare(`
      DELETE FROM tasks WHERE id = ?
    `).bind(task.id).run()
    
    return `🗑️ Deleted: *${task.title}*\n\nType \`list\` to see remaining tasks.`
    
  } catch (error) {
    console.error('Delete task error:', error)
    return '❌ Failed to delete task. Please try again.'
  }
}

// Handle listing categories
async function handleListCategories(env: any): Promise<string> {
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM categories ORDER BY name ASC
    `).all()
    
    const categories = result.results as Category[]
    
    if (categories.length === 0) {
      return '📁 No categories yet.\n\nCreate one with: `newcat Work`'
    }
    
    let response = '📁 *Your Categories:*\n\n'
    
    categories.forEach((category, index) => {
      response += `${index + 1}. *${category.name}*\n`
    })
    
    response += '\n💡 Use categories when adding tasks:\n`add Buy milk cat Shopping`'
    
    return response
    
  } catch (error) {
    console.error('List categories error:', error)
    return '❌ Failed to load categories. Please try again.'
  }
}

// Handle adding a new category
async function handleAddCategory(env: any, categoryName: string): Promise<string> {
  try {
    if (!categoryName) {
      return '❌ Please provide a category name.\n\nExample: `newcat Work`'
    }
    
    // Check if category already exists
    const existing = await env.DB.prepare(`
      SELECT * FROM categories WHERE LOWER(name) = LOWER(?)
    `).bind(categoryName).first()
    
    if (existing) {
      return `❌ Category "*${categoryName}*" already exists!`
    }
    
    // Create the category
    const result = await env.DB.prepare(`
      INSERT INTO categories (name, color) VALUES (?, ?)
    `).bind(categoryName, '#10B981').run()
    
    if (!result.success) {
      return '❌ Failed to create category. Please try again.'
    }
    
    return `✅ Created category: *${categoryName}*\n\nNow you can use it: \`add [task] cat ${categoryName}\``
    
  } catch (error) {
    console.error('Add category error:', error)
    return '❌ Failed to create category. Please try again.'
  }
}

// Send message to WhatsApp
async function sendWhatsAppMessage(c: any, phoneNumber: string, message: string) {
  try {
    const { env } = c
    const accessToken = env.WHATSAPP_TOKEN
    
    if (!accessToken) {
      console.log('WhatsApp token not configured, message would be:', message)
      return
    }
    
    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    }
    
    const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whatsappMessage)
    })
    
    if (!response.ok) {
      console.error('WhatsApp API error:', await response.text())
    }
    
  } catch (error) {
    console.error('Send message error:', error)
  }
}

// Utility functions
function parseDateString(dateStr: string): string | null {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const lowerStr = dateStr.toLowerCase()
  
  if (lowerStr === 'today') {
    return today.toISOString().split('T')[0]
  } else if (lowerStr === 'tomorrow') {
    return tomorrow.toISOString().split('T')[0]
  } else {
    // Try to parse as date
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
  }
  
  return null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString()
  }
}

function getDueStatus(dateStr: string) {
  const dueDate = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  today.setHours(0, 0, 0, 0)
  tomorrow.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  if (dueDate < today) {
    return { emoji: '🔴', text: 'Overdue' }
  } else if (dueDate.getTime() === today.getTime()) {
    return { emoji: '🔶', text: 'Due Today' }
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return { emoji: '🔶', text: 'Due Tomorrow' }
  } else {
    return { emoji: '📅', text: formatDate(dateStr) }
  }
}

// ===== WEB INTERFACE (FOR SETUP/TESTING) =====

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp Task Manager Bot</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .whatsapp-green { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); }
        </style>
    </head>
    <body class="bg-gray-100 min-h-screen">
        <div class="whatsapp-green text-white p-6 shadow-lg">
            <div class="max-w-4xl mx-auto text-center">
                <i class="fab fa-whatsapp text-6xl mb-4"></i>
                <h1 class="text-3xl font-bold mb-2">WhatsApp Task Manager Bot</h1>
                <p class="text-lg opacity-90">Manage your tasks directly in WhatsApp!</p>
            </div>
        </div>
        
        <div class="max-w-4xl mx-auto p-6">
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold mb-4 flex items-center">
                    <i class="fas fa-robot text-blue-500 mr-3"></i>
                    How to Use
                </h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-3">📝 Adding Tasks</h3>
                        <div class="space-y-2 text-sm bg-gray-50 p-3 rounded">
                            <div><code class="bg-green-100 px-2 py-1 rounded">add Buy groceries</code></div>
                            <div><code class="bg-green-100 px-2 py-1 rounded">add Call dentist due tomorrow</code></div>
                            <div><code class="bg-green-100 px-2 py-1 rounded">add Meeting prep cat Work</code></div>
                            <div><code class="bg-green-100 px-2 py-1 rounded">add Buy milk due today cat Shopping</code></div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold mb-3">✅ Managing Tasks</h3>
                        <div class="space-y-2 text-sm bg-gray-50 p-3 rounded">
                            <div><code class="bg-blue-100 px-2 py-1 rounded">list</code> - Show pending tasks</div>
                            <div><code class="bg-blue-100 px-2 py-1 rounded">complete 2</code> - Mark task 2 as done</div>
                            <div><code class="bg-blue-100 px-2 py-1 rounded">delete 3</code> - Remove task 3</div>
                            <div><code class="bg-blue-100 px-2 py-1 rounded">done</code> - Show completed tasks</div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold mb-3">📁 Categories</h3>
                        <div class="space-y-2 text-sm bg-gray-50 p-3 rounded">
                            <div><code class="bg-purple-100 px-2 py-1 rounded">categories</code> - List all categories</div>
                            <div><code class="bg-purple-100 px-2 py-1 rounded">newcat Work</code> - Create new category</div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold mb-3">❓ Help</h3>
                        <div class="space-y-2 text-sm bg-gray-50 p-3 rounded">
                            <div><code class="bg-gray-100 px-2 py-1 rounded">help</code> - Show all commands</div>
                            <div><code class="bg-gray-100 px-2 py-1 rounded">menu</code> - Command menu</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold mb-4 flex items-center">
                    <i class="fas fa-cog text-gray-500 mr-3"></i>
                    Setup Instructions
                </h2>
                
                <div class="space-y-4">
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <h3 class="font-semibold">🔧 WhatsApp Business API Setup Required</h3>
                        <p class="text-sm mt-2">To use this bot, you need to:</p>
                        <ol class="list-decimal ml-4 mt-2 text-sm space-y-1">
                            <li>Create a WhatsApp Business account</li>
                            <li>Set up Facebook Developer App</li>
                            <li>Configure webhook URL: <code class="bg-gray-100 px-1">/webhook</code></li>
                            <li>Add environment variables: WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN</li>
                        </ol>
                    </div>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <h3 class="font-semibold">🌐 Webhook Endpoint</h3>
                        <p class="text-sm mt-2">Webhook URL for WhatsApp:</p>
                        <code class="bg-gray-100 px-2 py-1 rounded text-sm">https://your-domain.pages.dev/webhook</code>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-4 flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-3"></i>
                    Features
                </h2>
                
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-gray-50 rounded">
                        <i class="fas fa-plus-circle text-green-500 text-2xl mb-2"></i>
                        <h3 class="font-semibold">Easy Task Creation</h3>
                        <p class="text-sm text-gray-600">Add tasks with natural language</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded">
                        <i class="fas fa-calendar text-blue-500 text-2xl mb-2"></i>
                        <h3 class="font-semibold">Due Date Tracking</h3>
                        <p class="text-sm text-gray-600">Set due dates with "today" or "tomorrow"</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded">
                        <i class="fas fa-folder text-purple-500 text-2xl mb-2"></i>
                        <h3 class="font-semibold">Category Management</h3>
                        <p class="text-sm text-gray-600">Organize tasks with categories</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app