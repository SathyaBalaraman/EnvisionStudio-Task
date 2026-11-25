import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../../store';
import { api } from '../../api';
import type { Task } from '../../types';
import { capitalize } from '../../types';
import { dateLabel, isTaskOverdue } from '../../dates';
import { Button, colors, Field, PriorityBadge, s } from '../../ui';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useTasks();
  const insets = useSafeAreaInsets();
  const [fetched, setFetched] = useState<Task>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const task = store.cache[Number(id)] || fetched;
  useEffect(() => {
    if (task) return;
    let active = true;
    api.list().then(tasks => { if (active) { const found = tasks.find(item => item.id === Number(id)); setFetched(found); if (!found) setError('This task could not be found.'); } })
      .catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, task, attempt]);
  return <View style={s.screen}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
    {loading && !task ? <ActivityIndicator color={colors.green} /> : task ? <>
      <Text style={s.title}>{task.title}</Text>
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        <PriorityBadge priority={task.priority} />
        <View style={{ backgroundColor: task.completed ? colors.paleGreen : colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: task.completed ? colors.green : colors.muted, fontSize: 12, fontWeight: '600' }}>{task.completed ? 'Completed' : 'Active'}</Text>
        </View>
      </View>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Due date"><Text style={s.body}>{dateLabel(task.dueDate)}</Text></Field>
          {isTaskOverdue(task) ? <Text style={[s.error, { marginTop: 4 }]}>Overdue</Text> : null}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Assigned to"><Text style={s.body}>{capitalize(task.assigneeId)}</Text></Field>
        </View>
      </View>
      <View style={s.divider} />
      <Field label="Description"><Text style={task.description ? s.body : s.muted}>{task.description || 'No description provided.'}</Text></Field>
      <Text style={s.muted}>Task #{task.id}</Text>
      {store.notice ? <Text accessibilityLiveRegion="polite" style={s.notice}>{store.notice}</Text> : null}
    </> : <><Text style={s.heading}>Task unavailable</Text><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button onPress={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}>Try again</Button></>}
      {!router.canGoBack() && <Button outline onPress={() => router.replace('/')}>Back to tasks</Button>}
    </ScrollView>
    {task && <View style={{ backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: insets.bottom }}>
      <View style={[s.content, { paddingVertical: 16, gap: 12 }]}>
        {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
        <Button busy={store.pendingIds.includes(task.id)} onPress={async () => { setError(''); try { await store.toggle(task.id); } catch (reason) { setError((reason as Error).message); } }}>{task.completed ? 'Mark as incomplete' : 'Mark as complete'}</Button>
      </View>
    </View>}
  </View>;
}
