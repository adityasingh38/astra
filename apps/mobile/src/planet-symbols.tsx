import React from 'react';
import { Text, View } from 'react-native';
import { colors } from './theme';

export const planetSymbols: Record<string, string> = {
  Sun: '☉︎', Moon: '☾︎', Mercury: '☿︎', Venus: '♀︎', Mars: '♂︎',
  Jupiter: '♃︎', Saturn: '♄︎', Uranus: '♅︎', Neptune: '♆︎', Pluto: '♇︎',
  Rahu: '☊︎', Ketu: '☋︎',
};

export function PlanetIcon({ name, light = false }: { name: string; light?: boolean }) {
  return <View accessible accessibilityLabel={`${name} symbol`} style={{ width: 44, height: 44, borderRadius: 15, borderCurve: 'continuous', borderWidth: 1, borderColor: light ? '#BDB9AD' : '#55544E', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: light ? colors.ink : colors.ivory, fontSize: 28, lineHeight: 36, textAlign: 'center' }}>{planetSymbols[name] ?? '✦'}</Text>
  </View>;
}
