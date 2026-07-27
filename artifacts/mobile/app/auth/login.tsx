import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, continueAsGuest } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter email and password.'); return; }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
      <View style={styles.topBg}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons name="medical-bag" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>BPSC Nurse Prep</Text>
        <Text style={styles.tagline}>Senior Staff Nurse Exam Preparation</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Sign In</Text>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />
          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </Pressable>

        <Pressable style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.line} /><Text style={styles.orText}>or</Text><View style={styles.line} />
        </View>

        <Pressable style={styles.guestBtn} onPress={handleGuest}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#0C1A2E" />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}> Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  topBg: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, gap: 8 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  appName: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  tagline: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular' },
  form: { flex: 1, margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 14, gap: 10, backgroundColor: '#F8FAFC' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E', padding: 0 },
  forgotWrap: { alignSelf: 'flex-end' },
  forgot: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#0891B2' },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#0891B2' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748B' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, backgroundColor: '#F8FAFC' },
  guestText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0891B2' },
});
