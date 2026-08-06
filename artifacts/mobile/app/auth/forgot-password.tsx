import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="lock-reset" size={32} color="#0891B2" />
        </View>
        {sent ? (
          <>
            <Text style={styles.title}>Email Sent!</Text>
            <Text style={styles.sub}>Check your inbox for a password reset link.</Text>
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back to Login</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.sub}>Enter your email to receive a reset link.</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />
              <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <Pressable style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F8FAFC' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  iconBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#0C1A2E', textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 14, gap: 10, alignSelf: 'stretch', backgroundColor: '#F8FAFC' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E', padding: 0 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', alignSelf: 'stretch', backgroundColor: '#0891B2' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});