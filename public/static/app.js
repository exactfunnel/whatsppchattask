// Task Manager Frontend JavaScript

class TaskManager {
    constructor() {
        this.tasks = [];
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadTasks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Add category button
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });

        // Filter controls
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.loadTasks();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.loadTasks();
        });

        // Enter key for new category
        document.getElementById('newCategoryName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCategory();
            }
        });
    }

    async loadCategories() {
        try {
            const response = await axios.get('/api/categories');
            this.categories = response.data.categories;
            this.updateCategorySelectors();
            this.renderCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.showNotification('Failed to load categories', 'error');
        }
    }

    async loadTasks() {
        try {
            const statusFilter = document.getElementById('statusFilter').value;
            const categoryFilter = document.getElementById('categoryFilter').value;

            let url = '/api/tasks?';
            const params = new URLSearchParams();

            if (statusFilter !== 'all') {
                params.append('completed', statusFilter === 'completed' ? 'true' : 'false');
            }

            if (categoryFilter) {
                params.append('category', categoryFilter);
            }

            const response = await axios.get('/api/tasks?' + params.toString());
            this.tasks = response.data.tasks;
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.showNotification('Failed to load tasks', 'error');
        }
    }

    async addTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const categoryId = document.getElementById('taskCategory').value;

        if (!title) {
            this.showNotification('Task title is required', 'error');
            return;
        }

        try {
            const taskData = {
                title,
                description: description || null,
                due_date: dueDate || null,
                category_id: categoryId ? parseInt(categoryId) : null
            };

            await axios.post('/api/tasks', taskData);
            
            // Clear form
            document.getElementById('taskForm').reset();
            
            // Reload tasks
            await this.loadTasks();
            
            this.showNotification('Task added successfully!', 'success');
        } catch (error) {
            console.error('Failed to add task:', error);
            this.showNotification('Failed to add task', 'error');
        }
    }

    async addCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        const color = document.getElementById('newCategoryColor').value;

        if (!name) {
            this.showNotification('Category name is required', 'error');
            return;
        }

        try {
            await axios.post('/api/categories', { name, color });
            
            // Clear inputs
            document.getElementById('newCategoryName').value = '';
            document.getElementById('newCategoryColor').value = '#10B981';
            
            // Reload categories
            await this.loadCategories();
            
            this.showNotification('Category added successfully!', 'success');
        } catch (error) {
            console.error('Failed to add category:', error);
            if (error.response?.status === 409) {
                this.showNotification('Category name already exists', 'error');
            } else {
                this.showNotification('Failed to add category', 'error');
            }
        }
    }

    async toggleTask(taskId) {
        try {
            await axios.patch(`/api/tasks/${taskId}/toggle`);
            await this.loadTasks();
        } catch (error) {
            console.error('Failed to toggle task:', error);
            this.showNotification('Failed to update task', 'error');
        }
    }

    async deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}`);
                await this.loadTasks();
                this.showNotification('Task deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete task:', error);
                this.showNotification('Failed to delete task', 'error');
            }
        }
    }

    async deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category? Tasks will be moved to "No Category".')) {
            try {
                await axios.delete(`/api/categories/${categoryId}`);
                await this.loadCategories();
                await this.loadTasks();
                this.showNotification('Category deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete category:', error);
                this.showNotification('Failed to delete category', 'error');
            }
        }
    }

    updateCategorySelectors() {
        const taskCategorySelect = document.getElementById('taskCategory');
        const categoryFilterSelect = document.getElementById('categoryFilter');

        // Clear existing options (keep first option)
        taskCategorySelect.innerHTML = '<option value="">Select category...</option>';
        categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';

        this.categories.forEach(category => {
            const taskOption = document.createElement('option');
            taskOption.value = category.id;
            taskOption.textContent = category.name;
            taskCategorySelect.appendChild(taskOption);

            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilterSelect.appendChild(filterOption);
        });
    }

    renderCategories() {
        const categoriesContainer = document.getElementById('categoriesList');
        categoriesContainer.innerHTML = '';

        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'flex items-center space-x-2 bg-gray-50 rounded-lg p-2';
            categoryElement.innerHTML = `
                <span class="category-badge" style="background-color: ${category.color}">
                    ${category.name}
                </span>
                <button onclick="taskManager.deleteCategory(${category.id})" 
                        class="text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            categoriesContainer.appendChild(categoryElement);
        });
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasksContainer');
        tasksContainer.innerHTML = '';

        if (this.tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No tasks found. Add your first task above!</p>
                </div>
            `;
            return;
        }

        this.tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            const isCompleted = task.completed;
            const bubbleClass = index % 2 === 0 ? 'chat-bubble-received' : 'chat-bubble-sent';
            
            // Format due date
            let dueDateDisplay = '';
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (dueDate.toDateString() === today.toDateString()) {
                    dueDateDisplay = '<span class="text-red-500 font-semibold">Due Today</span>';
                } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                    dueDateDisplay = '<span class="text-orange-500 font-semibold">Due Tomorrow</span>';
                } else if (dueDate < today) {
                    dueDateDisplay = '<span class="text-red-600 font-semibold">Overdue</span>';
                } else {
                    dueDateDisplay = `Due: ${dueDate.toLocaleDateString()}`;
                }
            }

            taskElement.className = `chat-bubble ${bubbleClass} p-4 shadow-sm`;
            taskElement.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <button onclick="taskManager.toggleTask(${task.id})" 
                                    class="text-lg ${isCompleted ? 'text-green-500' : 'text-gray-400'} hover:text-green-600">
                                <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                            </button>
                            <h3 class="font-semibold ${isCompleted ? 'task-completed' : ''}">${task.title}</h3>
                        </div>
                        
                        ${task.description ? `<p class="text-gray-600 mb-2 ${isCompleted ? 'task-completed' : ''}">${task.description}</p>` : ''}
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                ${task.category_name ? 
                                    `<span class="category-badge" style="background-color: ${task.category_color}">${task.category_name}</span>` 
                                    : '<span class="text-xs text-gray-500">No category</span>'
                                }
                                ${dueDateDisplay ? `<span class="text-xs">${dueDateDisplay}</span>` : ''}
                            </div>
                            <button onclick="taskManager.deleteTask(${task.id})" 
                                    class="text-red-500 hover:text-red-700 text-sm ml-2">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="text-xs text-gray-400 mt-2">
                            Created: ${new Date(task.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            `;
            
            tasksContainer.appendChild(taskElement);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'} mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the task manager when the page loads
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});