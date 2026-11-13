import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, ChoiceChip, Divider, Eyebrow, Page, PaperCard, Title } from '../../src/ui';
import { apiFetch } from '../../src/api';
import { useChart } from '../../src/store';
import { colors } from '../../src/theme';

type Result = { reading: { title: string; sentences: { text: string; fact_ids: string[] }[] }; facts: Record<string, string>; lens: string; topic: string; source: 'local_editorial' | 'openai' };

export default function Explore() {
  const { profileId } = useChart();
  const [lens, setLens] = useState<'western' | 'vedic'>('western');
  const [topic, setTopic] = useState<'identity' | 'love' | 'career'>('love');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function generate() {
    if (!profileId) { setError('Add a birth profile first.'); return; }
    setBusy(true); setError('');
    try { setResult(await apiFetch<Result>(`/birth-profiles/${profileId}/readings`, { method: 'POST', body: JSON.stringify({ lens, topic }) })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Reading unavailable.'); }
    finally { setBusy(false); }
  }
  return <Page>
    <Eyebrow>ASTRA / EXPLORE</Eyebrow>
    <Title>Look closer.</Title>
    <Body>Pick a question and a tradition. Locally written reflections are free, and each one stays connected to calculated chart facts.</Body>
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
    {error ? <Text accessibilityRole="alert" style={{ color: colors.ivory, borderLeftWidth: 2, borderColor: colors.paper, paddingLeft: 14 }}>{error}</Text> : null}
    {result && <Card><Eyebrow>{result.lens.toUpperCase()} / {result.topic.toUpperCase()}</Eyebrow><Text style={{ color: colors.ivory, fontSize: 28, fontFamily: 'Georgia' }}>{result.reading.title}</Text><Divider/>{result.reading.sentences.map((sentence, i) => <View key={i} style={{ gap: 7 }}><Body>{sentence.text}</Body>{sentence.fact_ids.map(id => <Text key={id} style={{ color: colors.gold, fontSize: 12 }}>{result.facts[id]}</Text>)}</View>)}<Body>{result.source === 'local_editorial' ? 'Written reflection from calculated facts. No AI service or payment used.' : 'AI assisted reflection from calculated facts.'} Symbolic interpretation, not a prediction.</Body></Card>}
  </Page>;
}
