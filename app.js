import { loadTasks, saveTasks } from '../modules/storage.js';
import { renderTaskList } from '../modules/render.js';
import { validateTaskInput, setupRealtimeValidation } from '../modules/validation.js';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskListEl = document.getElementById('task-list');
const validationMsg = document.getElementById('validation-msg');
const filters = document.querySelectorAll('.filter-btn');
const taskCountEl = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const exportBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-json');
const importFile = document.getElementById('import-file');

let tasks = loadTasks();
let activeFilter = 'all';

function createTask(text){
  return { id: Date.now(), text: text.trim(), completed: false, createdAt: new Date().toISOString() };
}

function setTasks(newTasks){
  tasks = newTasks;
  saveTasks(tasks);
  render();
}

function filteredTasks(){
  if(activeFilter === 'active') return tasks.filter(t => !t.completed);
  if(activeFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function render(){
  renderTaskList(taskListEl, filteredTasks(), {
    onToggle(id, checked){
      const i = tasks.findIndex(t => t.id === id);
      if(i > -1){ tasks[i].completed = checked; saveTasks(tasks);} 
    },
    onDelete(id){
      if(!confirm('Delete this task permanently?')) return;
      setTasks(tasks.filter(t => t.id !== id));
    },
    onEdit(id, newText){
      const i = tasks.findIndex(t => t.id === id);
      if(i > -1){ tasks[i].text = newText.trim(); saveTasks(tasks); }
    }
  });
  taskCountEl.textContent = tasks.length;
}

// Initial render
render();

// Add task
taskForm.addEventListener('submit', (e) =>{
  e.preventDefault();
  validationMsg.textContent = '';
  const val = taskInput.value;
  const ok = validateTaskInput(val);
  if(!ok.valid){ validationMsg.textContent = ok.reason; return; }
  tasks.push(createTask(val));
  saveTasks(tasks);
  taskInput.value = '';
  render();
});

// Task list click events
taskListEl.addEventListener('click', (e) =>{
  const taskEl = e.target.closest('.task');
  if(!taskEl) return;
  const id = Number(taskEl.dataset.id);

  if(e.target.classList.contains('delete-btn')){
    if(!confirm('Delete this task permanently?')) return;
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    render();
    return;
  }

  if(e.target.classList.contains('edit-btn')){
    const span = taskEl.querySelector('.task-text');
    const current = span.textContent;
    const input = document.createElement('input');
    input.type = 'text'; input.value = current; input.maxLength = 200;
    input.className = 'edit-input';
    span.replaceWith(input);
    input.focus(); input.select();
    function finishEdit(){
      const newText = input.value.trim();
      if(newText.length === 0){ alert('Task cannot be empty'); input.focus(); return; }
      const spanNew = document.createElement('span');
      spanNew.className = 'task-text'; spanNew.textContent = newText;
      input.replaceWith(spanNew);
      const idx = tasks.findIndex(t => t.id === id);
      if(idx > -1){ tasks[idx].text = newText; saveTasks(tasks); render(); }
    }
    input.addEventListener('blur', finishEdit, { once: true });
    input.addEventListener('keydown', (ev) =>{ if(ev.key === 'Enter') input.blur(); if(ev.key === 'Escape') { render(); }});
    return;
  }

  if(e.target.matches('input[type="checkbox"]')){
    const checked = e.target.checked;
    const i = tasks.findIndex(t => t.id === id);
    if(i > -1){ tasks[i].completed = checked; saveTasks(tasks); taskEl.classList.toggle('completed', checked); }
  }
});

// Filters
document.querySelector('.filters').addEventListener('click', (e) =>{
  const btn = e.target.closest('.filter-btn'); if(!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  render();
});

// Clear completed
clearCompletedBtn.addEventListener('click', () =>{
  if(!confirm('Remove all completed tasks?')) return;
  setTasks(tasks.filter(t => !t.completed));
});

// Export JSON
exportBtn.addEventListener('click', () =>{
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tasks.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Import JSON
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) =>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const imported = JSON.parse(reader.result);
      if(Array.isArray(imported)){
        setTasks(imported.map(t => ({ id: Number(t.id) || Date.now(), text: String(t.text||'').trim(), completed: !!t.completed, createdAt: t.createdAt || new Date().toISOString() })));
      } else alert('Invalid JSON structure');
    }catch(err){ alert('Failed to parse JSON'); }
  };
  reader.readAsText(f);
});

// Realtime validation
setupRealtimeValidation(taskInput, validationMsg);
