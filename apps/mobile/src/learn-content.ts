export type SignGuide = { name: string; glyph: string; element: string; mode: string; idea: string; question: string };
export const signs: SignGuide[] = [
  { name: 'Aries', glyph: '♈︎', element: 'Fire', mode: 'Cardinal', idea: 'Beginnings, initiative, and direct action.', question: 'Where is a clear first step useful?' },
  { name: 'Taurus', glyph: '♉︎', element: 'Earth', mode: 'Fixed', idea: 'Steadiness, resources, and what endures.', question: 'What is worth tending patiently?' },
  { name: 'Gemini', glyph: '♊︎', element: 'Air', mode: 'Mutable', idea: 'Questions, exchange, and learning.', question: 'What changes when you ask more?' },
  { name: 'Cancer', glyph: '♋︎', element: 'Water', mode: 'Cardinal', idea: 'Care, belonging, and emotional protection.', question: 'Where does care need a boundary?' },
  { name: 'Leo', glyph: '♌︎', element: 'Fire', mode: 'Fixed', idea: 'Creative expression, warmth, and visibility.', question: 'What do you want to make or share?' },
  { name: 'Virgo', glyph: '♍︎', element: 'Earth', mode: 'Mutable', idea: 'Attention, craft, and practical improvement.', question: 'Which detail deserves your care?' },
  { name: 'Libra', glyph: '♎︎', element: 'Air', mode: 'Cardinal', idea: 'Dialogue, balance, and mutual consideration.', question: 'How can both voices be heard?' },
  { name: 'Scorpio', glyph: '♏︎', element: 'Water', mode: 'Fixed', idea: 'Depth, privacy, and trust.', question: 'What becomes clearer with honesty?' },
  { name: 'Sagittarius', glyph: '♐︎', element: 'Fire', mode: 'Mutable', idea: 'Exploration, perspective, and meaning.', question: 'What wider view might help?' },
  { name: 'Capricorn', glyph: '♑︎', element: 'Earth', mode: 'Cardinal', idea: 'Structure, commitment, and long effort.', question: 'What can you build steadily?' },
  { name: 'Aquarius', glyph: '♒︎', element: 'Air', mode: 'Fixed', idea: 'Independent thought, community, and change.', question: 'Which assumption could be rethought?' },
  { name: 'Pisces', glyph: '♓︎', element: 'Water', mode: 'Mutable', idea: 'Imagination, sensitivity, and connection.', question: 'What needs both softness and clarity?' },
];

export type HouseGuide = { number: number; title: string; area: string; question: string };
export const houses: HouseGuide[] = [
  { number: 1, title: 'Self', area: 'How you meet the world; the Ascendant begins here.', question: 'How do you enter a new situation?' },
  { number: 2, title: 'Resources', area: 'Possessions, money, and what you value.', question: 'What helps you feel resourced?' },
  { number: 3, title: 'Learning', area: 'Everyday communication, study, and nearby life.', question: 'How do you exchange ideas?' },
  { number: 4, title: 'Home', area: 'Home, roots, family, and private foundations.', question: 'What makes a place feel like home?' },
  { number: 5, title: 'Creativity', area: 'Play, self-expression, pleasure, and romance.', question: 'Where do you make room for joy?' },
  { number: 6, title: 'Daily life', area: 'Routines, work habits, and care of the body.', question: 'Which small habit supports you?' },
  { number: 7, title: 'Partnership', area: 'One-to-one relationships and agreements.', question: 'How do you meet another person as an equal?' },
  { number: 8, title: 'Shared life', area: 'Shared resources, trust, and change.', question: 'What do you share or hold together?' },
  { number: 9, title: 'Perspective', area: 'Beliefs, higher study, and distant journeys.', question: 'What broadens your view?' },
  { number: 10, title: 'Public life', area: 'Vocation, reputation, and visible aims.', question: 'What work would you stand behind?' },
  { number: 11, title: 'Community', area: 'Friends, groups, and collective hopes.', question: 'Who helps you imagine a future?' },
  { number: 12, title: 'Inner life', area: 'Solitude, retreat, and what happens out of view.', question: 'Where do you need quiet?' },
];

export const planets = [
  { name: 'Sun', role: 'Identity, purpose, and creative expression.' },
  { name: 'Moon', role: 'Emotional needs, habits, and inner rhythm.' },
  { name: 'Mercury', role: 'Thinking, language, and learning.' },
  { name: 'Venus', role: 'Affection, pleasure, and values.' },
  { name: 'Mars', role: 'Action, drive, and assertion.' },
  { name: 'Jupiter', role: 'Growth, learning, and meaning.' },
  { name: 'Saturn', role: 'Structure, limits, and responsibility.' },
  { name: 'Uranus', role: 'Change and independence in modern Western astrology.' },
  { name: 'Neptune', role: 'Imagination and ideals in modern Western astrology.' },
  { name: 'Pluto', role: 'Power and transformation in modern Western astrology.' },
  { name: 'Rahu / Ketu', role: 'Opposite lunar nodes used in Jyotish; mathematical chart points rather than planets.' },
];

export const glossary = [
  { term: 'Ascendant / Lagna', meaning: 'The sign rising on the eastern horizon at birth. It depends strongly on an accurate birth time.' },
  { term: 'Aspect', meaning: 'A chosen angular relationship between two chart positions. ASTRA lists the angle and how close it is to exact.' },
  { term: 'Retrograde', meaning: 'A planet appears to move backward against the zodiac from Earth for a period. It does not physically reverse its orbit.' },
  { term: 'Tropical / sidereal', meaning: 'Western tropical signs follow the seasonal zodiac. ASTRA’s Vedic lens uses a sidereal zodiac with a named ayanamsa, so a sign may differ.' },
  { term: 'Nakshatra', meaning: 'One of 27 equal sectors of the sidereal zodiac. ASTRA calculates the Moon’s sector and quarter, called pada.' },
  { term: 'Navamsa / D9', meaning: 'A ninefold sign division used in Jyotish. Its ascendant is especially sensitive to birth-time accuracy.' },
  { term: 'Dasha', meaning: 'A sequence of named periods in Jyotish. ASTRA shows its calculation convention and dates; it is not a prediction of events.' },
  { term: 'Moolank', meaning: 'A popular Indian numerology birth number made from the day of the month. It is separate from an astronomical birth chart.' },
];
