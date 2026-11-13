import React from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Sun } from 'lucide-react-native';
import { Body, Button, Divider, Eyebrow, Page, PaperCard, Title } from '../../src/ui';
import { colors } from '../../src/theme';
import { useChart } from '../../src/store';

export default function Today() { const { chart, session } = useChart(); return <Page><Eyebrow>ASTRA / TODAY</Eyebrow><Title>A moment to look inward.</Title><Body>{chart ? `Welcome back, ${chart.birth_profile.name}.` : 'Your personal sky starts with the details of your birth.'}</Body><Divider/><PaperCard style={{ minHeight: 260, justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.ink, fontWeight: '900', letterSpacing: 3, fontSize: 10 }}>YOUR DAILY SKY</Text><Sun color={colors.ink} size={26} strokeWidth={1}/></View><Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 31, fontWeight: '700', lineHeight: 38 }}>A good reading begins with a real chart.</Text><Text style={{ color: '#55554F', fontSize: 13, lineHeight: 20 }}>Personalised transits will appear once current positions and aspects are verified.</Text></PaperCard><Eyebrow>WHAT'S HERE NOW</Eyebrow><Body>Explore your Western and Vedic birth placements side by side. Each value links back to a calculation.</Body><Button title={chart ? 'Open your chart' : session ? 'Create your birth profile' : 'Begin with your birth details'} onPress={() => router.push(chart ? '/(tabs)/chart' : session ? '/onboarding' : '/auth')}/></Page>; }
