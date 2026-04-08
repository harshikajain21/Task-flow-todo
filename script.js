/**
 * Global App State
 */
const state = {
    todos: [],
    currentFilter: 'all',
    search: ''
};

// Selectors
const todoGrid = document.getElementById('todo-grid');
const loader = document.getElementById('loader');
const progressCircle = document.getElementById('progress-circle');
const progressPercent = document.getElementById('progress-percent');
const searchBar = document.getElementById('search-bar');
const addBtn = document.getElementById('add-btn');
const toast = document.getElementById('toast');

// Progress Circle Config
const circleRadius = progressCircle.r.baseVal.value;
const circumference = circleRadius * 2 * Math.PI;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

/**
 * 1. Requirement: Call API (Full 200 items)
 */
async function loadTodos() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();
        
        // Artificial delay for Requirement 2 (Loader visibility)
        setTimeout(() => {
            state.todos = data;
            loader.style.display = 'none';
            render();
        }, 1000);
    } catch (err) {
        loader.innerHTML = "⚠️ Failed to sync with API.";
    }
}

/**
 * 2. Requirement: Render Logic (Filters + Search)
 */
function render() {
    // Apply logic for Incomplete | Completed | All
    const filtered = state.todos.filter(t => {
        const matchesFilter = state.currentFilter === 'all' || 
                             (state.currentFilter === 'completed' ? t.completed : !t.completed);
        const matchesSearch = t.title.toLowerCase().includes(state.search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    todoGrid.innerHTML = '';
    
    filtered.forEach((todo, index) => {
        const card = createTodoCard(todo, index);
        todoGrid.appendChild(card);
    });

    updateProgress();
}

/**
 * 3. Requirement: Card View (Checkbox + Title)
 */
function createTodoCard(todo, index) {
    const div = document.createElement('div');
    div.className = `todo-card ${todo.completed ? 'completed' : ''}`;
    
    div.innerHTML = `
        <div class="custom-check ${todo.completed ? 'checked' : ''}"></div>
        <span>${todo.title}</span>
    `;

    // Click to toggle status
    div.addEventListener('click', () => {
        todo.completed = !todo.completed;
        render();
    });

    return div;
}

/**
 * 4. Requirement: Add Todo (Static Local to LAST)
 */
function addNewTodo() {
    const newTask = {
        id: state.todos.length + 1,
        title: "⚡ Manual System Entry: Success",
        completed: false
    };

    // Requirement: Add to existing list (Last)
    state.todos.push(newTask); 
    
    render();
    showToast();
    
    // Skill Feature: Automatically scroll to the new task at the bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/**
 * Utility Functions
 */
function updateProgress() {
    const total = state.todos.length;
    const done = state.todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
    
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    progressPercent.innerText = `${percentage}%`;
}

function showToast() {
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
}

// Event Listeners
searchBar.addEventListener('input', (e) => {
    state.search = e.target.value;
    render();
});

document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentFilter = btn.dataset.filter;
        render();
    });
});

addBtn.addEventListener('click', addNewTodo);

// Initial Load
document.getElementById('date-display').innerText = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
});
loadTodos();
