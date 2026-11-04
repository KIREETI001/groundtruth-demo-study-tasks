import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

export function openStore(filename = ':memory:') {
  const db = new DatabaseSync(filename);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  return {
    list() {
      return db.prepare('SELECT * FROM tasks ORDER BY id').all();
    },
    add(title) {
      const result = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title);
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    },
    complete(id) {
      db.prepare('UPDATE tasks SET completed = 1 WHERE id = ?').run(id);
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    },
    close() { db.close(); }
  };
}
