import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Line, Text as SvgText } from 'react-native-svg';
import { Position } from './store';
import { colors } from './theme';
import { radius } from './ui';

// Native adaptations of Forever Components' Twinkling Starfield and Orbiting
// Planet System. The source HTML/CSS/JS is not embedded in the mobile app.
const stars = Array.from({ length: 42 }, (_, i) => ({
  x: 14 + ((i * 97 + 31) % 332),
  y: 10 + ((i * 59 + 17) % 174),
  r: i % 7 === 0 ? 1.6 : i % 3 === 0 ? 1.05 : 0.65,
}));

export function AmbientSky() {
  const reduceMotion = useReducedMotion();
  const glow = useSharedValue(0.55);
  useEffect(() => {
    if (reduceMotion) { glow.set(0.55); return; }
    glow.set(withRepeat(withTiming(0.85, { duration: 2200, easing: Easing.bezier(0.77, 0, 0.175, 1) }), -1, true));
    return () => cancelAnimation(glow);
  }, [glow, reduceMotion]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() }));
  return <View accessible={false} style={{ height: 190, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.panel, borderCurve: 'continuous', backgroundColor: '#111110' }}>
    <Svg width="100%" height="100%" viewBox="0 0 360 190" preserveAspectRatio="xMidYMid slice">
      {stars.map((s, i) => <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={colors.ivory} opacity={0.2 + (i % 5) * 0.1}/>)}
      <Ellipse cx="180" cy="95" rx="103" ry="46" stroke="#5D5C57" strokeWidth="0.8" fill="none" transform="rotate(-21 180 95)"/>
      <Ellipse cx="180" cy="95" rx="76" ry="69" stroke="#363634" strokeWidth="0.8" fill="none" transform="rotate(23 180 95)"/>
      <Circle cx="180" cy="95" r="25" fill="#D7D1BE" opacity="0.08"/>
      <Circle cx="180" cy="95" r="10" fill={colors.paper}/>
      <Circle cx="83" cy="117" r="5" fill={colors.paper}/>
      <Circle cx="251" cy="53" r="3.5" fill="#C1BCAD"/>
      <Circle cx="215" cy="158" r="3" fill="#9E9B91"/>
    </Svg>
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, glowStyle]}>
      <Svg width="100%" height="100%" viewBox="0 0 360 190" preserveAspectRatio="xMidYMid slice">
        {[stars[3], stars[14], stars[26], stars[37]].map((s, i) => <G key={i}><Line x1={s.x - 4} x2={s.x + 4} y1={s.y} y2={s.y} stroke={colors.ivory} strokeWidth="0.7"/><Line x1={s.x} x2={s.x} y1={s.y - 4} y2={s.y + 4} stroke={colors.ivory} strokeWidth="0.7"/></G>)}
      </Svg>
    </Animated.View>
  </View>;
}

const planets = [['Sun', 'SU'], ['Moon', 'MO'], ['Mercury', 'ME'], ['Venus', 'VE'], ['Mars', 'MA'], ['Jupiter', 'JU'], ['Saturn', 'SA']] as const;

export function NatalOrbit({ positions }: { positions: Record<string, Position> }) {
  return <View style={{ backgroundColor: '#111110', borderWidth: 1, borderColor: colors.border, borderRadius: radius.panel, borderCurve: 'continuous', overflow: 'hidden', padding: 12 }}>
    <Svg width="100%" height={286} viewBox="0 0 320 286" accessibilityLabel="Natal orbit showing calculated planetary longitudes">
      <Circle cx="160" cy="143" r="118" stroke="#4E4D48" strokeWidth="1" fill="none"/>
      <Circle cx="160" cy="143" r="94" stroke="#343431" strokeWidth="1" fill="none"/>
      <Circle cx="160" cy="143" r="39" stroke="#77746B" strokeWidth="1" fill="none"/>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <Line key={i} x1={160 + 100 * Math.cos(a)} y1={143 + 100 * Math.sin(a)} x2={160 + 118 * Math.cos(a)} y2={143 + 118 * Math.sin(a)} stroke="#77746B" strokeWidth="1"/>;
      })}
      <Circle cx="160" cy="143" r="5" fill={colors.paper}/>
      {planets.map(([name, short], index) => {
        const longitude = positions[name]?.longitude;
        if (typeof longitude !== 'number') return null;
        const a = (longitude - 90) * Math.PI / 180;
        const radius = index % 2 ? 78 : 66;
        const x = 160 + radius * Math.cos(a), y = 143 + radius * Math.sin(a);
        return <G key={name}>
          <Line x1="160" y1="143" x2={x} y2={y} stroke="#77746B" opacity="0.5" strokeWidth="0.7"/>
          <Circle cx={x} cy={y} r="12" fill={index < 2 ? colors.paper : '#2C2C29'} stroke={colors.paper} strokeWidth="0.8"/>
          <SvgText x={x} y={y + 3} fontSize="7" fontWeight="700" textAnchor="middle" fill={index < 2 ? colors.ink : colors.ivory}>{short}</SvgText>
        </G>;
      })}
    </Svg>
  </View>;
}
