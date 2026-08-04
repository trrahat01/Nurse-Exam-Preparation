import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/src/store/authStore';
import { useBookmarkStore } from '@/src/store/bookmarkStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const initialize = useAuthStore(s => s.initialize);
  const isLoading = useAuthStore(s => s.isLoading);
  const loadBookmarks = useBookmarkStore(s => s.loadBookmarks);

  useEffect(() => {
    initialize();
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="auth/forgot-password" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exam/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="exam/result" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="exam/review" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="category/[id]" />
            <Stack.Screen name="daily" />
            <Stack.Screen name="search" />
            <Stack.Screen name="bookmarks" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="analytics" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}