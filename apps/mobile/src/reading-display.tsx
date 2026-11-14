import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { Body, Card, Divider, Eyebrow, GhostButton, PaperCard } from './ui';
import { colors } from './theme';
import { planets, signs } from './learn-content';
import { PlanetIcon, planetSymbols } from './planet-symbols';

export type ReadingResult = {
  reading: { title: string; entries: { heading: string; text: string; fact_ids: string[]; passage_ids: string[] }[] };
  facts: Record<string, string>;
  lens: string;
  topic: string;
  source: 'astra_catalog';
  catalog_version: string;
};

const topicLabels: Record<string, [string, string]> = {
  love: ['LOVE & RELATIONSHIPS', 'How you connect.'],
  identity: ['IDENTITY', 'Who you are becoming.'],
  career: ['WORK & PURPOSE', 'What moves you forward.'],
};

export function ReadingHero({ topic, lens }: { topic: string; lens: string }) {
  const [label, title] = topicLabels[topic] ?? topicLabels.identity;
  return <PaperCard>
    <View style={{ alignSelf: 'flex-start', backgroundColor: colors.ink, borderRadius: 11, borderCurve: 'continuous', paddingHorizontal: 12, paddingVertical: 9 }}>
      <Text style={{ color: colors.ivory, fontSize: 12, fontWeight: '900', letterSpacing: 2.2 }}>{label}</Text>
    </View>
    <Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 30, fontWeight: '700' }}>{title}</Text>
    <Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 21 }}>{lens === 'western' ? 'Western perspective · tropical zodiac' : 'Vedic perspective · sidereal zodiac'}</Text>
  </PaperCard>;
}

export function ReadingDisplay({ result, illustrative = false }: { result: ReadingResult; illustrative?: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  useEffect(() => setExpanded(null), [result]);
  return <>
    <Eyebrow>ASTRA COLLECTION / {result.lens.toUpperCase()} / {result.topic.toUpperCase()}</Eyebrow>
    <Text style={{ color: colors.ivory, fontSize: 30, fontFamily: 'Georgia', fontWeight: '700' }}>{result.reading.title}</Text>
    {result.reading.entries.map((entry, index) => {
      const bodies = Object.keys(planetSymbols).filter(name => entry.heading.includes(name));
      const body = bodies[0];
      const signId = entry.passage_ids.find(id => id.startsWith('sign.') || id.startsWith('d9.venus.'));
      const sign = signs.find(item => item.name.toLowerCase() === signId?.split('.').at(-1));
      const isAspect = entry.passage_ids.some(id => id.startsWith('aspect.'));
      const isD9 = entry.passage_ids.some(id => id.startsWith('d9.'));
      const isOpen = expanded === index;
      return <Card key={`${entry.heading}-${index}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <View style={{ flexDirection: 'row', gap: 5 }}>{bodies.map(name => <PlanetIcon key={name} name={name}/>)}</View>
          <Eyebrow>{entry.heading}</Eyebrow>
        </View>
        <Body>{entry.text}</Body><Divider/>
        {entry.fact_ids.map(id => <Text key={id} style={{ color: colors.gold, fontSize: 12, lineHeight: 19 }}>{result.facts[id]}</Text>)}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setExpanded(isOpen ? null : index)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 }}>
          <Text style={{ color: colors.ivory, fontSize: 13, fontWeight: '700' }}>{isOpen ? 'Show less' : 'Why this passage?'}</Text>
          <ChevronDown size={18} color={colors.ivory} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}/>
        </Pressable>
        {isOpen && <View style={{ gap: 12 }}>
          <Body>{isD9 ? 'This passage uses the Venus sign in the D9 Navamsa, a Jyotish divisional chart calculated when the birth time is known.' : isAspect ? 'This passage uses the closest aspect between the planets featured in this reading. An aspect describes their angular relationship.' : `${illustrative ? 'This fictional chart pairs' : 'ASTRA pairs'} an authored ${body ?? 'planet'} theme with an authored ${sign?.name ?? 'sign'} passage for the ${result.lens} lens.`}</Body>
          {bodies.map(name => <View key={name} style={{ gap: 7 }}><Eyebrow>{name.toUpperCase()} / THEME</Eyebrow><Body>{planets.find(item => item.name === name)?.role}</Body></View>)}
          {sign && <><Eyebrow>{sign.name.toUpperCase()} / SIGN</Eyebrow><Body>{sign.idea}</Body><GhostButton title={`Explore ${sign.name} in the guide`} onPress={() => router.push({ pathname: '/learn', params: { section: 'signs', sign: sign.name } })}/></>}
          {!sign && <GhostButton title="Explore chart terms in the guide" onPress={() => router.push({ pathname: '/learn', params: { section: 'words' } })}/>}
          {!illustrative && <GhostButton title={isAspect || isD9 ? 'View your full chart' : `View ${body} in your chart`} onPress={() => router.push({ pathname: '/(tabs)/chart', params: { lens: result.lens, ...(isAspect || isD9 || !body ? {} : { body }) } })}/>}
        </View>}
      </Card>;
    })}
    <Body>{illustrative ? 'Illustrative placements only. The passages are written in ASTRA; your own reading uses your calculated chart.' : 'Written in ASTRA and selected from your calculated chart. Symbolic reflection, not a prediction.'}</Body>
  </>;
}
