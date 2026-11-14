import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChartProvider } from '../src/store';
import { colors } from '../src/theme';

export default function Layout() { return <ChartProvider><StatusBar style="light"/><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ivory, contentStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}><Stack.Screen name="index" options={{ headerShown: false }}/><Stack.Screen name="auth" options={{ title: 'Your ASTRA account' }}/><Stack.Screen name="onboarding" options={{ title: 'Your birth profile' }}/><Stack.Screen name="preview" options={{ title: 'Illustrative chart preview' }}/><Stack.Screen name="reading-preview" options={{ title: 'Sample ASTRA reading' }}/><Stack.Screen name="learn" options={{ title: 'ASTRA field guide' }}/><Stack.Screen name="moolank" options={{ title: 'Your Moolank' }}/><Stack.Screen name="(tabs)" options={{ headerShown: false }}/></Stack></ChartProvider>; }
