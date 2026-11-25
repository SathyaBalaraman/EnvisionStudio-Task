export const priorities = ['low', 'medium', 'high'] as const;
export const assignees = ['aarav', 'priya', 'rohan'] as const;
export type TaskInput = {
  title: string; description: string; dueDate: string | null;
  priority: typeof priorities[number]; assigneeId: typeof assignees[number]; completed: boolean;
};
export type Task = TaskInput & { id: number };

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateTask(body: unknown): { errors: Record<string, string>; value?: TaskInput } {
  const errors: Record<string, string> = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { errors: { form: 'Provide a JSON object.' } };
  const input = body as Record<string, unknown>;
  if (typeof input.title !== 'string' || !input.title.trim()) errors.title = 'Enter a task title.';
  else if (input.title.trim().length > 200) errors.title = 'Use 200 characters or fewer.';
  if (input.description !== undefined && typeof input.description !== 'string') errors.description = 'Description must be text.';
  else if (typeof input.description === 'string' && input.description.length > 5000) errors.description = 'Use 5,000 characters or fewer.';
  if (input.dueDate !== undefined && input.dueDate !== null && !isDateOnly(input.dueDate)) errors.dueDate = 'Choose a valid date in YYYY-MM-DD format.';
  if (!priorities.includes(input.priority as TaskInput['priority'])) errors.priority = 'Choose low, medium, or high.';
  if (!assignees.includes(input.assigneeId as TaskInput['assigneeId'])) errors.assigneeId = 'Choose Aarav, Priya, or Rohan.';
  if (input.completed !== undefined && typeof input.completed !== 'boolean') errors.completed = 'Completion must be true or false.';
  if (Object.keys(errors).length) return { errors };
  return { errors, value: {
    title: (input.title as string).trim(), description: (input.description as string | undefined)?.trim() ?? '',
    dueDate: (input.dueDate as string | null | undefined) ?? null,
    priority: input.priority as TaskInput['priority'], assigneeId: input.assigneeId as TaskInput['assigneeId'],
    completed: (input.completed as boolean | undefined) ?? false,
  } };
}
