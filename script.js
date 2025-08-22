// DOM Elements
const main = document.querySelector('.main');
const notesSection = document.getElementById('notes-section');
const todoSection = document.getElementById('todo-section');
const noteBox = document.querySelector('.note-box');
const todoBox = document.querySelector('.todo-box');
const noteInput = document.getElementById('note-input');
const noteTitleInput = document.getElementById('note-title-input');
const todoTitleInput = document.getElementById('todo-title-input');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search-btn');
const notesList = document.getElementById('notes-list');
const todoList = document.getElementById('todo-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeLabel = document.getElementById('theme-label');
const themeIcon = document.getElementById('theme-icon');

// Navigation buttons
const notesBtn = document.getElementById('notes-btn');
const todoBtn = document.getElementById('todo-btn');

// Modal buttons
const createNoteBtn = document.getElementById('create-note');
const createTodoBtn = document.getElementById('create-todo');
const addNoteBtn = document.getElementById('add-note-btn');
const clearNoteBtn = document.getElementById('clear-note-btn');
const addTodoBtn = document.getElementById('add-todo-btn');
const clearTodoBtn = document.getElementById('clear-todo-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const settingsBtn = document.getElementById('settings-btn');
const exitBtns = document.querySelectorAll('.exit-btn');

//To-Do-List Variables
const todoFilterSelect = document.createElement('select');
const todoSortSelect = document.createElement('select');
const todoStats = document.createElement('div');
const categoryInput = document.createElement('input');
let taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || ['Personal', 'Work', 'Shopping', 'Health', 'Other'];

// Variables for editing
let currentNoteIndex = null;
let currentTodoIndex = null;
let isDarkMode = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

// Create Event Listeners for all buttons
function setupEventListeners() {
    // Navigation
    notesBtn.addEventListener('click', () => switchSection('notes'));
    todoBtn.addEventListener('click', () => switchSection('todo'));
    
    // Create buttons
    createNoteBtn.addEventListener('click', openNoteModal);
    createTodoBtn.addEventListener('click', openTodoModal);
    
    // Modal actions
    addNoteBtn.addEventListener('click', saveNote);
    clearNoteBtn.addEventListener('click', clearNoteInputs);
    addTodoBtn.addEventListener('click', saveTodo);
    clearTodoBtn.addEventListener('click', clearTodoInputs);
    
    // Search
    searchBtn.addEventListener('click', performSearch);
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Bottom menu actions
    deleteAllBtn.addEventListener('click', confirmDeleteAll);
    settingsBtn.addEventListener('click', openSettings);
    
    // Exit buttons for modals
    exitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            noteBox.classList.remove('active');
            todoBox.classList.remove('active');
            main.classList.remove('active');
            currentNoteIndex = null;
            currentTodoIndex = null;
        });
    });
}

// Initialize the app
function init() {
    setupEventListeners();
    loadNotes();
    loadTodos();
    initTodoControls(); // Add this line
    enhanceTodoModal(); // Add this line
    
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        themeLabel.textContent = 'Dark Mode';
        themeIcon.src = 'icons/toggle_off_icon.svg';
    }
}

