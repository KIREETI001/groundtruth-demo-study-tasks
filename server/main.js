import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { openStore } from '../db/store.js';
import { handleTasks } from './api.js';

mkdirSync(new URL('../.data/', import.meta.url), { recursive: true });
const store = openStore(fileURLToPath(new URL('../.data/tasks.sqlite', import.meta.url)));
const pages = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const page = pages[path];
    if (req.method === 'GET' && page) {
      res.writeHead(200, { 'Content-Type': page[1] + '; charset=utf-8' });
      return res.end(readFileSync(new URL('../frontend/' + page[0], import.meta.url)));
    }
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (Buffer.byteLength(raw) > 2048) { res.writeHead(413); return res.end(); }
    }
    const result = handleTasks(req.method, path, raw ? JSON.parse(raw) : {}, store);
    res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result.data));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request could not be read.' }));
  }
});
server.listen(8090, '127.0.0.1', () => console.log('Study Tasks: http://127.0.0.1:8090'));
process.on('SIGINT', () => server.close(() => { store.close(); process.exit(0); }));
