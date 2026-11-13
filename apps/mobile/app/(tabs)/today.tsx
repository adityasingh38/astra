import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Body, Button, Divider, Eyebrow, Page, PaperCard, Title } from '../../src/ui';
import { colors } from '../../src/theme';
import { useChart } from '../../src/store';
import { apiFetch } from '../../src/api';

type Transit = { date_local: string; timezone: string; sample_time_utc: string; western: { natal_aspects: { first: string; second: string; aspect: string; orb: number }[] }; vedic: { moon: { sign: string; degree: number }; moon_nakshatra: { name: string; pada: number } }; method: string; warnings: string[] };
export default function Today() {
  const { chart, profileId, session } = useChart();
  const [data, setData] = useState<Transit | null>(null); const [error, setError] = useState('');
  useEffect(() => { let alive = true; setData(null); setError(''); if (profileId) apiFetch<Transit>(`/birth-profiles/${profileId}/transits`).then(value => { if (alive) setData(value); }).catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Transits unavailable'); }); return () => { alive = false; }; }, [profileId]);
  return <Page><Eyebrow>ASTRA / TODAY</Eyebrow><Title>A snapshot of your sky.</Title><Body>{chart ? `For ${chart.birth_profile.name}, using the selected profile’s local date.` : 'Your personal sky starts with your birth details.'}</Body><Divider/>
    {data ? <><PaperCard><Eyebrow>VEDIC / THE MOON</Eyebrow><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 30, fontWeight: '700' }}>{data.vedic.moon_nakshatra.name}</Text><Text style={{ color: colors.ink }}>Pada {data.vedic.moon_nakshatra.pada} · {data.vedic.moon.sign} {data.vedic.moon.degree.toFixed(1)}°</Text></PaperCard><Eyebrow>WESTERN / TRANSIT ASPECTS</Eyebrow>{data.western.natal_aspects.slice(0, 8).map((aspect, index) => <PaperCard key={index}><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 18 }}>Transit {aspect.first} {aspect.aspect} natal {aspect.second}</Text><Text style={{ color: colors.ink }}>Orb {aspect.orb.toFixed(2)}°</Text></PaperCard>)}{!data.western.natal_aspects.length && <Body>No close major aspects at the sampled moment.</Body>}<Body>{data.method}</Body>{data.warnings.map(warning => <Body key={warning}>{warning}</Body>)}</> : <PaperCard><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 24, fontWeight: '700' }}>{error || (profileId ? 'Calculating today’s sky…' : 'A good reading begins with a real chart.')}</Text></PaperCard>}
    <Button title={chart ? 'Open your chart' : session ? 'Create your birth profile' : 'Begin with your birth details'} onPress={() => router.push(chart ? '/(tabs)/chart' : session ? '/onboarding' : '/auth')}/></Page>;
}
