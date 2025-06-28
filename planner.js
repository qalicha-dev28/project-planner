document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');
    const currentTime = document.getElementById('currentTime');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const taskCount = document.getElementById('taskCount');

    // Initialize tasks array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize the app
    renderTasks();
    updateProgress();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setInterval(checkReminders, 30000); // Changed from 60000 to 30000 (30 seconds)

    // Event Listeners
    taskForm.addEventListener('submit', handleAddTask);

    // Function to update date and time
    function updateDateTime() {
        const now = new Date();
        
        // Format date 
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-US', options);
        
        // Format time 
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        currentTime.innerHTML = `${dateString}<br>${timeString}`;
    }

    // Function to handle adding a task
    function handleAddTask(e) {
        e.preventDefault();
        
        const taskText = taskInput.value.trim();
        if (!taskText) {
            alert('Please enter a task!');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: document.getElementById('taskDueDate').value || null
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateProgress();
        taskInput.value = '';
        document.getElementById('taskDueDate').value = '';
        taskInput.focus();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
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
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            editBtn.addEventListener('click', () => editTask(task));
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
    }

    // Delete a task
    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        tasks = tasks.filter(task => task.id != taskId);
        saveTasks();
        renderTasks();
        updateProgress();
    }

    // Edit a task
    function editTask(task) {
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    // Update progress
    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        progressText.textContent = `${percentage}% Complete`;
        progressBar.style.width = `${percentage}%`;
        taskCount.textContent = `${completedTasks}/${totalTasks} tasks`;
        
        // Change color based on percentage
        if (percentage < 30) {
            progressBar.className = 'progress-bar bg-red-500 rounded-full h-2';
        } else if (percentage < 70) {
            progressBar.className = 'progress-bar bg-yellow-500 rounded-full h-2';
        } else {
            progressBar.className = 'progress-bar bg-green-500 rounded-full h-2';
        }
    }

    // Check for due tasks and show reminders (updated for 30-second checks)
    function checkReminders() {
        const now = new Date();
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                const dueDate = new Date(task.dueDate);
                const timeRemaining = dueDate - now;
                
                // Show notification if task is due within the next 30 seconds
                if (timeRemaining > 0 && timeRemaining <= 30000) {
                    const secondsRemaining = Math.floor(timeRemaining / 1000);
                    showNotification(`Reminder: "${task.text}" is due in ${secondsRemaining} seconds!`);
                }
                // Show notification if task is overdue
                else if (timeRemaining < 0) {
                    showNotification(`Overdue: "${task.text}" was due ${formatRelativeTime(dueDate)}`);
                }
            }
        });
    }

    // Show notification
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        // Hide after 3 seconds
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
});