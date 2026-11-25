import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // A release APK must never silently use this computer's development server.
  if (process.env.EAS_BUILD === 'true') {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl || !apiUrl.startsWith('https://')) {
      throw new Error('Set EXPO_PUBLIC_API_URL to the hosted HTTPS API origin in the Expo preview environment before building.');
    }
  }
  return {
    ...config,
    name: config.name ?? 'TaskFlow',
    slug: config.slug ?? 'taskflow',
    android: {
      ...config.android,
      package: 'com.taskflow.assessment',
      versionCode: 1,
    },
  };
};
