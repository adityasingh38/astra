import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleDot } from 'lucide-react-native';
import { Body, Button, Card, Divider, Eyebrow, GhostButton, Page, PaperCard, SectionHeading, Title } from '../../src/ui';
import { colors } from '../../src/theme';
import { Lens, useChart } from '../../src/store';
import { NatalOrbit } from '../../src/sky-components';
import { signs } from '../../src/learn-content';
import { PlanetIcon, planetSymbols } from '../../src/planet-symbols';

function SignRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return <View style={{ paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderColor: '#C9C6BD', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 14 }}>
    <Text style={{ color: colors.ink, fontSize: 12, letterSpacing: 2, fontWeight: '800', textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 22, textAlign: 'right', flexShrink: 1 }}>{value}</Text>
  </View>;
}

function LensSummary({ lens, system }: { lens: Lens; system: 'western' | 'vedic' }) {
  const sun = lens.positions.Sun, moon = lens.positions.Moon;
  return <PaperCard style={{ gap: 10 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: colors.ink, fontSize: 10, letterSpacing: 2.6, fontWeight: '900' }}>{system === 'western' ? 'THE BIG THREE' : 'JYOTISH FOUNDATION'}</Text>
      <CircleDot color={colors.ink} size={27} strokeWidth={1}/>
    </View>
    <Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', marginVertical: 8 }}>{system === 'western' ? 'Your Western lens' : 'Your Vedic lens'}</Text>
    <SignRow label="Sun" value={`${sun.sign} ${sun.degree.toFixed(1)}°`}/>
    <SignRow label="Moon" value={`${moon.sign} ${moon.degree.toFixed(1)}°`}/>
    <SignRow label={system === 'western' ? 'Rising' : 'Lagna'} value={lens.houses ? `${lens.houses.ascendant.sign} ${lens.houses.ascendant.degree.toFixed(1)}°` : 'Time unavailable'} last={system === 'western'}/>
    {system === 'vedic' && <SignRow label="Nakshatra" value={`${lens.moon_nakshatra?.name ?? 'Unknown'} · pada ${lens.moon_nakshatra?.pada ?? '—'}`} last/>}
  </PaperCard>;
}

function DarkRow({ left, right, planet }: { left: string; right: string; planet?: string }) {
  return <View style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>{planet && planetSymbols[planet] && <PlanetIcon name={planet}/>}<Text style={{ color: colors.ivory, fontSize: 15, fontWeight: '700' }}>{left}</Text></View>
    <Text style={{ color: colors.muted, fontSize: 15, textAlign: 'right', flexShrink: 1 }}>{right}</Text>
  </View>;
}

