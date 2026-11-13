import React from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { CircleDot, Moon, Sun } from 'lucide-react-native';
import { Body, Button, Divider, Eyebrow, Page, PaperCard, Title } from '../src/ui';
import { useChart } from '../src/store';
import { configured } from '../src/api';
import { colors } from '../src/theme';
import { AmbientSky } from '../src/sky-components';

export default function Welcome() { const { chart, session, loading } = useChart(); return <Page>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: colors.ivory, fontWeight: '900', letterSpacing: 7, fontSize: 16 }}>ASTRA</Text><CircleDot color={colors.ivory} size={25} strokeWidth={1}/></View>
  <Divider/><View style={{ height: 30 }}/><Eyebrow>A PERSONAL COSMOS / 01</Eyebrow>
  <Title>There is more than one way to read the sky.</Title>
  <Body>One birth. Two astrological traditions. A more complete picture of the person you are becoming.</Body>
  <AmbientSky/>
  <PaperCard>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Sun size={22} color={colors.ink} strokeWidth={1.3}/><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 21 }}>Western perspective</Text></View>
    <View style={{ height: 1, backgroundColor: '#C8C5BB' }}/>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Moon size={22} color={colors.ink} strokeWidth={1.3}/><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 21 }}>Vedic perspective</Text></View>
  </PaperCard>
  <Eyebrow>THE SAME PERSON. A DEEPER STORY.</Eyebrow>
  {loading ? <ActivityIndicator color={colors.ivory}/> : <Button editorial title={chart ? 'Open your chart' : session ? 'Enter your birth details' : 'Begin with your birth details'} onPress={() => router.push(chart ? '/(tabs)/chart' : session ? '/onboarding' : '/auth')}/>}
  {!configured ? <Body>Connect Supabase and the calculation API to create a private chart.</Body> : null}
  <Text style={{ color: colors.soft, fontSize: 12, lineHeight: 18 }}>Astrology offers symbolic reflection. Your chart facts are calculated, never invented.</Text>
</Page>; }
