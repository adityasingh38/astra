import React from 'react';
import { Text } from 'react-native';
import { Body, Card, Divider, Eyebrow } from './ui';
import { colors } from './theme';

export type ReadingResult = {
  reading: { title: string; entries: { heading: string; text: string; fact_ids: string[]; passage_ids: string[] }[] };
  facts: Record<string, string>;
  lens: string;
  topic: string;
  source: 'astra_catalog';
  catalog_version: string;
};

export function ReadingDisplay({ result, illustrative = false }: { result: ReadingResult; illustrative?: boolean }) {
  return <>
    <Eyebrow>ASTRA COLLECTION / {result.lens.toUpperCase()} / {result.topic.toUpperCase()}</Eyebrow>
    <Text style={{ color: colors.ivory, fontSize: 30, fontFamily: 'Georgia', fontWeight: '700' }}>{result.reading.title}</Text>
    {result.reading.entries.map((entry, index) => <Card key={`${entry.heading}-${index}`}>
      <Eyebrow>{entry.heading}</Eyebrow><Body>{entry.text}</Body><Divider/>
      {entry.fact_ids.map(id => <Text key={id} style={{ color: colors.gold, fontSize: 12 }}>{result.facts[id]}</Text>)}
    </Card>)}
    <Body>{illustrative ? 'Illustrative placements only. The passages are written in ASTRA; your own reading uses your calculated chart.' : 'Written in ASTRA and selected from your calculated chart. Symbolic reflection, not a prediction.'}</Body>
  </>;
}
