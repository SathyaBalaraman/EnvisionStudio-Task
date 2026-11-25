import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Filters, Task, TaskDraft } from './types';

function useTaskStore() {
  const [filters, setFilters] = useState<Filters>({ assignee: 'all', status: 'all' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cache, setCache] = useState<Record<number, Task>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const pending = useRef(new Set<number>());
  const generation = useRef(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const current = ++generation.current;
    let active = true;
    // Reset request feedback when filters change; network results are applied asynchronously below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError('');
    api.list(filters).then(result => {
      if (!active || current !== generation.current) return;
      setTasks(result);
      setCache(previous => ({ ...previous, ...Object.fromEntries(result.map(task => [task.id, task])) }));
    }).catch((reason: Error) => { if (active && current === generation.current) setError(reason.message); })
      .finally(() => { if (active && current === generation.current) setLoading(false); });
    return () => { active = false; };
  }, [filters, revision]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const toggle = async (id: number) => {
    if (pending.current.has(id)) return;
    pending.current.add(id); setPendingIds([...pending.current]);
    // Invalidate a list request that started before this mutation.
    generation.current++;
    try {
      const updated = await api.toggle(id);
      setCache(previous => ({ ...previous, [id]: updated }));
      setNotice(updated.completed ? 'Task completed.' : 'Task marked active.');
    } finally {
      pending.current.delete(id); setPendingIds([...pending.current]); refresh();
    }
  };
  const create = async (draft: TaskDraft) => {
    const created = await api.create(draft);
    setCache(previous => ({ ...previous, [created.id]: created }));
    setNotice('Task added. Your current filters still apply.');
    refresh();
  };
  return { filters, setFilters, tasks, cache, loading, error, notice, pendingIds, refresh, toggle, create };
}
const Context = createContext<ReturnType<typeof useTaskStore> | null>(null);
export function TaskProvider({ children }: { children: ReactNode }) {
  const store = useTaskStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useTasks() {
  const context = useContext(Context);
  if (!context) throw new Error('TaskProvider is missing.');
  return context;
}
