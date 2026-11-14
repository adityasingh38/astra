import React, { useState } from 'react';
import { Alert, Linking, Platform, Share, Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, ChoiceChip, Divider, Eyebrow, GhostButton, Page, Title } from '../../src/ui';
import { useChart } from '../../src/store';
import { apiFetch, supabase } from '../../src/api';

function confirmAction(message: string, action: () => void) { if (Platform.OS === 'web') { if (window.confirm(message)) action(); } else Alert.alert('Please confirm', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'destructive', onPress: action }]); }
export default function You() {
  const { chart, session, profileId, profiles, selectProfile, refresh } = useChart(); const [error, setError] = useState('');
  async function removeProfile() { if (!profileId) return; try { await apiFetch(`/birth-profiles/${profileId}`, { method: 'DELETE' }); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Deletion failed'); } }
  async function exportData() { try { const data = await apiFetch('/privacy/export'); const contents = JSON.stringify(data, null, 2); if (Platform.OS === 'web') { const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'astra-data.json'; link.click(); URL.revokeObjectURL(url); } else await Share.share({ message: contents, title: 'ASTRA data export' }); } catch (e) { setError(e instanceof Error ? e.message : 'Export failed'); } }
  async function deleteAccount() { try { const { error: deletionError } = await supabase.rpc('delete_my_account'); if (deletionError) throw deletionError; await supabase.auth.signOut(); router.replace('/'); } catch (e) { setError(e instanceof Error ? e.message : 'Account deletion failed'); } }
  return <Page><Eyebrow>ASTRA / YOU</Eyebrow><Title>Your story begins here.</Title><Body>Choose whose chart to explore. Your profiles and saved chart facts are private to your account.</Body><Divider/>
    {profiles.map(profile => <ChoiceChip key={profile.id} label={profile.preferred_name} selected={profileId === profile.id} onPress={() => { void selectProfile(profile.id).catch(e => setError(e instanceof Error ? e.message : 'Chart unavailable')); }}/>) }
    <Card><Eyebrow>SELECTED BIRTH PROFILE</Eyebrow><Body>{chart ? `${chart.birth_profile.name} · ${chart.birth_profile.birth_date} · ${chart.birth_profile.place_label}` : 'No birth profile saved yet.'}</Body></Card>
    <Button title="Add another birth profile" onPress={() => router.push(session ? '/onboarding' : '/auth')}/>
    {profileId && <><GhostButton title="Edit selected profile" onPress={() => router.push({ pathname: '/onboarding', params: { edit: profileId } })}/><GhostButton title="Export my data" onPress={() => void exportData()}/><GhostButton title="Delete selected profile" onPress={() => confirmAction('Delete this birth profile and its saved charts?', () => void removeProfile())}/></>}
    {session && <><GhostButton title="Delete my account" onPress={() => confirmAction('Permanently delete your account, all birth profiles, and saved charts?', () => void deleteAccount())}/><GhostButton title="Sign out" onPress={() => { void supabase.auth.signOut(); router.replace('/'); }}/></>}
    <GhostButton title="Privacy policy" onPress={() => void Linking.openURL('https://adityasingh38.github.io/astra/privacy.html')}/>
    {error ? <Text accessibilityRole="alert" style={{ color: '#FFB4A9' }}>{error}</Text> : null}</Page>;
}
