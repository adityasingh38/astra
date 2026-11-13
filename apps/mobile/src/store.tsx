import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { apiFetch, configured, supabase } from './api';

export type Position = { sign: string; degree: number; longitude: number; retrograde: boolean };
export type Lens = {
  zodiac: 'tropical' | 'sidereal'; house_system: string;
  positions: Record<string, Position>;
  houses: { ascendant: Position; midheaven: Position; cusps: Position[] } | null;
  warnings: string[];
  metadata: { birth_utc: string; birth_timezone: string; ephemeris_version: string; ayanamsa: string | null; ayanamsa_degrees: number | null; node_mode: string; actual_ephemeris_flags: Record<string, number> };
  moon_nakshatra?: { name: string; pada: number; ruler: string };
  mahadashas?: { ruler: string; start_utc: string; end_utc: string; current_at_birth: boolean }[] | null;
  aspects?: { first: string; second: string; aspect: string; orb: number }[];
  divisional?: Record<string, { division: number; positions: Record<string, { sign: string; segment: number }>; ascendant: { sign: string } | null; mapping: string }>;
  whole_sign_placements?: Record<string, number> | null;
  antardashas?: { mahadasha: string; antardasha: string; start_utc: string; end_utc: string }[][] | null;
};
export type Chart = { birth_profile: { name: string; place_label: string; birth_date: string; time_known: boolean }; western: Lens; vedic: Lens };
export type SavedProfile = { id: string; preferred_name: string; birth_date: string; birth_time: string | null; time_known: boolean; timezone_id: string; fold: 0 | 1 | null; latitude: number; longitude: number; place_label: string; western_houses: string; ayanamsa: string; node_mode: string };
type State = { chart: Chart | null; setChart: (chart: Chart | null) => void; profileId: string | null; setProfileId: (id: string | null) => void; profiles: SavedProfile[]; selectProfile: (id: string) => Promise<void>; session: Session | null; loading: boolean; refresh: (preferredId?: string) => Promise<void> };
const ChartContext = createContext<State | null>(null);
export function ChartProvider({ children }: { children: React.ReactNode }) {
  const [chart, setChart] = useState<Chart | null>(null); const [profileId, setProfileId] = useState<string | null>(null); const [profiles, setProfiles] = useState<SavedProfile[]>([]); const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true);
  async function selectProfile(id: string) { const next = await apiFetch<Chart>(`/birth-profiles/${id}/chart`); setProfileId(id); setChart(next); }
  async function refresh(preferredId?: string) { if (!configured) { setLoading(false); return; } const { data } = await supabase.auth.getSession(); setSession(data.session); if (data.session) { try { const rows = await apiFetch<SavedProfile[]>('/birth-profiles'); setProfiles(rows); if (rows.length) await selectProfile(rows.find(row => row.id === (preferredId ?? profileId))?.id ?? rows[0].id); else { setChart(null); setProfileId(null); } } catch { setChart(null); setProfileId(null); } } else { setChart(null); setProfileId(null); setProfiles([]); } setLoading(false); }
  useEffect(() => { void refresh(); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (!next) { setChart(null); setProfileId(null); } }); return () => data.subscription.unsubscribe(); }, []);
  return <ChartContext.Provider value={{ chart, setChart, profileId, setProfileId, profiles, selectProfile, session, loading, refresh }}>{children}</ChartContext.Provider>;
}
export function useChart() { const state = useContext(ChartContext); if (!state) throw new Error('ChartProvider missing'); return state; }
