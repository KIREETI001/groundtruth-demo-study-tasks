const form = document.querySelector('#task-form');
const input = document.querySelector('#title');
const list = document.querySelector('#tasks');
const status = document.querySelector('#status');

async function request(path, body) {
  const response = await fetch(path, body ? {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  } : {});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

async function render() {
  const tasks = await request('/api/tasks');
  list.replaceChildren();
  for (const task of tasks) {
    const row = document.createElement('li');
    const title = document.createElement('span');
    title.textContent = task.title;
    row.append(title);
    if (task.completed) row.append(' ✓ Done');
    else {
      const button = document.createElement('button');
      button.textContent = 'Complete';
      button.onclick = () => request(`/api/tasks/${task.id}/complete`, {}).then(render).catch(showError);
      row.append(button);
    }
    list.append(row);
  }
  if (!tasks.length) status.textContent = 'Add your first study task.';
}
function showError(error) { status.textContent = error.message; }
form.onsubmit = async event => {
  event.preventDefault();
  try {
    await request('/api/tasks', { title: input.value });
    input.value = ''; status.textContent = 'Task added.'; await render();
  } catch (error) { showError(error); }
};
render().catch(showError);
