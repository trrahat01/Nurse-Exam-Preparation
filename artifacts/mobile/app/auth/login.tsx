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
      const msg = e?.message || 'Invalid credentials.';
      if (msg.includes('Email not confirmed')) {
        Alert.alert('Email Not Verified', 'Please check your inbox and click the verification link we sent to your email before signing in.');
      } else {
        Alert.alert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.topArea}>
          <View style={styles.logoBox}>
            <MaterialCommunityIcons name="medical-bag" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Nurse Exam Preparation</Text>
          <Text style={styles.tagline}>40,000+ MCQs for All Nursing Exams</Text>
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

          <Pressable style={[styles.btn, styles.guestBtn]} onPress={handleGuest}>
            <MaterialCommunityIcons name="account-outline" size={18} color="#0C4A6E" />
            <Text style={[styles.btnText, { color: '#0C4A6E', fontFamily: 'Inter_600SemiBold' }]}>Continue as Guest</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0891B2' },
  topArea: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  appName: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  tagline: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  form: {
    flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 16,
  },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, gap: 10,
  },
  input: { flex: 1, height: 52, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E' },
  forgotWrap: { alignItems: 'flex-end' },
  forgot: { color: '#0891B2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  btn: {
    backgroundColor: '#0891B2', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  guestBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#64748B', fontSize: 13, fontFamily: 'Inter_400Regular' },
  footerLink: { color: '#0891B2', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});