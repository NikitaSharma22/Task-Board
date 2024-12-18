document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const todoList = document.getElementById('todoList');
    const sortSelect = document.getElementById('sortSelect');
    const deleteCompletedBtn = document.getElementById('deleteCompletedBtn');

    // Filter Buttons
    const allTasksBtn = document.getElementById('allTasksBtn');
    const activeTasksBtn = document.getElementById('activeTasksBtn');
    const completedTasksBtn = document.getElementById('completedTasksBtn');

    // Stats Elements
    const totalTasksCount = document.getElementById('totalTasksCount');
    const completedTasksCount = document.getElementById('completedTasksCount');
    const pendingTasksCount = document.getElementById('pendingTasksCount');

    // Modal Elements
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close-modal');
    const editTaskInput = document.getElementById('editTaskInput');
    const editDueDateInput = document.getElementById('editDueDateInput');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editPriorityOptions = document.querySelectorAll('input[name="editPriority"]');


    // Priority Colors
    const priorityColors = {
        low: '#48DBB4',      // Soft green
        medium: '#F39C12',   // Orange
        high: '#E74C3C'      // Red
    };

    // Date and Time Display
    function updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    updateDateTime();
    setInterval(updateDateTime, 60000);

    // Tasks Management
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskIndex = -1;

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
        renderTasks(getCurrentFilter());
    }

    // Update task statistics
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        totalTasksCount.textContent = totalTasks;
        completedTasksCount.textContent = completedTasks;
        pendingTasksCount.textContent = pendingTasks;
    }

    // Sort tasks based on selected criteria
    function sortTasks(tasks, sortBy) {
        switch (sortBy) {
            case 'priority':
                return tasks.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
            case 'dueDate':
                return tasks.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            default:
                return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    // Get current active filter
    function getCurrentFilter() {
        if (allTasksBtn.classList.contains('active')) return 'all';
        if (activeTasksBtn.classList.contains('active')) return 'active';
        if (completedTasksBtn.classList.contains('active')) return 'completed';
        return 'all';
    }

    // Render tasks based on filter and sort
    function renderTasks(filter = 'all') {
        const sortBy = sortSelect.value;
        let filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        filteredTasks = sortTasks(filteredTasks, sortBy);
        todoList.innerHTML = '';

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('todo-item', `${task.priority}-priority`);

            // Add priority color border
            li.style.borderLeft = `5px solid ${priorityColors[task.priority]}`;

            li.innerHTML = `
                <div class="todo-item-text" ${task.completed ? 'style="text-decoration: line-through;"' : ''}>
                    ${task.text}
                    <small style="display:block;color:#7F8C8D;">
                        ${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                    </small>
                </div>
                <div class="todo-actions">
                    <button class="options-btn" title="Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="dropdown-menu">
                        <button class="complete-btn">Complete</button>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                        <button class="not-necessary-btn">Not Necessary</button>
                    </div>
                </div>
            `;

            // Options button event listener
            const optionsBtn = li.querySelector('.options-btn');
            const dropdownMenu = li.querySelector('.dropdown-menu');

            optionsBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });

            // Close dropdown when clicking outside
            window.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
            });

            // Ensure dropdown remains open when interacting with it
            dropdownMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Complete task button
            const completeBtn = dropdownMenu.querySelector('.complete-btn');
            completeBtn.addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasks();
            });

            // Edit task button
            const editBtn = dropdownMenu.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                editingTaskIndex = filteredTasks.indexOf(task);
                
                // Set task details in modal
                editTaskInput.value = task.text;
                editDueDateInput.value = task.dueDate || '';
                
                // Set priority radio button
                editPriorityOptions.forEach(radio => {
                    if (radio.value === task.priority) {
                        radio.checked = true;
                    }
                });
            
                document.querySelectorAll('.priority-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.priority === task.priority) {
                        option.classList.add('selected');
                    }
                });
            
                // Show modal
                taskModal.style.display = 'flex';
            });
            
            // Add event listeners for priority option styling
            document.querySelectorAll('.priority-option').forEach(option => {
                option.addEventListener('click', () => {
                    // Remove selected class from all options
                    document.querySelectorAll('.priority-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    option.classList.add('selected');
                    
                    // Check the corresponding radio button
                    const radio = option.querySelector('input[type="radio"]');
                    radio.checked = true;
                });
            });
            
            // Cancel edit button
            cancelEditBtn.addEventListener('click', () => {
                taskModal.style.display = 'none';
                editingTaskIndex = -1;
            });
            
            // Save edit button
            saveEditBtn.addEventListener('click', () => {
                if (editingTaskIndex !== -1) {
                    const taskText = editTaskInput.value.trim();
                    
                    if (taskText === '') {
                        alert('Task description cannot be empty');
                        return;
                    }
            
                    // Get selected priority
                    const selectedPriority = document.querySelector('input[name="editPriority"]:checked').value;
            
                    // Update task
                    tasks[editingTaskIndex].text = taskText;
                    tasks[editingTaskIndex].priority = selectedPriority;
                    tasks[editingTaskIndex].dueDate = editDueDateInput.value;
            
                    saveTasks();
                    taskModal.style.display = 'none';
                    editingTaskIndex = -1;
                }
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === taskModal) {
                    taskModal.style.display = 'none';
                    editingTaskIndex = -1;
                }
            });

            // Delete task button
            const deleteBtn = dropdownMenu.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                tasks = tasks.filter(t => t !== task);
                saveTasks();
            });

            // Not necessary button
            const notNecessaryBtn = dropdownMenu.querySelector('.not-necessary-btn');
            notNecessaryBtn.addEventListener('click', () => {
                task.notNecessary = !task.notNecessary;
                saveTasks();
            });

            // Append "Not Necessary" label if applicable
            if (task.notNecessary) {
                const notNecessaryLabel = document.createElement('small');
                notNecessaryLabel.textContent = 'Not Necessary';
                notNecessaryLabel.style.color = '#48DBB4';
                notNecessaryLabel.style.fontStyle = 'italic';
                li.querySelector('.todo-item-text').appendChild(notNecessaryLabel);
            }

            todoList.appendChild(li);
        });
    }

    // Add new task function
    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;

        if (taskText !== '') {
            // Add the task to the list
            const newTask = {
                text: taskText,
                priority: priority,
                dueDate: dueDate,
                completed: false,
                createdAt: new Date().toISOString()
            };

            tasks.push(newTask);
            saveTasks(); // Save the updated tasks list to local storage and re-render the tasks
            taskInput.value = ''; // Clear the input field
        } else {
            alert('Please enter a task.');
        }
    }

    // Event Listeners for Adding Tasks
    addTaskBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Sort tasks when sort selection changes
    sortSelect.addEventListener('change', () => renderTasks(getCurrentFilter()));

    // Filter buttons
    [allTasksBtn, activeTasksBtn, completedTasksBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            [allTasksBtn, activeTasksBtn, completedTasksBtn].forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(getCurrentFilter());
        });
    });

    // Modal close button
    closeModal.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    // Save edit button
    saveEditBtn.addEventListener('click', () => {
        if (editingTaskIndex !== -1) {
            tasks[editingTaskIndex].text = editTaskInput.value.trim();
            tasks[editingTaskIndex].priority = editPrioritySelect.value;
            tasks[editingTaskIndex].dueDate = editDueDateInput.value;

            saveTasks();
            taskModal.style.display = 'none';
            editingTaskIndex = -1;
        }
    });

    // Delete completed tasks button
    deleteCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    });

    // Initial render
    updateStats();
    renderTasks();

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });
});