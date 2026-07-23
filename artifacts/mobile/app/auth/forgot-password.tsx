import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const { resetPassword } = useAuth();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
          <MaterialCommunityIcons name="lock-reset" size={32} color="#0891B2" />
        </View>

        {sent ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>Email Sent!</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Check your inbox for a password reset link.
            </Text>
            <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Back to Login</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Enter your email to receive a reset link.
            </Text>

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

            <Pressable
              style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Send Reset Link</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, alignItems: 'center' },
  iconBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, gap: 10, alignSelf: 'stretch' },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', alignSelf: 'stretch' },
  btnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});
