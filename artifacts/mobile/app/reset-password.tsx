import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/lib/supabase';
import { parseRecoveryParams, applyRecoverySession } from '@/src/lib/recovery';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const linkUrl = Linking.useURL();
  const [step, setStep] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const initial = await Linking.getInitialURL();
      const params = parseRecoveryParams(linkUrl || initial);
      if (!params) { setStep('invalid'); return; }
      const ok = await applyRecoverySession(params);
      setStep(ok ? 'ready' : 'invalid');
    })();
  }, [linkUrl]);

  const handleSave = async () => {
    if (p1.length < 6) { Alert.alert('Too Short', 'Password must be at least 6 characters.'); return; }
    if (p1 !== p2) { Alert.alert('No Match', 'Passwords do not match.'); return; }
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase || !isSupabaseConfigured()) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) throw error;
      Alert.alert('Password Updated', 'You can now sign in with your new password.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="form-textbox-password" size={32} color="#0891B2" />
        </View>

        {step === 'checking' && <ActivityIndicator size="large" color="#0891B2" style={{ marginVertical: 24 }} />}

        {step === 'invalid' && (
          <>
            <Text style={styles.title}>Open From the Email</Text>
            <Text style={styles.sub}>
              This screen works when the app is opened from the password-reset link sent to your
              email. Tap the link in the email to continue.
            </Text>
            <Pressable style={styles.btn} onPress={() => router.replace('/')}>
              <Text style={styles.btnText}>Back to Home</Text>
            </Pressable>
          </>
        )}

        {step === 'ready' && (
          <>
            <Text style={styles.title}>Set a New Password</Text>
            <Text style={styles.sub}>Enter your new password below.</Text>

            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoCapitalize="none"
                value={p1}
                onChangeText={setP1}
              />
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoCapitalize="none"
                value={p2}
                onChangeText={setP2}
              />
            </View>

            <Pressable style={[styles.btn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 14, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  iconBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#0C1A2E', textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, gap: 10, alignSelf: 'stretch', backgroundColor: '#F8FAFC' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E', paddingVertical: 14, padding: 0, height: 50 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#0891B2' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});