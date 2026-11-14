import React, { useState } from 'react';
import { ActivityIndicator, Linking, Text } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/api';
import { useChart } from '../src/store';
import { Body, Button, Card, Divider, Eyebrow, FormField, GhostButton, Page, Title } from '../src/ui';
import { colors } from '../src/theme';

export default function Auth() {
  const { refresh } = useChart(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function act(mode: 'signIn' | 'signUp') { setBusy(true); setMessage(''); try { const result = mode === 'signIn' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (result.error) throw result.error; if (result.data.session) { await refresh(); router.replace('/onboarding'); } else setMessage('Check your email to confirm your account, then sign in.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Authentication failed.'); } finally { setBusy(false); } }
  return <Page><Eyebrow>ASTRA / YOUR ACCOUNT</Eyebrow><Title>A private place for your sky.</Title><Body>Your birth profile belongs to you. Sign in to keep it connected to your two astrological lenses.</Body><Divider/><Card><Eyebrow>WELCOME BACK</Eyebrow><FormField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address"/><FormField label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Password"/>{busy ? <ActivityIndicator color={colors.ivory}/> : <><Button title="Sign in" onPress={() => void act('signIn')}/><GhostButton title="Create an account" onPress={() => void act('signUp')}/></>}</Card>{message ? <Text accessibilityRole="alert" style={{ color: colors.gold }}>{message}</Text> : null}<Body>Your birth data is used to calculate your chart and stored under your account.</Body><GhostButton title="Privacy policy" onPress={() => void Linking.openURL('https://adityasingh38.github.io/astra/privacy.html')}/></Page>;
}
