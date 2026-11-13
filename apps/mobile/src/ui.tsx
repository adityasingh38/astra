import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { colors } from './theme';

export const radius = { panel: 22, control: 18, chip: 14 };

export function Page({ children }: { children: React.ReactNode }) {
  return <ScrollView style={styles.page} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.frame}>{children}</View></ScrollView>;
}
export function Eyebrow({ children }: { children: React.ReactNode }) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function Title({ children }: { children: React.ReactNode }) { return <Text style={styles.title}>{children}</Text>; }
export function Body({ children }: { children: React.ReactNode }) { return <Text style={styles.body}>{children}</Text>; }
export function Card({ children }: { children: React.ReactNode }) { return <View style={styles.card}>{children}</View>; }
export function PaperCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.paperCard, style]}>{children}</View>; }
export function Divider() { return <View style={styles.divider}/>; }
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionHeading}><Eyebrow>{children}</Eyebrow><View style={styles.sectionRule}/></View>;
}

export function Button({ title, onPress, disabled, editorial }: { title: string; onPress: () => void; disabled?: boolean; editorial?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, editorial && styles.editorialButton, disabled && styles.disabled, pressed && styles.pressed]}>
    <Text style={[styles.buttonText, editorial && styles.editorialButtonText]}>{title}</Text><ArrowUpRight size={20} color={colors.ink} strokeWidth={1.4}/>
  </Pressable>;
}
export function GhostButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}>
    <Text style={styles.ghostText}>{title}</Text><ArrowUpRight size={18} color={colors.ivory} strokeWidth={1.4}/>
  </Pressable>;
}
export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>;
}
export function FormField({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.soft} {...props} style={[styles.input, props.style]}/></View>;
}

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', paddingBottom: 88 },
  frame: { width: '100%', maxWidth: 560, paddingHorizontal: 24, paddingTop: 28, gap: 20 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2.8, textTransform: 'uppercase', lineHeight: 16 },
  title: { color: colors.ivory, fontFamily: 'Georgia', fontSize: 42, fontWeight: '700', lineHeight: 48, letterSpacing: -1.25 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: radius.panel, borderCurve: 'continuous', padding: 23, gap: 16 },
  paperCard: { backgroundColor: colors.paper, borderRadius: radius.panel, borderCurve: 'continuous', padding: 23, gap: 16 },
  button: { backgroundColor: colors.paper, borderRadius: radius.control, borderCurve: 'continuous', minHeight: 60, paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 18 },
  buttonText: { color: colors.ink, fontFamily: 'Georgia', fontWeight: '700', fontSize: 18, lineHeight: 25, flexShrink: 1 },
  editorialButton: { minHeight: 76 },
  editorialButtonText: { fontSize: 20, lineHeight: 27 },
  ghost: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.control, borderCurve: 'continuous', minHeight: 56, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  ghostText: { color: colors.ivory, fontFamily: 'Georgia', fontSize: 16, fontWeight: '700', lineHeight: 23, flexShrink: 1 },
  chip: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, borderCurve: 'continuous', minHeight: 46, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  chipSelected: { backgroundColor: colors.paper, borderColor: colors.paper },
  chipText: { color: colors.ivory, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, textTransform: 'uppercase' },
  chipTextSelected: { color: colors.ink },
  field: { gap: 8 },
  fieldLabel: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.7, textTransform: 'uppercase' },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, borderCurve: 'continuous', color: colors.ivory, minHeight: 54, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionRule: { flex: 1, height: 1, backgroundColor: colors.border },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
