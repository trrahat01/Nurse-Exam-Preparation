import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as Linking from 'expo-linking';
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
  const verifyOtp = useAuthStore(s => s.verifyOtp);
  const initialize = useAuthStore(s => s.initialize);
  const retryInitialize = useAuthStore(s => s.retryInitialize);
  const isLoading = useAuthStore(s => s.isLoading);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const initStatus = useAuthStore(s => s.initStatus);
  const loadBookmarks = useBookmarkStore(s => s.loadBookmarks);

  const [retrying, setRetrying] = useState(false);
  const [processedUrls] = useState(() => new Set<string>());

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated]);

  // Deep-link handling for email verification & auth callbacks
  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || processedUrls.has(url)) return;
      processedUrls.add(url);

      try {
        const parsed = Linking.parse(url);
        const queryParams = parsed.queryParams || {};
        
        let token_hash = (queryParams.token_hash as string) || (queryParams.token as string);
        let type = (queryParams.type as string) || 'email_change';

        if (!token_hash && url.includes('#')) {
          const fragment = url.split('#')[1];
          const hashParams = new URLSearchParams(fragment);
          token_hash = hashParams.get('token_hash') || hashParams.get('token') || hashParams.get('access_token') || '';
          type = hashParams.get('type') || type;
        }

        if (token_hash) {
          await verifyOtp({ token_hash, type });
          Alert.alert('Email Verified!', 'Your email has been verified. Please complete your password setup.');
        }
      } catch (err: any) {
        console.error('Deep link verification failed:', err);
        Alert.alert('Verification Error', err.message || 'Failed to verify deep link.');
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [verifyOtp, processedUrls]);

  useEffect(() => {
    if (fontsLoaded && !isLoading && initStatus !== 'networkError' && initStatus !== 'configError' && initStatus !== 'authError') {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading, initStatus]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryInitialize();
    } catch (e: any) {
      Alert.alert('Retry Failed', e.message || 'Could not connect. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  if (!fontsLoaded || isLoading) return null;

  if (initStatus === 'networkError' || initStatus === 'configError' || initStatus === 'authError') {
    const errorDetails = {
      networkError: {
        title: 'Connection Issue',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
      },
      configError: {
        title: 'Configuration Error',
        message: 'Application configuration is incomplete or invalid. Please check your setup.',
      },
      authError: {
        title: 'Authentication Error',
        message: 'Failed to restore your user session. Please retry or re-authenticate.',
      },
    }[initStatus];

    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{errorDetails.title}</Text>
          <Text style={styles.errorMessage}>{errorDetails.message}</Text>
          <Pressable style={[styles.retryBtn, retrying && { opacity: 0.7 }]} onPress={handleRetry} disabled={retrying}>
            {retrying ? <ActivityIndicator color="#fff" /> : <Text style={styles.retryBtnText}>Retry Connection</Text>}
          </Pressable>
        </View>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  errorContainer: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, gap: 16, alignItems: 'center', elevation: 4, width: '100%', maxWidth: 400 },
  errorTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E', textAlign: 'center' },
  errorMessage: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', lineHeight: 22 },
  retryBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: '#0891B2', marginTop: 8, width: '100%', alignItems: 'center' },
  retryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});