export default function ChartScreen() {
  const params = useLocalSearchParams<{ lens?: string; body?: string }>();
  const { chart, session } = useChart();
  const [system, setSystem] = useState<'western' | 'vedic'>(params.lens === 'vedic' ? 'vedic' : 'western');
  const [showMethod, setShowMethod] = useState(false);
  useEffect(() => { if (params.lens === 'western' || params.lens === 'vedic') setSystem(params.lens); }, [params.lens]);
  if (!chart) return <Page><Eyebrow>YOUR NATAL ATLAS</Eyebrow><Title>Your sky begins with a birth profile.</Title><Body>Enter your birth details to see both astrological lenses.</Body><Button title={session ? 'Add birth details' : 'Sign in'} onPress={() => router.push(session ? '/onboarding' : '/auth')}/><GhostButton title="Learn signs, planets and houses" onPress={() => router.push('/learn')}/></Page>;
  const lens = chart[system];
  const focusedPosition = params.body ? lens.positions[params.body] : null;
  const focusedSign = signs.find(item => item.name === focusedPosition?.sign);
  return <Page>
    <Eyebrow>ASTRA / NATAL ATLAS</Eyebrow>
    <Title>{chart.birth_profile.name}, in the stars.</Title>
    <Body>{chart.birth_profile.place_label} · {chart.birth_profile.birth_date}</Body>
    <Divider/>
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: colors.border, padding: 4, borderRadius: 17, borderCurve: 'continuous' }}>
      {(['western', 'vedic'] as const).map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: system === value }} onPress={() => setSystem(value)} style={{ flex: 1, minHeight: 43, justifyContent: 'center', alignItems: 'center', backgroundColor: system === value ? colors.paper : colors.background, borderRadius: 13, borderCurve: 'continuous' }}>
        <Text style={{ color: system === value ? colors.ink : colors.muted, fontSize: 12, letterSpacing: 1.8, fontWeight: '800', textTransform: 'uppercase' }}>{value}</Text>
      </Pressable>)}
    </View>
    {focusedPosition && <><PaperCard style={{ gap: 12 }}>
      <Text style={{ color: colors.ink, fontSize: 11, fontWeight: '900', letterSpacing: 2 }}>FOCUS FROM YOUR READING</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><PlanetIcon name={params.body!} light/><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', flexShrink: 1 }}>{params.body} in {focusedPosition.sign}</Text></View>
      <Text style={{ color: colors.ink, fontSize: 15, lineHeight: 23 }}>{focusedPosition.degree.toFixed(2)}° in {focusedPosition.sign} · {lens.zodiac} zodiac{focusedPosition.retrograde ? ' · retrograde' : ''}</Text>
      {focusedSign && <Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 22 }}>{focusedSign.idea}</Text>}
    </PaperCard>
    {focusedSign && <GhostButton title={`Learn about ${focusedSign.name}`} onPress={() => router.push({ pathname: '/learn', params: { section: 'signs', sign: focusedSign.name } })}/>}</>}
    <SectionHeading>YOUR NATAL ORBIT</SectionHeading>
    <NatalOrbit positions={lens.positions}/>
    <Text style={{ color: colors.soft, fontSize: 11, lineHeight: 17 }}>Planet markers use the calculated longitudes shown below. Positions share the same lens selected above.</Text>
    <LensSummary lens={lens} system={system}/>
    <GhostButton title={`Learn about ${lens.positions.Sun.sign}`} onPress={() => router.push({ pathname: '/learn', params: { section: 'signs', sign: lens.positions.Sun.sign } })}/>
    <SectionHeading>PLANETARY POSITIONS</SectionHeading>
    <View>{Object.entries(lens.positions).map(([name, position]) => <DarkRow key={name} planet={name} left={`${name}${position.retrograde ? ' ℞' : ''}`} right={`${position.sign} ${position.degree.toFixed(2)}°`}/>)}</View>
    {system === 'western' && <><Eyebrow>MAJOR ASPECTS</Eyebrow><View>{lens.aspects?.slice(0, 12).map((a, i) => <DarkRow key={i} left={`${a.first} · ${a.second}`} right={`${a.aspect} / ${a.orb.toFixed(2)}°`}/>)}</View></>}
    {system === 'vedic' && lens.mahadashas && <><Eyebrow>VIMSHOTTARI / MAHADASHA</Eyebrow><View>{lens.mahadashas.slice(0, 5).map((p, i) => <DarkRow key={i} left={p.ruler} right={`${p.start_utc.slice(0, 10)} → ${p.end_utc.slice(0, 10)}`}/>)}</View></>}
    {system === 'vedic' && lens.divisional && <><Eyebrow>DIVISIONAL CHARTS</Eyebrow><Card>{(['D9', 'D10'] as const).map(key => <View key={key} style={{ gap: 7 }}><Text style={{ color: colors.ivory, fontFamily: 'Georgia', fontSize: 23 }}>{key} / {key === 'D9' ? 'Navamsa' : 'Dashamsha'}</Text><Body>Ascendant: {lens.divisional?.[key].ascendant?.sign ?? 'Unavailable without exact time'} · Venus: {lens.divisional?.[key].positions.Venus.sign}</Body></View>)}<Body>These divisions are sensitive to birth time accuracy.</Body></Card></>}
    <GhostButton title="What are houses?" onPress={() => router.push({ pathname: '/learn', params: { section: 'houses' } })}/>
    <GhostButton title={showMethod ? 'Hide calculation details' : 'Why am I seeing this?'} onPress={() => setShowMethod(!showMethod)}/>
    {showMethod && <Card><Body>{lens.zodiac} zodiac · {lens.house_system} houses · {lens.metadata.node_mode} lunar node</Body><Body>Calculated for {lens.metadata.birth_utc} with Swiss Ephemeris {lens.metadata.ephemeris_version}.</Body><Body>Ephemeris flags: {JSON.stringify(lens.metadata.actual_ephemeris_flags)}</Body></Card>}
    {lens.warnings.map((warning, i) => <View key={i} style={{ borderLeftWidth: 2, borderColor: colors.paper, paddingLeft: 14 }}><Body>{warning}</Body></View>)}
  </Page>;
}
