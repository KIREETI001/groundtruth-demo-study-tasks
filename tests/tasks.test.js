import test from 'node:test';
import assert from 'node:assert/strict';
import { openStore } from '../db/store.js';
import { handleTasks } from '../server/api.js';
import { taskTitle, taskId } from '../server/validation.js';

test('titles are trimmed and empty or long titles are rejected', () => {
  assert.equal(taskTitle('  Learn SQL  '), 'Learn SQL');
  for (const value of ['', '   ', 'x'.repeat(81), 123, null]) assert.equal(taskTitle(value), null);
});
test('IDs must be positive safe integers', () => {
  assert.equal(taskId('1'), 1);
  for (const value of ['0', '-1', '1.5', 'abc', '9007199254740992']) assert.equal(taskId(value), null);
});
test('a new task starts incomplete and can be completed', () => {
  const store = openStore();
  try {
    const created = handleTasks('POST', '/api/tasks', { title: ' Learn SQL ' }, store);
    assert.equal(created.status, 201); assert.equal(created.data.title, 'Learn SQL');
    assert.equal(created.data.completed, 0);
    const result = handleTasks('POST', `/api/tasks/${created.data.id}/complete`, {}, store);
    assert.equal(result.data.completed, 1);
    assert.equal(handleTasks('POST', `/api/tasks/${created.data.id}/complete`, {}, store).data.completed, 1);
    assert.equal(handleTasks('GET', '/api/tasks', {}, store).data.length, 1);
  } finally { store.close(); }
});
test('bad input and missing tasks do not create records', () => {
  const store = openStore();
  try {
    assert.equal(handleTasks('POST', '/api/tasks', { title: ' ' }, store).status, 400);
    assert.equal(handleTasks('POST', '/api/tasks/0/complete', {}, store).status, 400);
    assert.equal(handleTasks('POST', '/api/tasks/99/complete', {}, store).status, 404);
    assert.equal(handleTasks('DELETE', '/api/tasks', {}, store).status, 404);
    assert.equal(store.list().length, 0);
  } finally { store.close(); }
});
test('parameterized insert stores punctuation as text', () => {
  const store = openStore();
  try {
    const title = "Learn SQL'); DROP TABLE tasks; --";
    store.add(title); assert.equal(store.list()[0].title, title);
    store.add('Still here'); assert.equal(store.list().length, 2);
  } finally { store.close(); }
});
