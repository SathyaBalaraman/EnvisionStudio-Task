export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function isTaskOverdue(task: { dueDate?: unknown; completed: boolean }, today = localDate()): boolean {
  return !task.completed && isDateOnly(task.dueDate) && task.dueDate < today;
}
export function dateLabel(value: string | null): string {
  if (!value) return 'No due date';
  if (!isDateOnly(value)) return 'Invalid due date';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
