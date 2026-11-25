import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTasks } from '../store';
import { Button, colors, PriorityBadge, s } from '../ui';
import FilterDropdown from '../components/FilterDropdown';
import { DropdownOverlayProvider } from '../components/DropdownOverlay';
import { assignees, capitalize, type Task } from '../types';
import { dateLabel, isTaskOverdue, localDate } from '../dates';

export default function TaskList() {
  const store = useTasks();
  const insets = useSafeAreaInsets();
  const [toggleError, setToggleError] = useState('');
  const [today, setToday] = useState(localDate());
  useEffect(() => { const timer = setInterval(() => setToday(localDate()), 30000); return () => clearInterval(timer); }, []);
  const filtered = store.filters.assignee !== 'all' || store.filters.status !== 'all';
  const renderTask = ({ item }: { item: Task }) => {
    const overdue = isTaskOverdue(item, today);
    const pending = store.pendingIds.includes(item.id);
    const priorityBorder = item.completed
      ? colors.disabled
      : item.priority === 'high' ? colors.danger
      : item.priority === 'medium' ? colors.amberBorder
      : colors.green;
    return <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: priorityBorder, marginBottom: 10 }}>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={`Mark ${item.title} ${item.completed ? 'active' : 'complete'}`} accessibilityState={{ checked: item.completed, disabled: pending, busy: pending }}
        disabled={pending} style={{ width: 54, minHeight: 80, alignItems: 'center', justifyContent: 'center' }} onPress={async () => {
          setToggleError(''); try { await store.toggle(item.id); } catch (error) { setToggleError((error as Error).message); }
        }}>
        {pending ? <ActivityIndicator color={colors.green} /> : <View style={{ width: 25, height: 25, borderWidth: 1.5, borderColor: item.completed ? colors.green : colors.disabled, borderRadius: 8, backgroundColor: item.completed ? colors.green : colors.surface, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.surface, fontWeight: '700' }}>{item.completed ? '✓' : ''}</Text></View>}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => router.push(`/task/${item.id}`)} style={({ pressed }) => [{ flex: 1, paddingVertical: 17, paddingRight: 16, gap: 9 }, pressed && s.pressed]}>
        <Text style={[s.body, { fontWeight: '600' }, item.completed && { textDecorationLine: 'line-through', color: colors.muted }]}>{item.title}</Text>
        <View style={[s.spread, { flexWrap: 'wrap' }]}><Text style={[s.muted, overdue && { color: colors.danger }]}>{overdue ? 'Overdue: ' : ''}{dateLabel(item.dueDate)}</Text><PriorityBadge priority={item.priority} /></View>
        <Text style={s.muted}>{capitalize(item.assigneeId)}{item.completed ? ' — Completed' : ''}</Text>
      </Pressable>
    </View>;
  };
  return <DropdownOverlayProvider><SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
    <View style={[s.content, { gap: 22, paddingBottom: 16 }]}>
        <View><Text style={s.title}>TaskFlow</Text><Text style={s.muted}>A little focus. A clear next step.</Text></View>
        <View style={[s.row, { alignItems: 'flex-start' }]}>
          <FilterDropdown label="Assigned to" options={['all', ...assignees]} value={store.filters.assignee} onChange={assignee => store.setFilters(previous => ({ ...previous, assignee }))} />
          <FilterDropdown label="Status" options={['all', 'active', 'completed'] as const} value={store.filters.status} onChange={status => store.setFilters(previous => ({ ...previous, status }))} />
        </View>
        <View style={s.row}>
          <Text style={s.heading}>Tasks</Text>
          {!store.loading && !store.error && <View style={{ minWidth: 30, minHeight: 28, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 14, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' }}>
            <Text accessibilityLabel={`${store.tasks.length} matching ${store.tasks.length === 1 ? 'task' : 'tasks'}`} style={{ color: colors.green, fontSize: 14, fontWeight: '600' }}>{store.tasks.length}</Text>
          </View>}
        </View>
        {store.notice ? <Text accessibilityLiveRegion="polite" style={s.notice}>{store.notice}</Text> : null}
        {toggleError ? <View style={s.errorBox}><Text accessibilityRole="alert" style={s.error}>{toggleError}</Text><Text style={s.muted}>Your task has not changed. Tap its checkbox to retry.</Text></View> : null}
    </View>
    <FlatList data={store.loading || store.error ? [] : store.tasks} keyExtractor={task => String(task.id)} renderItem={renderTask}
      style={{ flex: 1 }}
      contentContainerStyle={[s.content, { paddingTop: 0, paddingBottom: insets.bottom + 110, gap: 0 }]} refreshing={store.loading} onRefresh={store.refresh}
      ListEmptyComponent={<View style={{ paddingVertical: 32, gap: 16 }}>
        {store.loading ? <><ActivityIndicator color={colors.green} /><Text style={[s.muted, { textAlign: 'center' }]}>Loading your tasks…</Text></> : store.error ? <><Text style={s.heading}>Unable to load tasks</Text><Text accessibilityRole="alert" style={s.error}>{store.error}</Text><Button onPress={store.refresh}>Try again</Button></> : <><Text style={s.heading}>{filtered ? 'No tasks match these filters' : 'A fresh start'}</Text><Text style={s.muted}>{filtered ? 'Try another assignee or status to find your tasks.' : 'Add your first task to get started.'}</Text><Button outline onPress={filtered ? () => store.setFilters({ assignee: 'all', status: 'all' }) : () => router.push('/add')}>{filtered ? 'Clear filters' : 'Add a task'}</Button></>}
      </View>} />
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add task"
      onPress={() => router.push('/add')}
      style={({ pressed }) => ({
        position: 'absolute',
        right: insets.right + 22,
        bottom: insets.bottom + 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.green,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        elevation: 4,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      })}
    >
      <View accessible={false} style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 22, height: 2, borderRadius: 1, backgroundColor: colors.surface }} />
        <View style={{ position: 'absolute', width: 2, height: 22, borderRadius: 1, backgroundColor: colors.surface }} />
      </View>
    </Pressable>
  </SafeAreaView></DropdownOverlayProvider>;
}
