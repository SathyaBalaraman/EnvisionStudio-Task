import { Platform } from 'react-native';
import type { Filters, Task, TaskDraft } from './types';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001')).replace(/\/$/, '');
export class ApiError extends Error {
  fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string> = {}) { super(message); this.fields = fields; }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_URL}/api/tasks${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json' } });
    const body = await response.json();
    if (!response.ok) throw new ApiError(body.message || 'Please check the highlighted fields.', body.errors || {});
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError('The server took too long to respond. Please try again.');
    throw new ApiError('Cannot reach the server. Check your connection and API URL, then try again.');
  } finally { clearTimeout(timeout); }
}
export const api = {
  list: (filters?: Filters) => {
    const params = new URLSearchParams();
    if (filters?.assignee !== undefined && filters.assignee !== 'all') params.set('assignee', filters.assignee);
    if (filters?.status !== undefined && filters.status !== 'all') params.set('status', filters.status);
    return request<Task[]>(params.size ? `?${params}` : '');
  },
  create: (task: TaskDraft) => request<Task>('', { method: 'POST', body: JSON.stringify(task) }),
  toggle: (id: number) => request<Task>(`/${id}/toggle`, { method: 'PATCH' }),
};
