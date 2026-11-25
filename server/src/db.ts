import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Task, TaskInput } from './validation.ts';

export function openDatabase(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(trim(title)) > 0), description TEXT NOT NULL DEFAULT '',
      dueDate TEXT, priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
      assigneeId TEXT NOT NULL CHECK(assigneeId IN ('aarav','priya','rohan')),
      completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY);`);
  if (!db.prepare('SELECT name FROM migrations WHERE name = ?').get('seed-v1')) {
    const { tasks } = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8').replace(/^\uFEFF/, '')) as { tasks: TaskInput[] };
    db.exec('BEGIN');
    try {
      const insert = db.prepare('INSERT INTO tasks (title, description, dueDate, priority, assigneeId, completed) VALUES (?, ?, ?, ?, ?, ?)');
      for (const task of tasks) insert.run(task.title, task.description, task.dueDate, task.priority, task.assigneeId, Number(task.completed));
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('seed-v1');
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  return db;
}

export function toTask(row: Record<string, unknown>): Task {
  return { ...row, completed: Boolean(row.completed) } as Task;
}
