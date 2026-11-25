import express from 'express';
import cors from 'cors';
import type { DatabaseSync } from 'node:sqlite';
import { assignees, validateTask } from './validation.ts';
import { toTask } from './db.ts';

export function createApp(db: DatabaseSync) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/tasks', (req, res) => {
    const { assignee, status } = req.query;
    const errors: Record<string, string> = {};
    if (assignee !== undefined && (typeof assignee !== 'string' || !assignees.includes(assignee as typeof assignees[number]))) errors.assignee = 'Choose aarav, priya, or rohan.';
    if (status !== undefined && status !== 'active' && status !== 'completed') errors.status = 'Choose active or completed.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const clauses: string[] = [];
    const params: (string | number)[] = [];
    if (assignee) { clauses.push('assigneeId = ?'); params.push(assignee as string); }
    if (status) { clauses.push('completed = ?'); params.push(status === 'completed' ? 1 : 0); }
    const rows = db.prepare(`SELECT * FROM tasks ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY id DESC`).all(...params);
    return res.json(rows.map(toTask));
  });
  app.post('/api/tasks', (req, res) => {
    const { value, errors } = validateTask(req.body);
    if (!value) return res.status(400).json({ errors });
    const result = db.prepare('INSERT INTO tasks (title, description, dueDate, priority, assigneeId, completed) VALUES (?, ?, ?, ?, ?, ?)')
      .run(value.title, value.description, value.dueDate, value.priority, value.assigneeId, Number(value.completed));
    return res.status(201).json(toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(result.lastInsertRowid))!));
  });
  app.patch('/api/tasks/:id/toggle', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(404).json({ message: 'Task not found.' });
    const row = db.prepare('UPDATE tasks SET completed = 1 - completed WHERE id = ? RETURNING *').get(id);
    if (!row) return res.status(404).json({ message: 'Task not found.' });
    return res.json(toTask(row));
  });
  app.use((_req, res) => { res.status(404).json({ message: 'Endpoint not found.' }); });
  app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error.status === 400) { res.status(400).json({ errors: { form: 'Request must contain valid JSON.' } }); return; }
    if (error.status === 413) { res.status(413).json({ message: 'Request is too large.' }); return; }
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  });
  return app;
}
