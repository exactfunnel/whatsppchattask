import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

type Task = {
  id: number;
  title: string;
  description?: string;
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

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== CATEGORY API ENDPOINTS =====

// Get all categories
app.get('/api/categories', async (c) => {
  try {
    const { env } = c
    const result = await env.DB.prepare(`
      SELECT * FROM categories ORDER BY name ASC
    `).all()
    
    return c.json({ categories: result.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch categories', details: error.message }, 500)
  }
})

// Create a new category
app.post('/api/categories', async (c) => {
  try {
    const { env } = c
    const { name, color = '#10B981' } = await c.req.json()
    
    if (!name || name.trim() === '') {
      return c.json({ error: 'Category name is required' }, 400)
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO categories (name, color) VALUES (?, ?)
    `).bind(name.trim(), color).run()
    
    if (!result.success) {
      return c.json({ error: 'Failed to create category' }, 500)
    }
    
    // Get the created category
    const newCategory = await env.DB.prepare(`
      SELECT * FROM categories WHERE id = ?
    `).bind(result.meta.last_row_id).first()
    
    return c.json({ category: newCategory }, 201)
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Category name already exists' }, 409)
    }
    return c.json({ error: 'Failed to create category', details: error.message }, 500)
  }
})

// Delete a category
app.delete('/api/categories/:id', async (c) => {
  try {
    const { env } = c
    const categoryId = c.req.param('id')
    
    // First, update tasks to remove category reference
    await env.DB.prepare(`
      UPDATE tasks SET category_id = NULL WHERE category_id = ?
    `).bind(categoryId).run()
    
    // Then delete the category
    const result = await env.DB.prepare(`
      DELETE FROM categories WHERE id = ?
    `).bind(categoryId).run()
    
    if (result.changes === 0) {
      return c.json({ error: 'Category not found' }, 404)
    }
    
    return c.json({ message: 'Category deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete category', details: error.message }, 500)
  }
})

// ===== TASK API ENDPOINTS =====

// Get all tasks with category information
app.get('/api/tasks', async (c) => {
  try {
    const { env } = c
    const completed = c.req.query('completed')
    const categoryId = c.req.query('category')
    
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
    `
    
    const conditions = []
    const params = []
    
    if (completed !== undefined) {
      conditions.push('t.completed = ?')
      params.push(completed === 'true' ? 1 : 0)
    }
    
    if (categoryId) {
      conditions.push('t.category_id = ?')
      params.push(categoryId)
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' ORDER BY t.due_date ASC, t.created_at DESC'
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    return c.json({ tasks: result.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch tasks', details: error.message }, 500)
  }
})

// Create a new task
app.post('/api/tasks', async (c) => {
  try {
    const { env } = c
    const { title, description, due_date, category_id } = await c.req.json()
    
    if (!title || title.trim() === '') {
      return c.json({ error: 'Task title is required' }, 400)
    }
    
    const result = await env.DB.prepare(`
      INSERT INTO tasks (title, description, due_date, category_id)
      VALUES (?, ?, ?, ?)
    `).bind(
      title.trim(),
      description || null,
      due_date || null,
      category_id || null
    ).run()
    
    if (!result.success) {
      return c.json({ error: 'Failed to create task' }, 500)
    }
    
    // Get the created task with category info
    const newTask = await env.DB.prepare(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).bind(result.meta.last_row_id).first()
    
    return c.json({ task: newTask }, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create task', details: error.message }, 500)
  }
})

// Update a task
app.put('/api/tasks/:id', async (c) => {
  try {
    const { env } = c
    const taskId = c.req.param('id')
    const { title, description, due_date, category_id, completed } = await c.req.json()
    
    const result = await env.DB.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, due_date = ?, category_id = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title,
      description || null,
      due_date || null,
      category_id || null,
      completed ? 1 : 0,
      taskId
    ).run()
    
    if (result.changes === 0) {
      return c.json({ error: 'Task not found' }, 404)
    }
    
    // Get the updated task with category info
    const updatedTask = await env.DB.prepare(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).bind(taskId).first()
    
    return c.json({ task: updatedTask })
  } catch (error) {
    return c.json({ error: 'Failed to update task', details: error.message }, 500)
  }
})

// Toggle task completion
app.patch('/api/tasks/:id/toggle', async (c) => {
  try {
    const { env } = c
    const taskId = c.req.param('id')
    
    // Get current task
    const currentTask = await env.DB.prepare(`
      SELECT completed FROM tasks WHERE id = ?
    `).bind(taskId).first()
    
    if (!currentTask) {
      return c.json({ error: 'Task not found' }, 404)
    }
    
    const newCompletedStatus = !currentTask.completed
    
    const result = await env.DB.prepare(`
      UPDATE tasks 
      SET completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newCompletedStatus ? 1 : 0, taskId).run()
    
    // Get the updated task with category info
    const updatedTask = await env.DB.prepare(`
      SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).bind(taskId).first()
    
    return c.json({ task: updatedTask })
  } catch (error) {
    return c.json({ error: 'Failed to toggle task', details: error.message }, 500)
  }
})

// Delete a task
app.delete('/api/tasks/:id', async (c) => {
  try {
    const { env } = c
    const taskId = c.req.param('id')
    
    const result = await env.DB.prepare(`
      DELETE FROM tasks WHERE id = ?
    `).bind(taskId).run()
    
    if (result.changes === 0) {
      return c.json({ error: 'Task not found' }, 404)
    }
    
    return c.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete task', details: error.message }, 500)
  }
})

// ===== FRONTEND ROUTE =====

// Main application route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Manager - WhatsApp Style</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .whatsapp-green { background-color: #25D366; }
            .chat-bubble {
                border-radius: 18px;
                position: relative;
                word-wrap: break-word;
            }
            .chat-bubble-sent {
                background-color: #DCF8C6;
                margin-left: 20%;
                border-bottom-right-radius: 4px;
            }
            .chat-bubble-received {
                background-color: #FFFFFF;
                margin-right: 20%;
                border-bottom-left-radius: 4px;
            }
            .task-completed {
                text-decoration: line-through;
                opacity: 0.6;
            }
            .category-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                color: white;
            }
        </style>
    </head>
    <body class="bg-gray-100 min-h-screen">
        <!-- Header -->
        <div class="whatsapp-green text-white p-4 shadow-lg">
            <div class="max-w-4xl mx-auto flex items-center">
                <i class="fas fa-tasks text-2xl mr-3"></i>
                <h1 class="text-xl font-semibold">Task Manager</h1>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="max-w-4xl mx-auto p-4">
            <!-- Add Task Form -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-4">
                <h2 class="text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-plus-circle text-green-500 mr-2"></i>
                    Add New Task
                </h2>
                <form id="taskForm" class="space-y-4">
                    <div>
                        <input type="text" id="taskTitle" placeholder="Task title..." 
                               class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                               required>
                    </div>
                    <div>
                        <textarea id="taskDescription" placeholder="Description (optional)..."
                                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                                  rows="2"></textarea>
                    </div>
                    <div class="flex space-x-4">
                        <div class="flex-1">
                            <input type="date" id="taskDueDate"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500">
                        </div>
                        <div class="flex-1">
                            <select id="taskCategory"
                                    class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500">
                                <option value="">Select category...</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" 
                            class="w-full whatsapp-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200">
                        <i class="fas fa-paper-plane mr-2"></i>
                        Add Task
                    </button>
                </form>
            </div>
            
            <!-- Category Management -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-4">
                <h2 class="text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-folder text-blue-500 mr-2"></i>
                    Manage Categories
                </h2>
                <div class="flex space-x-2 mb-4">
                    <input type="text" id="newCategoryName" placeholder="Category name..."
                           class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                    <input type="color" id="newCategoryColor" value="#10B981"
                           class="w-12 h-10 border border-gray-300 rounded-lg">
                    <button id="addCategoryBtn"
                            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div id="categoriesList" class="flex flex-wrap gap-2"></div>
            </div>
            
            <!-- Filter Controls -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-4">
                <div class="flex flex-wrap gap-4 items-center">
                    <div class="flex items-center space-x-2">
                        <label class="font-medium">Filter:</label>
                        <select id="statusFilter" class="p-2 border border-gray-300 rounded-lg">
                            <option value="all">All Tasks</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="flex items-center space-x-2">
                        <label class="font-medium">Category:</label>
                        <select id="categoryFilter" class="p-2 border border-gray-300 rounded-lg">
                            <option value="">All Categories</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Tasks Chat-like Container -->
            <div class="bg-white rounded-lg shadow-md">
                <div class="p-4 border-b">
                    <h2 class="text-lg font-semibold flex items-center">
                        <i class="fas fa-list text-green-500 mr-2"></i>
                        Your Tasks
                    </h2>
                </div>
                <div id="tasksContainer" class="p-4 space-y-4 min-h-96 max-h-96 overflow-y-auto">
                    <!-- Tasks will be loaded here -->
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app