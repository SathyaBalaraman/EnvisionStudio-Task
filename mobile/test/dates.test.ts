import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTaskOverdue, isDateOnly, localDate } from '../src/dates.ts';
test('overdue is safe for missing/invalid dates and excludes completed tasks', () => {
  for (const dueDate of [null, undefined, '', 'bad', '2026-02-30', '2026-2-01', 42]) assert.equal(isTaskOverdue({ dueDate, completed: false }, '2026-11-23'), false);
  assert.equal(isTaskOverdue({ dueDate: '2026-11-22', completed: false }, '2026-11-23'), true);
  assert.equal(isTaskOverdue({ dueDate: '2026-11-22', completed: true }, '2026-11-23'), false);
  assert.equal(isTaskOverdue({ dueDate: '2026-11-23', completed: false }, '2026-11-23'), false);
  assert.equal(isTaskOverdue({ dueDate: '2026-11-24', completed: false }, '2026-11-23'), false);
  assert.equal(isDateOnly('2028-02-29'), true);
  assert.equal(isDateOnly('2026-02-29'), false);
});
test('today follows local calendar at UTC boundaries', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Asia/Kolkata';
    assert.equal(localDate(new Date('2026-11-22T20:00:00Z')), '2026-11-23');
    process.env.TZ = 'America/Los_Angeles';
    assert.equal(localDate(new Date('2026-11-23T02:00:00Z')), '2026-11-22');
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
