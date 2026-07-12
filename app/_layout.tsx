import React, { useEffect, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import "../global.css";

const InitialLayout = () => {
  const { user, userData, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup) {
        if (userData?.role === 'ADMIN' || user?.email === 'spasan42@gmail.com') {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, userData, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="booking" options={{ headerShown: true, title: 'Booking', headerBackTitle: 'Back' }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
