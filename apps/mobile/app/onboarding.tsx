import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Button, Card, ChoiceChip, Divider, Eyebrow, FormField, GhostButton, Page, Title } from '../src/ui';
import { colors } from '../src/theme';
import { Chart, useChart } from '../src/store';
import { apiFetch } from '../src/api';

const Field = FormField;

export default function Onboarding() {
  const { setChart, setProfileId, profiles, refresh } = useChart();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const [name, setName] = useState(''); const [date, setDate] = useState(''); const [time, setTime] = useState('');
  const [unknown, setUnknown] = useState(false); const [place, setPlace] = useState(''); const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [timezone, setTimezone] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [fold, setFold] = useState<0 | 1 | null>(null);
  const [permission, setPermission] = useState(false);
  const [places, setPlaces] = useState<{ label: string; latitude: number; longitude: number; timezone: string | null }[]>([]);
  useEffect(() => { const profile = profiles.find(row => row.id === edit); if (!profile) return; setName(profile.preferred_name); setDate(profile.birth_date); setTime(profile.birth_time?.slice(0, 5) ?? ''); setUnknown(!profile.time_known); setPlace(profile.place_label); setLatitude(String(profile.latitude)); setLongitude(String(profile.longitude)); setTimezone(profile.timezone_id); setFold(profile.fold); }, [edit, profiles]);
  async function search() { setError(''); try { setPlaces(await apiFetch(`/places/search?q=${encodeURIComponent(place)}`)); } catch (e) { setError(e instanceof Error ? e.message : 'Birthplace search failed.'); } }
  async function submit() {
    setError(''); setBusy(true);
    try {
      if (!name.trim() || !date.trim() || !place.trim() || !timezone.trim() || !latitude.trim() || !longitude.trim() || (!unknown && !time.trim())) throw new Error('Complete every required birth detail before calculating.');
      if (!edit && profiles.length > 0 && !permission) throw new Error('Confirm you have permission to save another person’s birth details.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || (!unknown && !/^\d{2}:\d{2}$/.test(time))) throw new Error('Use YYYY-MM-DD for the date and HH:MM for the time.');
      const previous = profiles.find(row => row.id === edit);
      const saved = await apiFetch<{ id: string }>(edit ? `/birth-profiles/${edit}` : '/birth-profiles', { method: edit ? 'PATCH' : 'POST', body: JSON.stringify({ name, birth_date: date, birth_time: unknown ? null : `${time}:00`, time_known: !unknown, timezone, fold, latitude: Number(latitude), longitude: Number(longitude), place_label: place, western_houses: previous?.western_houses ?? 'placidus', ayanamsa: previous?.ayanamsa ?? 'lahiri', node_mode: previous?.node_mode ?? 'true' }) });
      const data = await apiFetch<Chart>(`/birth-profiles/${saved.id}/chart`);
      setProfileId(saved.id); setChart(data); await refresh(saved.id); router.replace('/(tabs)/chart');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not calculate chart.'); } finally { setBusy(false); }
  }
  return <Page><Eyebrow>ASTRA / {edit ? 'EDIT PROFILE' : 'YOUR BEGINNING'}</Eyebrow><Title>{edit ? 'Refine your details.' : 'Every sky begins somewhere.'}</Title><Body>Your time and place locate the sky you were born beneath. Enter them as recorded; we never guess what is missing.</Body><Divider/><Card><Eyebrow>01 / ABOUT YOU</Eyebrow>
    <Field label="Preferred name" value={name} onChangeText={setName} placeholder="Your name"/>
    <Field label="Birth date · YYYY-MM-DD" value={date} onChangeText={setDate} placeholder="2002-06-21"/>
    <ChoiceChip label="I don't know my birth time" selected={unknown} onPress={() => setUnknown(!unknown)}/>
    {!unknown && <Field label="Birth time · 24-hour HH:MM" value={time} onChangeText={setTime} placeholder="20:20"/>}
    <Field label="Birth city and country" value={place} onChangeText={setPlace} placeholder="Kochi, India"/>
    <GhostButton title="Find birthplace" onPress={() => void search()}/>
    {places.map((found, index) => <Pressable key={index} accessibilityRole="button" onPress={() => { setPlace(found.label); setLatitude(String(found.latitude)); setLongitude(String(found.longitude)); setTimezone(found.timezone ?? ''); setPlaces([]); }} style={({ pressed }) => ({ borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, opacity: pressed ? 0.75 : 1 })}><Text style={{ color: colors.ivory, fontSize: 14 }}>{found.label}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{found.timezone ?? 'Timezone unavailable'}</Text></Pressable>)}
    <Body>Place data © OpenStreetMap contributors.</Body>
    <Field label="Latitude" value={latitude} onChangeText={setLatitude} placeholder="9.9312" keyboardType="numbers-and-punctuation"/>
    <Field label="Longitude" value={longitude} onChangeText={setLongitude} placeholder="76.2673" keyboardType="numbers-and-punctuation"/>
    <Field label="IANA timezone" value={timezone} onChangeText={setTimezone} placeholder="Asia/Kolkata"/>
    {!edit && profiles.length > 0 && <ChoiceChip label="I have permission to save these details" selected={permission} onPress={() => setPermission(!permission)}/>}
    <Body>For a repeated clock time during a daylight-saving change, select which occurrence your birth record means.</Body>
    <View style={{ flexDirection: 'row', gap: 9 }}><ChoiceChip label="First" selected={fold === 0} onPress={() => setFold(0)}/><ChoiceChip label="Second" selected={fold === 1} onPress={() => setFold(1)}/></View>
  </Card>{error ? <Text accessibilityRole="alert" style={{ color: '#FFB4A9' }}>{error}</Text> : null}{busy ? <ActivityIndicator color={colors.violet}/> : <Button title={edit ? 'Save and recalculate' : 'Calculate my two lenses'} onPress={submit}/>}</Page>;
}
