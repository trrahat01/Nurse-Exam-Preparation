import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function ResetPasswordScreen() {
  const { updatePassword, hasRecoveryAuthorization, recoveryAuthExpiry, clearRecoveryAuthorization } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Ref to prevent duplicate alerts and redirects across state updates / timers / submissions
  const redirectedRef = useRef(false);

  // Security check: Verify recovery authorization and manage expiration timer
  useEffect(() => {
    // If an alert / redirect was already triggered, exit early to avoid duplicate alerts/redirects
    if (redirectedRef.current) return;

    // Reject missing authorization or missing/invalid expiry timestamp
    if (
      !hasRecoveryAuthorization ||
      !recoveryAuthExpiry ||
      typeof recoveryAuthExpiry !== 'number' ||
      !Number.isFinite(recoveryAuthExpiry)
    ) {
      redirectedRef.current = true;
      setAuthCheckComplete(false);
      clearRecoveryAuthorization();
      Alert.alert(
        'Access Denied',
        'Please complete the password recovery process first. You cannot reset your password directly without a valid recovery link.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
      return;
    }

    const now = Date.now();
    // Handle already-expired timestamp immediately
    if (now >= recoveryAuthExpiry) {
      redirectedRef.current = true;
      setAuthCheckComplete(false);
      clearRecoveryAuthorization();
      Alert.alert(
        'Session Expired',
        'Your password reset session has expired (30-minute limit). Please request a new reset link.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
      return;
    }

    // Authorization confirmed for now, allow form to render
    setAuthCheckComplete(true);

    // Schedule the expiration timeout for the remaining duration
    const remainingTime = recoveryAuthExpiry - now;
    const timer = setTimeout(() => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      setAuthCheckComplete(false);
      clearRecoveryAuthorization();
      Alert.alert(
        'Session Expired',
        'Your password reset session has expired (30-minute limit). Please request a new reset link.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [hasRecoveryAuthorization, recoveryAuthExpiry, clearRecoveryAuthorization]);

  // Show loading state while authorization is being checked
  if (!authCheckComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#0891B2" />
          <Text style={styles.title}>Verifying Authorization...</Text>
          <Text style={styles.sub}>Please wait while we confirm your recovery authorization.</Text>
        </View>
      </View>
    );
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(newPassword);
      redirectedRef.current = true;
      Alert.alert('Success', 'Your password has been updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/auth/login') }
      ]);
    } catch (e: any) {
      if (!hasRecoveryAuthorization || !recoveryAuthExpiry || Date.now() >= recoveryAuthExpiry) {
        redirectedRef.current = true;
        Alert.alert('Session Expired', e.message || 'Password update failed.', [
          { text: 'OK', onPress: () => router.replace('/auth/login') }
        ]);
      } else {
        Alert.alert('Error', e.message || 'Failed to update password');
      }
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>Enter your new password below.</Text>
        
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <MaterialCommunityIcons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        
        <Pressable
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Update Password</Text>
          )}
        </Pressable>
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