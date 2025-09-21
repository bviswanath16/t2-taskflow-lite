export function renderTaskList(container, tasks, handlers = {}){
  container.innerHTML = '';
  if(tasks.length === 0){
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.innerHTML = `
      <div class="empty-illustration"></div>
      <p>Add your first task!</p>
    `;
    container.appendChild(li);
    return;
  }

  const frag = document.createDocumentFragment();
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task ${task.completed? 'completed':''}`;
    li.dataset.id = task.id;
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.completed? 'checked':''} aria-label="Toggle task completion">
        <span class="task-text">${escapeHTML(task.text)}</span>
      </label>
      <div class="task-actions">
        <button class="edit-btn" aria-label="Edit">✏</button>
        <button class="delete-btn" aria-label="Delete">🗑</button>
      </div>
    `;

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      if(handlers.onToggle) handlers.onToggle(Number(li.dataset.id), e.target.checked);
      li.classList.toggle('completed', e.target.checked);
    });

    const delBtn = li.querySelector('.delete-btn');
    delBtn.addEventListener('click', () => { if(handlers.onDelete) handlers.onDelete(Number(li.dataset.id)); });

    frag.appendChild(li);
  });
  container.appendChild(frag);
}
