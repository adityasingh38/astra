import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Card, ChoiceChip, Divider, Eyebrow, GhostButton, Page, PaperCard, Title } from '../src/ui';
import { colors } from '../src/theme';
import { glossary, houses, planets, signs } from '../src/learn-content';
import { useChart } from '../src/store';

type Section = 'start' | 'signs' | 'houses' | 'planets' | 'words';
const sections: { id: Section; label: string }[] = [
  { id: 'start', label: 'Start here' }, { id: 'signs', label: '12 signs' },
  { id: 'houses', label: '12 houses' }, { id: 'planets', label: 'Planets' }, { id: 'words', label: 'Glossary' },
];

export default function Learn() {
  const params = useLocalSearchParams<{ section?: string; sign?: string; house?: string }>();
  const { chart, profileId } = useChart();
  const [section, setSection] = useState<Section>(sections.find(item => item.id === params.section)?.id ?? 'start');
  const [selectedSign, setSelectedSign] = useState(signs.find(item => item.name === params.sign)?.name ?? 'Cancer');
  const [selectedHouse, setSelectedHouse] = useState(Number(params.house) >= 1 && Number(params.house) <= 12 ? Number(params.house) : 1);
  useEffect(() => { if (sections.some(item => item.id === params.section)) setSection(params.section as Section); if (signs.some(item => item.name === params.sign)) setSelectedSign(params.sign as string); if (Number(params.house) >= 1 && Number(params.house) <= 12) setSelectedHouse(Number(params.house)); }, [params.section, params.sign, params.house]);
  const sign = signs.find(item => item.name === selectedSign) ?? signs[3];
  const house = houses[selectedHouse - 1];
  return <Page>
    <Eyebrow>ASTRA / FIELD GUIDE</Eyebrow><Title>Read the language of the sky.</Title>
    <Body>Short explanations for the symbols you see in ASTRA. These are ways astrologers interpret a chart, offered for reflection.</Body><Divider/>
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{sections.map(item => <ChoiceChip key={item.id} label={item.label} selected={section === item.id} onPress={() => setSection(item.id)}/>)}</View>

    {section === 'start' && <>
      <PaperCard><Eyebrow>ONE PLACEMENT, THREE PARTS</Eyebrow><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 31, fontWeight: '700' }}>Sun in Cancer.</Text><Text style={{ color: colors.ink, fontSize: 15, lineHeight: 24 }}>In astrology, the Sun represents a theme of identity. Cancer adds a style of care and belonging. So this phrase invites you to consider how care relates to your sense of self. One placement never describes a whole person.</Text></PaperCard>
      <Card><Eyebrow>PLANET / WHAT</Eyebrow><Body>The planet names a theme. The Sun is linked with identity; Venus with affection; Mercury with thinking and speech.</Body></Card>
      <Card><Eyebrow>SIGN / HOW</Eyebrow><Body>The sign gives that theme a style. Cancer suggests care; Gemini suggests curiosity. Every sign can show up in anyone’s chart.</Body></Card>
      <Card><Eyebrow>HOUSE / WHERE</Eyebrow><Body>A house is one of twelve areas of life. A planet’s house adds context, such as relationships, home, or public work. Houses need an accurate birth time.</Body></Card>
      <Card><Eyebrow>WHY ASTRA HAS TWO LENSES</Eyebrow><Body>Western and Vedic astrology can place the same planet in different signs because ASTRA uses a tropical zodiac for the Western lens and a sidereal zodiac for the Vedic lens. Each calculation states its settings.</Body>{chart && <Body>Your Sun: Western {chart.western.positions.Sun.sign} · Vedic {chart.vedic.positions.Sun.sign}.</Body>}</Card>
      <GhostButton title="Explore every zodiac sign" onPress={() => setSection('signs')}/><GhostButton title="What are the twelve houses?" onPress={() => setSection('houses')}/>
    </>}

    {section === 'signs' && <>
      <Body>All twelve signs are styles used in chart interpretation. Fire, Earth, Air, and Water are elements; Cardinal, Fixed, and Mutable describe how a sign tends to start, sustain, or adapt.</Body>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{signs.map(item => <ChoiceChip key={item.name} label={`${item.glyph} ${item.name}`} selected={selectedSign === item.name} onPress={() => setSelectedSign(item.name)}/>)}</View>
      <PaperCard><Text style={{ color: colors.ink, fontSize: 50 }}>{sign.glyph}</Text><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 33, fontWeight: '700' }}>{sign.name}</Text><Text style={{ color: colors.ink, fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>{sign.element} / {sign.mode}</Text><Text style={{ color: colors.ink, fontSize: 16, lineHeight: 25 }}>{sign.idea}</Text><Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 22 }}>{sign.question}</Text></PaperCard>
      <Card><Eyebrow>WHAT DOES SUN IN {sign.name.toUpperCase()} MEAN?</Eyebrow><Body>The Sun is an identity theme. In {sign.name}, astrologers consider that theme through {sign.idea.toLowerCase()} This is one placement, not a complete description of a person.</Body></Card>
      {chart && <Card><Eyebrow>IN YOUR CHART</Eyebrow><Body>Western Sun: {chart.western.positions.Sun.sign}. Vedic Sun: {chart.vedic.positions.Sun.sign}. Other planets can be in other signs.</Body></Card>}
    </>}

    {section === 'houses' && <>
      <Body>Imagine a birth chart as a circle divided into twelve slices. Each house names an area of life. The sign on a house boundary and the planets inside it add detail. House boundaries depend on birth time and on the chosen house system.</Body>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{houses.map(item => <ChoiceChip key={item.number} label={String(item.number).padStart(2, '0')} selected={selectedHouse === item.number} onPress={() => setSelectedHouse(item.number)}/>)}</View>
      <PaperCard><Eyebrow>HOUSE {String(house.number).padStart(2, '0')} / 12</Eyebrow><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 32, fontWeight: '700' }}>{house.title}</Text><Text style={{ color: colors.ink, fontSize: 16, lineHeight: 25 }}>{house.area}</Text><Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 22 }}>{house.question}</Text></PaperCard>
      {chart && <Card><Eyebrow>IN YOUR CHART</Eyebrow>{chart.western.houses && chart.vedic.houses ? <Body>Western house {house.number} begins in {chart.western.houses.cusps[house.number - 1].sign}. Vedic whole-sign house {house.number} begins in {chart.vedic.houses.cusps[house.number - 1].sign}.</Body> : <Body>Your birth time is unknown, so ASTRA does not guess your houses.</Body>}</Card>}
    </>}

    {section === 'planets' && <><Body>In a chart, a planet names the theme being described. Its sign gives a style; its house can add an area of life.</Body>{planets.map(item => <Card key={item.name}><Eyebrow>{item.name}</Eyebrow><Body>{item.role}</Body></Card>)}</>}
    {section === 'words' && <><Body>A quick reference for terms ASTRA uses in charts and readings.</Body>{glossary.map(item => <Card key={item.term}><Eyebrow>{item.term}</Eyebrow><Body>{item.meaning}</Body></Card>)}</>}
    <Divider/><Eyebrow>READ FURTHER</Eyebrow>
    <GhostButton title="Astrodienst · Houses" onPress={() => void Linking.openURL('https://www.astro.com/astrowiki/en/House')}/>
    <GhostButton title="Astrodienst · Sun" onPress={() => void Linking.openURL('https://www.astro.com/astrowiki/en/Sun')}/>
    <GhostButton title="Kaala Panchang · Moolank" onPress={() => void Linking.openURL('https://www.kaalapanchang.com/mulank')}/>
    {profileId && <Button title="Read your Moolank" onPress={() => router.push('/moolank')}/>}
  </Page>;
}
