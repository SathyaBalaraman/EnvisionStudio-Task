import { colors } from '../ui';
export default function DueDateField({ value, onChange, disabled }: { value: string | null; onChange: (value: string | null) => void; disabled: boolean }) {
  return <input aria-label="Due date (optional)" type="date" value={value ?? ''} disabled={disabled} onChange={event => onChange(event.target.value || null)}
    style={{ boxSizing: 'border-box', width: '100%', minHeight: 50, padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.ink, fontSize: 16 }} />;
}
