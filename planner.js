// Global variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskToDelete = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskDueDate = document.getElementById('taskDueDate');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const currentTime = document.getElementById('currentTime');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const taskCount = document.getElementById('taskCount');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const editForm = document.getElementById('editForm');
const editTaskId = document.getElementById('editTaskId');
const editTaskText = document.getElementById('editTaskText');
const editTaskDueDate = document.getElementById('editTaskDueDate');
const notification = document.getElementById('notification');

// Initialize datetime pickers
flatpickr(".datetime-input", {
    enableTime: true,
    dateFormat: "Y-m-d h:i K",
    minDate: "today"
});

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
        return;
    }

    renderTasks();
    updateProgress();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setInterval(checkReminders, 60000); // Check reminders every minute

    taskForm.addEventListener('submit', handleAddTask);
    editForm.addEventListener('submit', handleEditTask);
});

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    currentTime.innerHTML = `${dateString}<br>${timeString}`;
}

// Add new task
function handleAddTask(e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) {
        showNotification('Please enter a task!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: taskDueDate.value || null
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateProgress();
    taskInput.value = '';
    taskDueDate.value = '';
    taskInput.focus();
    showNotification('Task added successfully!');
}

// Render all tasks
function renderTasks() {
    if (tasks.length === 0) {
        emptyMessage.style.display = 'block';
        taskList.innerHTML = '';
        return;
    }
    
    emptyMessage.style.display = 'none';
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card bg-white p-4 rounded-lg shadow-sm border-l-4 ${
            task.completed ? 'border-green-500' : 'border-purple-500'
        } mb-3`;
        taskElement.dataset.id = task.id;
        
        const dueDateText = task.dueDate ? 
            `<div class="text-xs text-gray-500 mt-1">
                <i class="far fa-clock mr-1"></i>Due: ${formatDateTime(task.dueDate)}
            </div>` : '';
        
        taskElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                        class="complete-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 mr-3">
                    <span class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${
            task.text
        }</span>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-btn text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="text-xs text-gray-500 mt-2">
                Added: ${new Date(task.createdAt).toLocaleString()}
            </div>
            ${dueDateText}
        `;
        
        taskList.appendChild(taskElement);
        
        // Add event listeners
        const checkbox = taskElement.querySelector('.complete-checkbox');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        const editBtn = taskElement.querySelector('.edit-btn');
        
        checkbox.addEventListener('change', () => toggleComplete(task.id));
        deleteBtn.addEventListener('click', () => openDeleteModal(task.id));
        editBtn.addEventListener('click', () => openEditModal(task));
    });
}

// Toggle task completion
function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
    updateProgress();
    showNotification('Task updated!');
}

// Open edit modal
function openEditModal(task) {
    editTaskId.value = task.id;
    editTaskText.value = task.text;
    editTaskDueDate.value = task.dueDate || '';
    editModal.classList.remove('hidden');
}

// Handle edit form submission
function handleEditTask(e) {
    e.preventDefault();
    const taskId = parseInt(editTaskId.value);
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    
    if (taskIndex === -1) return;
    
    tasks[taskIndex].text = editTaskText.value.trim();
    tasks[taskIndex].dueDate = editTaskDueDate.value || null;
    
    saveTasks();
    renderTasks();
    updateProgress();
    closeModal();
    showNotification('Task updated successfully!');
}

// Open delete confirmation modal
function openDeleteModal(taskId) {
    taskToDelete = taskId;
    deleteModal.classList.remove('hidden');
}

// Confirm delete
function confirmDelete() {
    tasks = tasks.filter(task => task.id != taskToDelete);
    saveTasks();
    renderTasks();
    updateProgress();
    closeModal();
    showNotification('Task deleted!');
}

// Close all modals
function closeModal() {
    editModal.classList.add('hidden');
    deleteModal.classList.add('hidden');
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update progress display
function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    progressText.textContent = `${percentage}% Complete`;
    progressBar.style.width = `${percentage}%`;
    taskCount.textContent = `${completedTasks}/${totalTasks} tasks`;
    
    if (percentage < 30) {
        progressBar.className = 'progress-bar bg-red-500 rounded-full h-2';
    } else if (percentage < 70) {
        progressBar.className = 'progress-bar bg-yellow-500 rounded-full h-2';
    } else {
        progressBar.className = 'progress-bar bg-green-500 rounded-full h-2';
    }
}

// Check for due tasks and show reminders
function checkReminders() {
    const now = new Date();
    tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
            const dueDate = new Date(task.dueDate);
            // Show notification 15 minutes before due time
            if (dueDate - now <= 15 * 60 * 1000 && dueDate - now > 0) {
                showNotification(`Reminder: "${task.text}" is due soon!`);
            }
            // Show notification if task is overdue
            else if (dueDate < now) {
                showNotification(`Overdue: "${task.text}" was due ${formatRelativeTime(dueDate)}`);
            }
        }
    });
}

// Show notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Format date for display
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Format relative time (e.g., "5 minutes ago")
function formatRelativeTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    
    return 'just now';
}