import { taskTitle, taskId } from './validation.js';

export function handleTasks(method, path, body, store) {
  if (method === 'GET' && path === '/api/tasks') {
    return { status: 200, data: store.list() };
  }
  if (method === 'POST' && path === '/api/tasks') {
    const title = taskTitle(body?.title);
    if (!title) return { status: 400, data: { error: 'Use a title of 1–80 characters.' } };
    return { status: 201, data: store.add(title) };
  }
  const match = path.match(/^\/api\/tasks\/([^/]+)\/complete$/);
  if (method === 'POST' && match) {
    const id = taskId(match[1]);
    if (!id) return { status: 400, data: { error: 'Invalid task ID.' } };
    const task = store.complete(id);
    return task ? { status: 200, data: task }
      : { status: 404, data: { error: 'Task not found.' } };
  }
  return { status: 404, data: { error: 'Route not found.' } };
}
