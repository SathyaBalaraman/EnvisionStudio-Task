export type Assignee = 'aarav' | 'priya' | 'rohan';
export type Priority = 'low' | 'medium' | 'high';
export type Task = {
  id: number; title: string; description: string; dueDate: string | null;
  priority: Priority; assigneeId: Assignee; completed: boolean;
};
export type TaskDraft = Omit<Task, 'id' | 'completed'>;
export type Filters = { assignee: 'all' | Assignee; status: 'all' | 'active' | 'completed' };
export const assignees: Assignee[] = ['aarav', 'priya', 'rohan'];
export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
