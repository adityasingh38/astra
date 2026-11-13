import React from 'react';
import { router } from 'expo-router';
import { Body, Button, Card, Divider, Eyebrow, GhostButton, Page, Title } from '../../src/ui';
import { useChart } from '../../src/store';
import { supabase } from '../../src/api';

export default function You() { const { chart, session } = useChart(); return <Page><Eyebrow>ASTRA / YOU</Eyebrow><Title>Your story begins here.</Title><Body>Keep the details that shape your chart close, private, and easy to revisit.</Body><Divider/><Card><Eyebrow>BIRTH PROFILE</Eyebrow><Body>{chart ? `${chart.birth_profile.name} · ${chart.birth_profile.birth_date} · ${chart.birth_profile.place_label}` : 'No birth profile saved yet.'}</Body><Body>Stored under your account with row level security.</Body></Card><Button title="Add another birth profile" onPress={() => router.push(session ? '/onboarding' : '/auth')}/>{session ? <GhostButton title="Sign out" onPress={() => { void supabase.auth.signOut(); router.replace('/'); }}/> : null}</Page>; }
