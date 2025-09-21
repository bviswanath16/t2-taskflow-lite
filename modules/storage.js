export const TASKS_KEY = 'taskflow-lite:tasks';

export const saveTasks = (tasks) => {
  try{ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
  catch(e){ console.error('Failed to save tasks', e); }
};

export const loadTasks = () => {
  try{
    const raw = localStorage.getItem(TASKS_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    return parsed.map(t => ({ id: Number(t.id)||Date.now(), text: String(t.text||''), completed: !!t.completed, createdAt: t.createdAt || new Date().toISOString() }));
  }catch(e){ console.error('Failed to load tasks', e); return []; }
};
