import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
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
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient colors={['#0C4A6E', '#0891B2']} style={styles.topBg}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons name="medical-bag" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>BPSC Nurse Prep</Text>
        <Text style={styles.tagline}>Senior Staff Nurse Exam Preparation</Text>
      </LinearGradient>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Sign In</Text>

        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
          <MaterialCommunityIcons name="email-outline" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Email address"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.input }]}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPass(p => !p)}>
            <MaterialCommunityIcons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.forgotWrap}>
          <Text style={[styles.forgot, { color: colors.primary }]}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Sign In</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          style={[styles.guestBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
          onPress={handleGuest}
        >
          <MaterialCommunityIcons name="account-outline" size={20} color={colors.foreground} />
          <Text style={[styles.guestText, { color: colors.foreground }]}>Continue as Guest</Text>
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.push('/auth/register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}> Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flexGrow: 1 },
  topBg: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, gap: 8 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  appName: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  tagline: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular' },
  form: { flex: 1, margin: 16, borderRadius: 24, padding: 24, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  forgotWrap: { alignSelf: 'flex-end' },
  forgot: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1 },
  orText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 14 },
  guestText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