// Switch between Notes and Todo sections
function switchSection(section) {
    if (section === 'notes') {
        notesSection.classList.add('active');
        todoSection.classList.remove('active');
        notesBtn.classList.add('active');
        todoBtn.classList.remove('active');
    } else {
        todoSection.classList.add('active');
        notesSection.classList.remove('active');
        todoBtn.classList.add('active');
        notesBtn.classList.remove('active');
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    
    if (isDarkMode) {
        themeLabel.textContent = 'Dark Mode';
        themeIcon.src = 'icons/toggle_off_icon.svg';
        localStorage.setItem('theme', 'dark');
    } else {
        themeLabel.textContent = 'Light Mode';
        themeIcon.src = 'icons/toggle_on_icon.svg';
        localStorage.setItem('theme', 'light');
    }
}

// Notes Functions
function openNoteModal(e, index) {
    noteBox.classList.add('active');
    main.classList.add('active');
    
    if (index !== undefined) {
        // Edit existing note
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const note = notes[index];
        noteTitleInput.value = note.title;
        noteInput.value = note.content;
        currentNoteIndex = index;
    } else {
        // New note
        clearNoteInputs();
        currentNoteIndex = null;
    }
}

function clearNoteInputs() {
    noteTitleInput.value = '';
    noteInput.value = '';
}

function saveNote() {
    const noteTitle = noteTitleInput.value.trim();
    const noteContent = noteInput.value.trim();
    
    if (noteTitle === '' && noteContent === '') return; // Prevent empty notes
    
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteObj = {
        title: noteTitle || 'Untitled Note',
        content: noteContent,
        timestamp: new Date().toISOString()
    };
    
    if (currentNoteIndex !== null) {
        // Update existing note
        notes[currentNoteIndex] = noteObj;
    } else {
        // Add new note
        notes.push(noteObj);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    
    // Close modal
    noteBox.classList.remove('active');
    main.classList.remove('active');
    currentNoteIndex = null;
}

function loadNotes() {
    notesList.innerHTML = ''; // Clear the list
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const searchTerm = searchBar.value.toLowerCase();
    
    const filteredNotes = searchTerm 
        ? notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
          )
        : notes;
    
    if (filteredNotes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = searchTerm 
            ? 'No matching notes found' 
            : 'No notes yet. Create your first note!';
        notesList.appendChild(emptyMessage);
        return;
    }

    filteredNotes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        
        const noteDate = new Date(note.timestamp).toLocaleDateString();
        
        noteItem.innerHTML = `
            <div class="note-header">
                <h3 class="item-title">${note.title}</h3>
                <span class="note-date">${noteDate}</span>
            </div>
            <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
            <div class="note-actions">
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        
        notesList.appendChild(noteItem);
        
        // Add click event listeners
        const editBtn = noteItem.querySelector('.edit-btn');
        const deleteBtn = noteItem.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            openNoteModal(e, index);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            deleteNote(index);
        });
    });
}

function deleteNote(index) {
    if (confirm('Are you sure you want to delete this note?')) {
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
    }
}

// Todo Functions
function openTodoModal(e, index) {
    todoBox.classList.add('active');
    main.classList.add('active');
    
    if (index !== undefined) {
        // Edit existing todo
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const todo = todos[index];
        todoTitleInput.value = todo.title;
        todoDate.value = todo.dueDate || '';
        todoPriority.value = todo.priority || 'medium';
        currentTodoIndex = index;
    } else {
        // New todo
        clearTodoInputs();
        currentTodoIndex = null;
    }
}

function clearTodoInputs() {
    todoTitleInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'medium';
}

function saveTodo() {
    
    const todoTitle = todoTitleInput.value.trim();
    if (todoTitle === '') return; // Prevent empty todos
    
    
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoObj = {
        title: todoTitle,
        dueDate: todoDate.value,
        priority: todoPriority.value,
        completed: currentTodoIndex !== null ? todos[currentTodoIndex].completed : false,
        timestamp: new Date().toISOString()
    };
    
    if (currentTodoIndex !== null) {
        // Update existing todo
        todos[currentTodoIndex] = todoObj;
    } else {
        // Add new todo
        todos.push(todoObj);
    }
    
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
    
    // Close modal
    todoBox.classList.remove('active');
    main.classList.remove('active');
    currentTodoIndex = null;
}

function loadTodos() {
    todoList.innerHTML = ''; // Clear the list
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const searchTerm = searchBar.value.toLowerCase();
    
    const filteredTodos = searchTerm 
        ? todos.filter(todo => todo.title.toLowerCase().includes(searchTerm))
        : todos;
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = searchTerm 
            ? 'No matching tasks found' 
            : 'No tasks yet. Add your first task!';
        todoList.appendChild(emptyMessage);
        return;
    }

    filteredTodos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item', `priority-${todo.priority}`);
        if (todo.completed) todoItem.classList.add('completed');
        
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
        
        todoItem.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" class="todo-checkbox" data-index="${index}" ${todo.completed ? 'checked' : ''}>
                <h3 class="item-title">${todo.title}</h3>
            </div>
            <div class="todo-details">
                <span class="todo-date">Due: ${dueDate}</span>
                <span class="todo-priority">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority</span>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        
        todoList.appendChild(todoItem);
        
        // Add event listeners
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', (e) => {
            toggleTodoComplete(parseInt(e.target.dataset.index));
        });
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            openTodoModal(e, index);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            deleteTodo(index);
        });
    });
}

function toggleTodoComplete(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
}

function deleteTodo(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.splice(index, 1);
        localStorage.setItem('todos', JSON.stringify(todos));
        loadTodos();
    }
}

// Search function
function performSearch() {
    const searchTerm = searchBar.value.trim().toLowerCase();
    
    if (notesSection.classList.contains('active')) {
        loadNotes();
    } else {
        loadTodos();
    }
}

// Utility functions
function confirmDeleteAll() {
    if (notesSection.classList.contains('active')) {
        if (confirm('Are you sure you want to delete all notes?')) {
            localStorage.removeItem('notes');
            loadNotes();
        }
    } else {
        if (confirm('Are you sure you want to delete all tasks?')) {
            localStorage.removeItem('todos');
            loadTodos();
        }
    }
}

function openSettings() {
    alert('Settings functionality coming soon!');
}


//Script for the To-Do-List Section

// --- Added this to the init function ---
function initTodoControls() {
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'todo-controls';
    
    // Add filter dropdown
    todoFilterSelect.className = 'todo-filter';
    todoFilterSelect.innerHTML = `
        <option value="all">All Tasks</option>
        <option value="active">Active Tasks</option>
        <option value="completed">Completed Tasks</option>
        <option value="today">Due Today</option>
        <option value="upcoming">Upcoming (7 Days)</option>
        <option value="overdue">Overdue</option>
    `;
    
    // Add category filter
    const categoryFilter = document.createElement('select');
    categoryFilter.className = 'category-filter';
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add sort dropdown
    todoSortSelect.className = 'todo-sort';
    todoSortSelect.innerHTML = `
        <option value="date-asc">Due Date (Earliest First)</option>
        <option value="date-desc">Due Date (Latest First)</option>
        <option value="priority-desc">Priority (High to Low)</option>
        <option value="priority-asc">Priority (Low to High)</option>
        <option value="alpha">Alphabetically</option>
    `;
    
    // Create labels
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filter: ';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category: ';
    
    const sortLabel = document.createElement('label');
    sortLabel.textContent = 'Sort by: ';
    
    // Add stats container
    todoStats.className = 'todo-stats';
    
    // Assemble controls
    const filterGroup = document.createElement('div');
    filterGroup.className = 'control-group';
    filterGroup.appendChild(filterLabel);
    filterGroup.appendChild(todoFilterSelect);
    
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'control-group';
    categoryGroup.appendChild(categoryLabel);
    categoryGroup.appendChild(categoryFilter);
    
    const sortGroup = document.createElement('div');
    sortGroup.className = 'control-group';
    sortGroup.appendChild(sortLabel);
    sortGroup.appendChild(todoSortSelect);
    
    // Add to container
    filterContainer.appendChild(filterGroup);
    filterContainer.appendChild(categoryGroup);
    filterContainer.appendChild(sortGroup);
    
    // Add before todo list
    todoSection.insertBefore(filterContainer, todoList.parentElement);
    todoSection.insertBefore(todoStats, todoList.parentElement);
    
    // Add event listeners
    todoFilterSelect.addEventListener('change', loadTodos);
    categoryFilter.addEventListener('change', loadTodos);
    todoSortSelect.addEventListener('change', loadTodos);
    
    // Update categories
    updateCategoryDropdown(categoryFilter);
}

// --- Modify the Todo Modal ---
function enhanceTodoModal() {
    // Add category selector
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-container';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category:';
    categoryLabel.setAttribute('for', 'todo-category');
    
    categoryInput.setAttribute('type', 'text');
    categoryInput.setAttribute('id', 'todo-category');
    categoryInput.setAttribute('list', 'categories');
    categoryInput.className = 'category-input';
    categoryInput.placeholder = 'Enter or select a category';
    
    const categoryDatalist = document.createElement('datalist');
    categoryDatalist.id = 'categories';
    
    // Add before the modal footer
    categoryContainer.appendChild(categoryLabel);
    categoryContainer.appendChild(categoryInput);
    categoryContainer.appendChild(categoryDatalist);
    
    const todoModalBody = document.querySelector('.todo-box .modal-body');
    todoModalBody.appendChild(categoryContainer);
    
    // Update categories datalist
    updateCategoriesDatalist();
}

// Function to update categories datalist
function updateCategoriesDatalist() {
    const datalist = document.getElementById('categories');
    datalist.innerHTML = '';
    
    taskCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        datalist.appendChild(option);
    });
}

// Function to update category dropdown
function updateCategoryDropdown(dropdown) {
    // Keep the "All Categories" option
    dropdown.innerHTML = '<option value="all">All Categories</option>';
    
    // Add each category
    taskCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

// --- Modified saveTodo function ---
function saveTodo() {
    const todoTitle = todoTitleInput.value.trim();
    if (todoTitle === '') return; // Prevent empty todos
    
    // Get category and add to categories if new
    const category = categoryInput.value.trim() || 'Other';
    if (category && !taskCategories.includes(category)) {
        taskCategories.push(category);
        localStorage.setItem('taskCategories', JSON.stringify(taskCategories));
        updateCategoriesDatalist();
    }
    
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoObj = {
        title: todoTitle,
        dueDate: todoDate.value,
        priority: todoPriority.value,
        category: category,
        completed: currentTodoIndex !== null ? todos[currentTodoIndex].completed : false,
        timestamp: new Date().toISOString(),
        notes: document.getElementById('todo-notes') ? document.getElementById('todo-notes').value : ''
    };
    
    if (currentTodoIndex !== null) {
        // Update existing todo
        todos[currentTodoIndex] = todoObj;
    } else {
        // Add new todo
        todos.push(todoObj);
    }
    
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
    
    // Close modal
    todoBox.classList.remove('active');
    main.classList.remove('active');
    currentTodoIndex = null;
}

// --- Enhanced loadTodos function ---
function loadTodos() {
    todoList.innerHTML = ''; // Clear the list
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const searchTerm = searchBar.value.toLowerCase();
    
    // Get filter values
    const filterValue = todoFilterSelect.value;
    const categoryValue = document.querySelector('.category-filter').value;
    const sortValue = todoSortSelect.value;
    
    // Filter todos
    let filteredTodos = todos.filter(todo => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            todo.title.toLowerCase().includes(searchTerm) ||
            todo.category.toLowerCase().includes(searchTerm);
        
        // Status filter
        let matchesFilter = true;
        if (filterValue === 'active') matchesFilter = !todo.completed;
        else if (filterValue === 'completed') matchesFilter = todo.completed;
        else if (filterValue === 'today') {
            // Check if due today
            const today = new Date().toISOString().split('T')[0];
            matchesFilter = todo.dueDate === today;
        }
        else if (filterValue === 'upcoming') {
            // Due within next 7 days
            if (!todo.dueDate) return false;
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            const inOneWeek = new Date();
            inOneWeek.setDate(today.getDate() + 7);
            matchesFilter = dueDate >= today && dueDate <= inOneWeek;
        }
        else if (filterValue === 'overdue') {
            // Overdue tasks
            if (!todo.dueDate || todo.completed) return false;
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            matchesFilter = dueDate < today;
        }
        
        // Category filter
        const matchesCategory = categoryValue === 'all' || todo.category === categoryValue;
        
        return matchesSearch && matchesFilter && matchesCategory;
    });
    
    // Sort todos
    filteredTodos.sort((a, b) => {
        switch (sortValue) {
            case 'date-asc':
                // Handle cases where due date is not set
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'date-desc':
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(b.dueDate) - new Date(a.dueDate);
            case 'priority-desc':
                const priorityValues = { high: 3, medium: 2, low: 1 };
                return priorityValues[b.priority] - priorityValues[a.priority];
            case 'priority-asc':
                const priorityVals = { high: 3, medium: 2, low: 1 };
                return priorityVals[a.priority] - priorityVals[b.priority];
            case 'alpha':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    // Update stats
    updateTodoStats(todos);
    
    // Show empty message if no todos match
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = searchTerm || filterValue !== 'all' || categoryValue !== 'all'
            ? 'No matching tasks found' 
            : 'No tasks yet. Add your first task!';
        todoList.appendChild(emptyMessage);
        return;
    }

    // Create todo items
    filteredTodos.forEach((todo, index) => {
        const originalIndex = todos.findIndex(t => 
            t.title === todo.title && 
            t.timestamp === todo.timestamp
        );
        
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item', `priority-${todo.priority}`);
        if (todo.completed) todoItem.classList.add('completed');
        
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
        
        todoItem.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" class="todo-checkbox" data-index="${originalIndex}" ${todo.completed ? 'checked' : ''}>
                <h3 class="item-title">${todo.title}</h3>
                ${isOverdue ? '<span class="overdue-badge">OVERDUE</span>' : ''}
            </div>
            <div class="todo-details">
                <span class="todo-date">Due: ${dueDate}</span>
                <span class="todo-priority">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority</span>
                <span class="todo-category">${todo.category}</span>
            </div>
            ${todo.notes ? `<div class="todo-notes">${todo.notes.substring(0, 100)}${todo.notes.length > 100 ? '...' : ''}</div>` : ''}
            <div class="todo-actions">
                <button class="view-btn" data-index="${originalIndex}">View</button>
                <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                <button class="delete-btn" data-index="${originalIndex}">Delete</button>
            </div>
        `;
        
        todoList.appendChild(todoItem);
        
        // Add event listeners
        const checkbox = todoItem.querySelector('.todo-checkbox');
        const viewBtn = todoItem.querySelector('.view-btn');
        const editBtn = todoItem.querySelector('.edit-btn');
        const deleteBtn = todoItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', (e) => {
            toggleTodoComplete(parseInt(e.target.dataset.index));
        });
        
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            viewTodoDetails(index);
        });
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            openTodoModal(e, index);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            deleteTodo(index);
        });
    });
}

