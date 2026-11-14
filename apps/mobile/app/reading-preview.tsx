import React from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Body, Divider, Eyebrow, GhostButton, Page, PaperCard, Title } from '../src/ui';
import { colors } from '../src/theme';
import { ReadingDisplay, ReadingResult } from '../src/reading-display';

const sample: ReadingResult = {
  reading: {
    title: 'Ways of connecting',
    entries: [
      { heading: 'Venus', text: 'This placement offers a lens on affection and what feels appealing. Steady affection can be reassuring. Notice how small, repeated acts build trust.', fact_ids: ['venus'], passage_ids: ['western.love.venus', 'sign.love.taurus'] },
      { heading: 'Mars', text: "This placement invites reflection on desire, initiative, and the way you act. Directness may bring energy to connection. Make room for the other person's pace too.", fact_ids: ['mars'], passage_ids: ['western.love.mars', 'sign.love.aries'] },
      { heading: 'Moon', text: 'This placement brings emotional needs into the conversation. Conversation may be part of closeness. Ask questions that leave room for a surprising answer.', fact_ids: ['moon'], passage_ids: ['western.love.moon', 'sign.love.gemini'] },
    ],
  },
  facts: {
    venus: 'Illustrative chart fact · Venus in Taurus',
    mars: 'Illustrative chart fact · Mars in Aries',
    moon: 'Illustrative chart fact · Moon in Gemini',
  },
  lens: 'western', topic: 'love', source: 'astra_catalog', catalog_version: '1.0',
};

export default function ReadingPreview() {
  return <Page>
    <Eyebrow>ASTRA / SAMPLE READING</Eyebrow>
    <Title>A closer look at connection.</Title>
    <Body>This preview uses fictional chart placements to show how ASTRA's written passages appear. It is not a reading about you.</Body>
    <Divider/>
    <PaperCard>
      <Eyebrow>LOVE & RELATIONSHIPS</Eyebrow>
      <Text style={{ color: colors.ink, fontFamily: 'Georgia', fontSize: 30, fontWeight: '700' }}>How you connect.</Text>
      <Text style={{ color: '#4A4A46', fontSize: 14, lineHeight: 21 }}>Western perspective · tropical zodiac</Text>
    </PaperCard>
    <ReadingDisplay result={sample} illustrative/>
    <GhostButton title="Explore your own chart" onPress={() => router.push('/(tabs)/explore')}/>
  </Page>;
}
