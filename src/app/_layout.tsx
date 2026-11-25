import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from '../store';
import { colors } from '../ui';

export default function Layout() {
  return <TaskProvider><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="task/[id]" options={{ title: 'Task details' }} />
    <Stack.Screen name="add" options={{ title: 'New task', presentation: 'modal', gestureEnabled: false }} />
  </Stack></TaskProvider>;
}
