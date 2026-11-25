import { createContext, useContext, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { capitalize } from '../types';
import { colors, s } from '../ui';

type MenuRequest = {
  trigger: RefObject<ComponentRef<typeof View> | null>;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};
type Menu = Omit<MenuRequest, 'trigger'> & { left: number; top: number; width: number; maxHeight: number };
const Context = createContext<((request: MenuRequest) => void) | null>(null);

export function DropdownOverlayProvider({ children }: { children: ReactNode }) {
  const root = useRef<ComponentRef<typeof View>>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const insets = useSafeAreaInsets();
  const close = () => setMenu(null);
  function open(request: MenuRequest) {
    // Both measurements use the same native window. Subtracting the screen origin
    // avoids the status-bar/header offsets introduced by a separate Modal window.
    root.current?.measureInWindow((rootX, rootY, rootWidth, rootHeight) => {
      request.trigger.current?.measureInWindow((x, y, width, height) => {
        const top = y - rootY + height + 8;
        const menuWidth = Math.min(width, rootWidth - 32);
        setMenu({
          label: request.label, options: request.options, value: request.value, onChange: request.onChange,
          left: Math.max(16, Math.min(x - rootX, rootWidth - menuWidth - 16)),
          top, width: menuWidth, maxHeight: Math.max(0, rootHeight - top - insets.bottom - 16),
        });
      });
    });
  }
  return <Context.Provider value={open}>
    <View ref={root} collapsable={false} style={{ flex: 1 }} onLayout={close}>
      {children}
      {menu && <View style={StyleSheet.absoluteFill} accessibilityViewIsModal onAccessibilityEscape={close}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close dropdown" onPress={close} style={StyleSheet.absoluteFill} />
        <View style={[styles.menu, { left: menu.left, top: menu.top, width: menu.width, maxHeight: menu.maxHeight }]}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {menu.options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={`${menu.label}: ${capitalize(option)}`}
              accessibilityState={{ selected: option === menu.value }}
              onPress={() => { close(); menu.onChange(option); }}
              style={({ pressed }) => [styles.option, option === menu.value && { backgroundColor: colors.paleGreen }, pressed && s.pressed]}>
              <Text style={[s.body, option === menu.value && { color: colors.green, fontWeight: '600' }]}>{capitalize(option)}</Text>
            </Pressable>)}
          </ScrollView>
        </View>
      </View>}
    </View>
  </Context.Provider>;
}

export function useDropdownOverlay() {
  const open = useContext(Context);
  if (!open) throw new Error('DropdownOverlayProvider is missing.');
  return open;
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute', backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', elevation: 6,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8,
  },
  option: { minHeight: 50, paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'center' },
});
