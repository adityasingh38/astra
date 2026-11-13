import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Card, ChoiceChip, Divider, Eyebrow, Page, Title } from '../../src/ui';
import { colors } from '../../src/theme';
import { useChart } from '../../src/store';
import { apiFetch } from '../../src/api';

type Comparison = { profiles: string[]; western: { synastry_aspects: { first: string; second: string; aspect: string; orb: number }[] }; vedic: { moon_nakshatras: { name: string; pada: number }[] | null; moon_signs: string[] | null; d9_venus_signs: string[] }; method: string; warnings: string[] };
export default function Connections() {
  const { profileId, profiles } = useChart(); const [other, setOther] = useState(''); const [data, setData] = useState<Comparison | null>(null); const [error, setError] = useState('');
  useEffect(() => { setData(null); setOther(''); }, [profileId]);
  async function compare(id: string) { setOther(id); setData(null); setError(''); try { setData(await apiFetch<Comparison>(`/birth-profiles/${profileId}/connections/${id}`)); } catch (e) { setError(e instanceof Error ? e.message : 'Comparison unavailable'); } }
  return <Page><Eyebrow>ASTRA / CONNECTIONS</Eyebrow><Title>The space between two skies.</Title><Body>Compare two birth profiles saved under your account. Ask the other person before storing their birth details.</Body><Divider/>
    {profiles.filter(profile => profile.id !== profileId).map(profile => <ChoiceChip key={profile.id} label={profile.preferred_name} selected={other === profile.id} onPress={() => void compare(profile.id)}/>)}
    {profiles.length < 2 && <><Card><Eyebrow>BEGIN WITH TWO PROFILES</Eyebrow><Body>Add another person’s details with their permission to see calculated synastry and Vedic placements.</Body></Card><Button title="Add a birth profile" onPress={() => router.push('/onboarding')}/></>}
    {error ? <Body>{error}</Body> : null}
    {data ? <><Card><Eyebrow>VEDIC PERSPECTIVE</Eyebrow>{data.vedic.moon_nakshatras && <Body>Moon nakshatras: {data.vedic.moon_nakshatras.map(star => `${star.name} pada ${star.pada}`).join(' · ')}</Body>}<Body>D9 Venus signs: {data.vedic.d9_venus_signs.join(' · ')}</Body></Card><Eyebrow>WESTERN SYNASTRY</Eyebrow>{data.western.synastry_aspects.slice(0, 12).map((aspect, index) => <Card key={index}><Text style={{ color: colors.ivory, fontFamily: 'Georgia', fontSize: 18 }}>{data.profiles[0]}’s {aspect.first} {aspect.aspect} {data.profiles[1]}’s {aspect.second}</Text><Body>Orb {aspect.orb.toFixed(2)}°</Body></Card>)}{!data.western.synastry_aspects.length && <Body>No close major aspects among the selected planets.</Body>}<Body>{data.method}</Body>{data.warnings.map(warning => <Body key={warning}>{warning}</Body>)}</> : null}</Page>;
}