// Function to view task details in a modal
function viewTodoDetails(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todo = todos[index];
    
    // Create a details modal
    const detailsModal = document.createElement('div');
    detailsModal.className = 'modal details-modal active';
    
    const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
    const dateCreated = new Date(todo.timestamp).toLocaleDateString();
    
    detailsModal.innerHTML = `
        <div class="modal-header">
            <h2>${todo.title}</h2>
            <button class="exit-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="task-detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value ${todo.completed ? 'completed-status' : 'active-status'}">
                        ${todo.completed ? 'Completed' : 'Active'}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value priority-${todo.priority}">
                        ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${todo.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">${dueDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value">${dateCreated}</span>
                </div>
            </div>
            
            ${todo.notes ? `
                <div class="task-notes">
                    <h3>Notes:</h3>
                    <div class="notes-content">${todo.notes}</div>
                </div>
            ` : ''}
        </div>
        <div class="modal-footer">
            <button class="action-btn" id="toggle-status-btn">
                ${todo.completed ? 'Mark as Active' : 'Mark as Complete'}
            </button>
            <button class="action-btn" id="edit-detail-btn">Edit Task</button>
            <button class="action-btn secondary" id="close-detail-btn">Close</button>
        </div>
    `;
    
    // Add modal to the body
    document.body.appendChild(detailsModal);
    main.classList.add('active');
    
    // Add event listeners
    const exitBtn = detailsModal.querySelector('.exit-btn');
    const closeBtn = detailsModal.querySelector('#close-detail-btn');
    const toggleStatusBtn = detailsModal.querySelector('#toggle-status-btn');
    const editBtn = detailsModal.querySelector('#edit-detail-btn');
    
    exitBtn.addEventListener('click', () => {
        document.body.removeChild(detailsModal);
        main.classList.remove('active');
    });
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(detailsModal);
        main.classList.remove('active');
    });
    
    toggleStatusBtn.addEventListener('click', () => {
        toggleTodoComplete(index);
        document.body.removeChild(detailsModal);
        main.classList.remove('active');
    });
    
    editBtn.addEventListener('click', () => {
        document.body.removeChild(detailsModal);
        openTodoModal(null, index);
    });
}

