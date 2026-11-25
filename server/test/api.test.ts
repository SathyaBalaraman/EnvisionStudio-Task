import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/db.ts';
import { createApp } from '../src/app.ts';
import type { Task } from '../src/validation.ts';

test('API workflow, validation, filters, empty state, and failures', async () => {
  const db = openDatabase(':memory:');
  const server = createApp(db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as { port: number };
  const request = (path = '', options?: RequestInit) => fetch(`http://127.0.0.1:${address.port}/api/tasks${path}`, options);
  const post = (body: unknown) => request('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const tasks: Task[] = await (await request()).json();
    assert.equal(tasks.length, 15);
    assert.equal(tasks.filter(t => t.completed).length, 4);
    for (const assignee of ['aarav', 'priya', 'rohan']) {
      for (const status of ['active', 'completed']) {
        const matching: Task[] = await (await request(`?assignee=${assignee}&status=${status}`)).json();
        assert.deepEqual(matching, tasks.filter(t => t.assigneeId === assignee && t.completed === (status === 'completed')));
      }
      const matching: Task[] = await (await request(`?assignee=${assignee}`)).json();
      assert.deepEqual(matching, tasks.filter(t => t.assigneeId === assignee));
    }
    for (const status of ['active', 'completed']) {
      const matching = await (await request(`?status=${status}`)).json();
      assert.deepEqual(matching, tasks.filter(t => t.completed === (status === 'completed')));
    }
    const valid = { title: '  New task  ', priority: 'medium', assigneeId: 'aarav' };
    const response = await post(valid);
    assert.equal(response.status, 201);
    const created: Task = await response.json();
    assert.equal(created.title, 'New task');
    assert.equal(created.completed, false);
    assert.equal(created.dueDate, null);
    for (const [field, value] of [['title', undefined], ['title', '  '], ['title', 42], ['priority', 'urgent'], ['assigneeId', 'someone'], ['dueDate', '2026-02-30'], ['dueDate', 'tomorrow'], ['completed', 'false'], ['description', null]]) {
      const invalid = await post({ ...valid, [field as string]: value });
      assert.equal(invalid.status, 400);
      assert.ok((await invalid.json()).errors[field as string]);
    }
    for (const path of ['?status=bad', '?assignee=bad', '?assignee=aarav&assignee=priya']) assert.equal((await request(path)).status, 400);
    const toggle = () => request(`/${created.id}/toggle`, { method: 'PATCH' });
    assert.equal((await (await toggle()).json()).completed, true);
    assert.equal((await (await toggle()).json()).completed, false);
    const completedAarav = tasks.find(t => t.assigneeId === 'aarav' && t.completed)!;
    await request(`/${completedAarav.id}/toggle`, { method: 'PATCH' });
    assert.deepEqual(await (await request('?assignee=aarav&status=completed')).json(), []);
    for (const id of ['999999', 'abc', '0']) assert.equal((await request(`/${id}/toggle`, { method: 'PATCH' })).status, 404);
    const malformed = await request('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(malformed.status, 400);
    assert.ok((await malformed.json()).errors.form);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); db.close(); }
});

test('database persists edits and seeds only once', () => {
  const dir = mkdtempSync(join(tmpdir(), 'taskflow-'));
  try {
    let db = openDatabase(join(dir, 'test.db'));
    db.prepare('UPDATE tasks SET completed = 1 WHERE id = 1').run();
    db.close();
    db = openDatabase(join(dir, 'test.db'));
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM tasks').get()!.count, 15);
    assert.equal(db.prepare('SELECT completed FROM tasks WHERE id = 1').get()!.completed, 1);
    db.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
