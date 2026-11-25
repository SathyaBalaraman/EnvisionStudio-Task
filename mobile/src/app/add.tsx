import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTasks } from '../store';
import type { ApiError } from '../api';
import { assignees, type TaskDraft } from '../types';
import { isDateOnly } from '../dates';
import { Button, colors, Field, PriorityControl, s } from '../ui';
import DueDateField from '../components/DueDateField';
import FilterDropdown from '../components/FilterDropdown';
import { DropdownOverlayProvider } from '../components/DropdownOverlay';

export default function AddTask() {
  const store = useTasks();
  const [draft, setDraft] = useState<TaskDraft>({ title: '', description: '', dueDate: null, priority: 'medium', assigneeId: 'aarav' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: '', form: '' }));
  }
  async function submit() {
    if (submitting.current) return;
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Enter a task title.';
    if (draft.dueDate && !isDateOnly(draft.dueDate)) next.dueDate = 'Choose a valid date.';
    if (Object.keys(next).length) { setErrors(next); scroll.current?.scrollTo({ y: 0, animated: true }); return; }
    submitting.current = true; setBusy(true); setErrors({});
    try { await store.create(draft); if (router.canGoBack()) router.back(); else router.replace('/'); }
    catch (reason) {
      const error = reason as ApiError;
      setErrors(Object.keys(error.fields || {}).length ? error.fields : { form: error.message });
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally { submitting.current = false; setBusy(false); }
  }
  return <DropdownOverlayProvider><KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { paddingBottom: 50 }]}>
      <Text style={s.title}>Make room for what’s next.</Text>
      <Text style={s.muted}>Give your task a title, choose an assignee, and take it from there.</Text>
      {Object.values(errors).some(Boolean) ? <View style={s.errorBox}><Text accessibilityRole="alert" style={s.error}>{errors.form || 'Please check the highlighted fields below.'}</Text></View> : null}
      <Field label="Title *" error={errors.title}><TextInput accessibilityLabel="Task title, required" placeholder="What needs to get done?" placeholderTextColor={colors.muted} value={draft.title} editable={!busy} maxLength={200} onChangeText={value => update('title', value)} style={[s.input, !!errors.title && s.inputError]} /></Field>
      <Field label="Description" error={errors.description}><TextInput accessibilityLabel="Description" placeholder="Add a little context (optional)" placeholderTextColor={colors.muted} value={draft.description} editable={!busy} multiline maxLength={5000} onChangeText={value => update('description', value)} style={[s.input, { minHeight: 110, textAlignVertical: 'top' }, !!errors.description && s.inputError]} /></Field>
      <View style={[s.row, { alignItems: 'flex-start' }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Due date" error={errors.dueDate}><DueDateField value={draft.dueDate} onChange={value => update('dueDate', value)} disabled={busy} /></Field>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field label="Assigned to *" error={errors.assigneeId}>
            <View style={s.row}>
          <FilterDropdown label="Assigned to" hideLabel options={assignees} value={draft.assigneeId} onChange={value => update('assigneeId', value)} disabled={busy} />
            </View>
          </Field>
        </View>
      </View>
      <Field label="Priority *" error={errors.priority}><PriorityControl value={draft.priority} onChange={value => update('priority', value)} disabled={busy} /></Field>
      <Button busy={busy} disabled={!draft.title.trim()} onPress={submit}>Create task</Button>
      <Button outline disabled={busy} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>Cancel</Button>
    </ScrollView>
  </KeyboardAvoidingView></DropdownOverlayProvider>;
}
