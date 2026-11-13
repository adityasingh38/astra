import React from 'react';
import { Heart } from 'lucide-react-native';
import { Body, Card, Divider, Eyebrow, Page, Title } from '../../src/ui';
import { colors } from '../../src/theme';

export default function Connections() { return <Page><Eyebrow>ASTRA / CONNECTIONS</Eyebrow><Title>The space between two skies.</Title><Body>Relationships deserve more than a single number. When this section opens, it will hold two calculated charts and two honest perspectives.</Body><Divider/><Card><Heart color={colors.ivory} size={27} strokeWidth={1}/><Eyebrow>COMING INTO VIEW</Eyebrow><Body>Western synastry and Vedic compatibility will be calculated from two consented birth profiles. No score or prediction appears without those inputs.</Body></Card></Page>; }
