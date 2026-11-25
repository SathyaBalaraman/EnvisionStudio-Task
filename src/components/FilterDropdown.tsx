import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDropdownOverlay } from './DropdownOverlay';
import { capitalize } from '../types';
import { colors, s } from '../ui';

export default function FilterDropdown<T extends string>({ label, options, value, onChange, disabled = false, hideLabel = false }: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const trigger = useRef<ComponentRef<typeof View>>(null);
  const open = useDropdownOverlay();

  return <View style={{ flex: 1, minWidth: 0 }}>
    {!hideLabel && <Text style={s.label}>{label}</Text>}
      <View ref={trigger} collapsable={false}><Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${capitalize(value)}`}
        accessibilityHint="Opens selection options below this field"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => open({ trigger, label, options, value, onChange: selected => onChange(selected as T) })}
        style={({ pressed }) => [styles.trigger, pressed && s.pressed, disabled && s.disabled]}
      >
        <Text numberOfLines={1} style={[s.body, { flexShrink: 1 }]}>{capitalize(value)}</Text>
        <View accessible={false} style={styles.chevron} />
      </Pressable></View>
  </View>;
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.muted,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
    marginRight: 2,
  },
});
