import React from 'react';
import { Redirect, router } from 'expo-router';
import { Body, Button, Card, Eyebrow, Page, Title } from '../src/ui';
import { Chart, useChart } from '../src/store';
import preview from '../src/preview-only-unverified.json';

export default function Preview() {
  const { setChart, setProfileId } = useChart();
  if (!__DEV__) return <Redirect href="/"/>;
  function openChart() { setProfileId(null); setChart(preview as unknown as Chart); router.push('/(tabs)/chart'); }
  return <Page><Eyebrow>DEVELOPMENT PREVIEW</Eyebrow><Title>Explore the chart layout.</Title><Card><Body>This fictional Greenwich profile was calculated locally for layout review. Swiss Ephemeris data files were unavailable, so the placements used a Moshier fallback and are unverified. No profile was saved and no AI reading can be generated from this preview.</Body></Card><Button title="View illustrative chart" onPress={openChart}/></Page>;
}
