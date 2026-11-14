import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, ChoiceChip, Divider, Eyebrow, GhostButton, Page, PaperCard, Title } from '../../src/ui';
import { apiFetch } from '../../src/api';
import { useChart } from '../../src/store';
import { colors } from '../../src/theme';
import { ReadingDisplay, ReadingResult } from '../../src/reading-display';

export default function Explore() {
  const { profileId } = useChart();
  const [lens, setLens] = useState<'western' | 'vedic'>('western');
  const [topic, setTopic] = useState<'identity' | 'love' | 'career'>('love');
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setResult(null); setError(''); }, [profileId]);
  async function generate() {
    if (!profileId) { setError('Add a birth profile first.'); return; }
    setBusy(true); setError('');
    try { setResult(await apiFetch<ReadingResult>(`/birth-profiles/${profileId}/readings`, { method: 'POST', body: JSON.stringify({ lens, topic }) })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Reading unavailable.'); }
    finally { setBusy(false); }
  }
  return <Page>
    <Eyebrow>ASTRA / EXPLORE</Eyebrow>
    <Title>Look closer.</Title>
    <Body>Choose a focus and a tradition. ASTRA gathers written passages for the placements in your calculated chart.</Body>
    <Divider/>
    <Eyebrow>01 / YOUR LENS</Eyebrow>
    <View style={{ flexDirection: 'row', gap: 8 }}>{(['western', 'vedic'] as const).map(value => <ChoiceChip key={value} label={value} selected={lens === value} onPress={() => { setLens(value); setResult(null); }}/>)}</View>
    <Eyebrow>02 / YOUR FOCUS</Eyebrow>
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{(['identity', 'love', 'career'] as const).map(value => <ChoiceChip key={value} label={value} selected={topic === value} onPress={() => { setTopic(value); setResult(null); }}/>)}</View>
    <PaperCard>
      <Text style={{ color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 28 }}>{topic === 'love' ? 'How you connect.' : topic === 'identity' ? 'Who you are becoming.' : 'What moves you forward.'}</Text>
      <Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 21 }}>{lens === 'western' ? 'Through the tropical zodiac and natal aspects.' : 'Through the sidereal zodiac and Jyotish principles.'}</Text>
    </PaperCard>
    <Button title={busy ? 'Reading…' : 'Read your chart'} onPress={() => void generate()} disabled={busy}/>
    <GhostButton title="Preview a sample reading" onPress={() => router.push('/reading-preview')}/>
    {error ? <Text accessibilityRole="alert" style={{ color: colors.ivory, borderLeftWidth: 2, borderColor: colors.paper, paddingLeft: 14 }}>{error}</Text> : null}
    {result && <ReadingDisplay result={result}/>}
    <Divider/><Eyebrow>MORE TO EXPLORE</Eyebrow>
    <PaperCard><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 27 }}>Your Moolank.</Text><Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 21 }}>A separate reading drawn from the day of your birth, with every calculation step shown.</Text></PaperCard>
    <Button title="Read your birth number" onPress={() => router.push('/moolank')}/>
    <GhostButton title="Learn the signs, planets and houses" onPress={() => router.push('/learn')}/>
  </Page>;
}