// Function to update todo statistics display
function updateTodoStats(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    // Count overdue tasks
    const overdue = todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    }).length;
    
    // Count due today
    const today = new Date().toISOString().split('T')[0];
    const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed).length;
    
    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    todoStats.innerHTML = `
        <div class="stats-header">
            <h3>Task Overview</h3>
            <div class="completion-bar">
                <div class="completion-progress" style="width: ${completionRate}%"></div>
                <span class="completion-text">${completionRate}% Complete</span>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-value">${active}</span>
                <span class="stat-label">Active</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${completed}</span>
                <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item ${overdue > 0 ? 'stat-warning' : ''}">
                <span class="stat-value">${overdue}</span>
                <span class="stat-label">Overdue</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${dueToday}</span>
                <span class="stat-label">Due Today</span>
            </div>
        </div>
    `;
}

// --- Enhanced openTodoModal function ---
function openTodoModal(e, index) {
    todoBox.classList.add('active');
    main.classList.add('active');
    
    // Add notes field if it doesn't exist
    if (!document.getElementById('todo-notes')) {
        const notesLabel = document.createElement('label');
        notesLabel.textContent = 'Notes:';
        notesLabel.setAttribute('for', 'todo-notes');
        
        const notesInput = document.createElement('textarea');
        notesInput.id = 'todo-notes';
        notesInput.className = 'notes-input';
        notesInput.placeholder = 'Add any additional details about this task...';
        
        const todoModalBody = document.querySelector('.todo-box .modal-body');
        todoModalBody.appendChild(notesLabel);
        todoModalBody.appendChild(notesInput);
    }
    
    if (index !== undefined) {
        // Edit existing todo
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const todo = todos[index];
        todoTitleInput.value = todo.title;
        todoDate.value = todo.dueDate || '';
        todoPriority.value = todo.priority || 'medium';
        categoryInput.value = todo.category || 'Other';
        document.getElementById('todo-notes').value = todo.notes || '';
        currentTodoIndex = index;
    } else {
        // New todo
        clearTodoInputs();
        currentTodoIndex = null;
    }
}

// --- Modified clearTodoInputs function ---
function clearTodoInputs() {
    todoTitleInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'medium';
    categoryInput.value = '';
    if (document.getElementById('todo-notes')) {
        document.getElementById('todo-notes').value = '';
    }
}
