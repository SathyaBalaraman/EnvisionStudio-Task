import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { capitalize, type Priority } from './types';

export const colors = {
  background: '#F6F7F2', surface: '#FFFFFF', ink: '#172D26', muted: '#65726B',
  green: '#176348', paleGreen: '#E4EFE7', border: '#DCE3DA', danger: '#A53225', paleRed: '#FBEDE7',
  amber: '#765600', amberBorder: '#E3B329', paleAmber: '#FFF4C7', disabled: '#97A49C',
};
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 22, gap: 20 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  heading: { color: colors.ink, fontSize: 23, fontWeight: '700' },
  body: { color: colors.ink, fontSize: 16, lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  selectionText: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  onGreen: { color: colors.surface },
  button: { minHeight: 50, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
  input: { backgroundColor: colors.surface, color: colors.ink, borderWidth: 1, borderColor: colors.border, borderRadius: 12, minHeight: 50, padding: 14, fontSize: 16 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
  errorBox: { backgroundColor: colors.paleRed, padding: 16, borderRadius: 12, gap: 10 },
  notice: { color: colors.green, backgroundColor: colors.paleGreen, padding: 14, borderRadius: 12, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border },
});
export function Button({ children, onPress, busy = false, disabled = false, outline = false, style }: {
  children: string; onPress: () => void; busy?: boolean; disabled?: boolean; outline?: boolean; style?: ViewStyle;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || disabled, busy }} disabled={busy || disabled} onPress={onPress}
    style={({ pressed }) => [s.button, outline && s.outline, (busy || disabled) && s.disabled, pressed && s.pressed, style]}>
    {busy ? <ActivityIndicator color={outline ? colors.green : colors.surface} /> : <Text style={[s.buttonText, outline && { color: colors.ink }]}>{children}</Text>}
  </Pressable>;
}
export function PriorityControl({ value, onChange, disabled = false }: {
  value: Priority; onChange: (value: Priority) => void; disabled?: boolean;
}) {
  return <View style={{ flexDirection: 'row', padding: 4, gap: 4, borderRadius: 14, backgroundColor: colors.paleGreen, borderWidth: 1, borderColor: colors.border }}>
    {(['low', 'medium', 'high'] as const).map(priority => <Pressable
      key={priority}
      accessibilityRole="radio"
      accessibilityLabel={`${capitalize(priority)} priority`}
      accessibilityState={{ selected: value === priority, disabled }}
      disabled={disabled}
      onPress={() => onChange(priority)}
      style={({ pressed }) => [{
        flex: 1,
        minHeight: 44,
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: value === priority ? colors.green : colors.paleGreen,
      }, pressed && s.pressed, disabled && s.disabled]}
    >
      <Text style={[s.selectionText, value === priority && s.onGreen]}>{capitalize(priority)}</Text>
    </Pressable>)}
  </View>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  const palette = priority === 'high' ? [colors.paleRed, colors.danger] : priority === 'medium' ? [colors.paleAmber, colors.amber] : [colors.paleGreen, colors.green];
  return <View style={{ backgroundColor: palette[0], borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}><Text style={{ color: palette[1], fontSize: 12, fontWeight: '600' }}>{capitalize(priority)}</Text></View>;
}
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <View><Text style={s.label}>{label}</Text>{children}{error ? <Text accessibilityRole="alert" style={[s.error, { marginTop: 6 }]}>{error}</Text> : null}</View>;
}
