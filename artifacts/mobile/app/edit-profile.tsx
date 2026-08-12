import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/lib/supabase';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [examTarget, setExamTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName((user.user_metadata?.full_name as string) || '');
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = getSupabaseClient();
      if (!supabase || !user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setPhone(data.phone || '');
        setDistrict(data.district || '');
        setExamTarget(data.exam_target || '');
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        // Update auth metadata (name) + profiles row (no image upload to save space).
        await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          district: district.trim(),
          exam_target: examTarget.trim(),
          updated_at: new Date().toISOString(),
        });
      }
      Alert.alert('Saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, icon: any, value: string, onChange: (t: string) => void, keyboard?: any) => (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#64748B" />
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize="words"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.form}>
        {field('Full Name', 'account-outline', fullName, setFullName)}
        {field('Phone', 'phone-outline', phone, setPhone, 'phone-pad')}
        {field('District', 'map-marker-outline', district, setDistrict)}
        {field('Exam Target', 'target', examTarget, setExamTarget)}

        <Text style={styles.note}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#64748B" /> Your email is fixed and cannot be changed here. Profile uses text only — no photo uploads to keep your data small.
        </Text>

        <Pressable style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={saving || !!loading}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Profile</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  form: { paddingHorizontal: 16, gap: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, gap: 10, height: 52 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E', padding: 0 },
  note: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', lineHeight: 18 },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#0891B2', marginTop: 8 },
  saveText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});