import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, Divider, Eyebrow, GhostButton, Page, PaperCard, Title } from '../src/ui';
import { colors } from '../src/theme';
import { apiFetch } from '../src/api';
import { useChart } from '../src/store';

type Moolank = { number: number; associated_planet: string; calculation: { day_of_month: number; steps: number[]; rule: string }; reading: { title: string; entries: { heading: string; text: string }[] }; source: 'astra_catalog'; tradition_note: string };

export default function MoolankScreen() {
  const { profileId, chart, session } = useChart();
  const [result, setResult] = useState<Moolank | null>(null); const [error, setError] = useState('');
  useEffect(() => { let alive = true; setResult(null); setError(''); if (profileId) apiFetch<Moolank>(`/birth-profiles/${profileId}/moolank`).then(value => { if (alive) setResult(value); }).catch(cause => { if (alive) setError(cause instanceof Error ? cause.message : 'Moolank unavailable.'); }); return () => { alive = false; }; }, [profileId]);
  return <Page><Eyebrow>ASTRA / BIRTH NUMBER</Eyebrow><Title>A number from your day.</Title><Body>Moolank uses the day of the month you were born. It is a numerology reading alongside your charts, with its arithmetic shown.</Body><Divider/>
    {!profileId && <><Card><Body>Save a birth profile to see your Moolank reading.</Body></Card><Button title={session ? 'Add birth details' : 'Sign in'} onPress={() => router.push(session ? '/onboarding' : '/auth')}/></>}
    {profileId && !result && !error && <Body>Reading your birth day…</Body>}
    {error && <Text accessibilityRole="alert" style={{ color: colors.ivory }}>{error}</Text>}
    {result && <>
      <PaperCard><Eyebrow>MOOLANK / {chart?.birth_profile.name ?? 'YOUR PROFILE'}</Eyebrow><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 88, lineHeight: 92, fontWeight: '700' }}>{result.number}</Text><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 27, fontWeight: '700' }}>{result.reading.title}</Text><Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 22 }}>Associated with {result.associated_planet} in this numerology convention.</Text></PaperCard>
      <Card><Eyebrow>HOW YOUR NUMBER WAS FOUND</Eyebrow><Text style={{ color: colors.ivory, fontFamily: 'Georgia', fontSize: 24 }}>{result.calculation.steps.join(' → ')}</Text><Body>{result.calculation.rule} Month, year, birth time, and chart placements do not enter this calculation.</Body></Card>
      {result.reading.entries.map(entry => <Card key={entry.heading}><Eyebrow>{entry.heading}</Eyebrow><Body>{entry.text}</Body></Card>)}
      <Body>{result.tradition_note}</Body>
    </>}
    <GhostButton title="Learn what Moolank means" onPress={() => router.push({ pathname: '/learn', params: { section: 'words' } })}/>
  </Page>;
}
