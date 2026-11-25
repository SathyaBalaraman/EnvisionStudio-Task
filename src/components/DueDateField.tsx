import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, colors, s } from '../ui';
import { dateLabel, localDate } from '../dates';

export default function DueDateField({ value, onChange, disabled }: { value: string | null; onChange: (value: string | null) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 10 }}>
    <View style={[s.input, { flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden' }, disabled && s.disabled]}>
      <Pressable accessibilityRole="button" accessibilityLabel={value ? `Due date: ${dateLabel(value)}. Change date` : 'Choose a due date, optional'} accessibilityState={{ disabled }} disabled={disabled} onPress={() => setOpen(true)}
        style={({ pressed }) => [{ flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 10, paddingRight: value ? 0 : 10 }, pressed && s.pressed]}>
        <View accessible={false} style={{ width: 16, height: 16, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 3 }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: 4, height: 1.5, backgroundColor: colors.muted }} />
          <View style={{ position: 'absolute', left: 3, top: -3, width: 1.5, height: 5, backgroundColor: colors.muted, borderRadius: 1 }} />
          <View style={{ position: 'absolute', right: 3, top: -3, width: 1.5, height: 5, backgroundColor: colors.muted, borderRadius: 1 }} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[s.muted, { flex: 1 }, value && { color: colors.ink }]}>{value ? dateLabel(value) : 'Choose date'}</Text>
      </Pressable>
      {value ? <Pressable accessibilityRole="button" accessibilityLabel="Clear due date" accessibilityState={{ disabled }} disabled={disabled}
        onPress={() => { setOpen(false); onChange(null); }}
        style={({ pressed }) => [{ width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, pressed && s.pressed]}>
        <View accessible={false} style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 13, height: 1.5, borderRadius: 1, backgroundColor: colors.muted, transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', width: 13, height: 1.5, borderRadius: 1, backgroundColor: colors.muted, transform: [{ rotate: '-45deg' }] }} />
        </View>
      </Pressable> : null}
    </View>
    {open && !disabled ? <><DateTimePicker value={value ? new Date(`${value}T12:00:00`) : new Date()} mode="date" onChange={(event, date) => {
      setOpen(false); if (event.type === 'set' && date) onChange(localDate(date));
    }} /><Button outline onPress={() => setOpen(false)}>Close date picker</Button></> : null}
  </View>;
}
