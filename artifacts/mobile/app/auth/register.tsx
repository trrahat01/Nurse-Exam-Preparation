import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/authStore';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Please fill all fields.'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
      Alert.alert(
        'Account Created!',
        'We have sent a verification link to your email. Please check your inbox (and spam folder) and click the link to verify your account before signing in.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join thousands preparing for nursing exams</Text>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#64748B" />
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94A3B8" autoCapitalize="words" value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#64748B" />
          <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        </View>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
          <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
        </View>
        <View style={styles.verifyNote}>
          <MaterialCommunityIcons name="email-check-outline" size={18} color="#0891B2" />
          <Text style={styles.verifyText}>After signing up, you'll receive a verification email. Please verify your email to sign in.</Text>
        </View>
        <Pressable style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </Pressable>
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.loginLink}> Sign In</Text></Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  form: { margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 14, elevation: 2 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748B', marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 14, gap: 10, backgroundColor: '#F8FAFC' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E', padding: 0 },
  verifyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E0F2FE', borderRadius: 10, padding: 12 },
  verifyText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#0C4A6E', lineHeight: 17 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#0891B2', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  loginLink: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0891B2' },
});