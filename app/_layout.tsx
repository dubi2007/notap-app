import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const { session, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) {
        return;
      }

      setSession(session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const isLoginRoute = segments[0] === 'login';

    if (!session && !isLoginRoute) {
      router.replace('/login');
    } else if (session && isLoginRoute) {
      router.replace('/(tabs)');
    }
  }, [authReady, router, segments, session]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F9FF' } }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="folder/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="note/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
