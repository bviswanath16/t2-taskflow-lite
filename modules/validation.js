export function validateTaskInput(val){
  const s = String(val||'').trim();
  if(s.length === 0) return { valid:false, reason: 'Task cannot be empty' };
  if(s.length < 2) return { valid:false, reason: 'Task is too short' };
  if(s.length > 200) return { valid:false, reason: 'Task is too long (max 200 chars)' };
  return { valid:true };
}

export function setupRealtimeValidation(inputEl, msgEl){
  let timeout = null;
  inputEl.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const res = validateTaskInput(inputEl.value);
      msgEl.textContent = res.valid ? '' : res.reason;
    }, 200);
  });
  inputEl.addEventListener('blur', () => { const r = validateTaskInput(inputEl.value); msgEl.textContent = r.valid ? '' : r.reason; });
}
