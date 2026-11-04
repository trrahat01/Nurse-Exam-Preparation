import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/authStore';

type Step = 'form' | 'verifying' | 'password';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, linkGuestEmail, setGuestPassword, user: storeUser, isGuest } = useAuthStore();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [originalAnonymousId, setOriginalAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest && storeUser) {
      setOriginalAnonymousId(storeUser.id);
      if (storeUser.email) {
        if (!storeUser.email_confirmed_at) {
          setStep('verifying');
          setEmail(storeUser.email);
        } else {
          setStep('password');
          setEmail(storeUser.email);
        }
      }
    } else if (!isGuest && storeUser && step === 'password') {
      // Successfully upgraded
      Alert.alert(
        'Account Successfully Created!',
        'Your account is now ready. All your progress has been preserved.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  }, [isGuest, storeUser, step]);

  const handleRegister = async () => {
    if (!name || !email || (!isGuest && !password)) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (!isGuest && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isGuest) {
        await linkGuestEmail(email.trim().toLowerCase(), name.trim());
        // step will be updated to 'verifying' by useEffect
      } else {
        await signUp(email.trim().toLowerCase(), password, name.trim());
        Alert.alert(
          'Account Created!',
          'We have sent a verification link to your email. Please check your inbox and verify your account before signing in.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    if (!originalAnonymousId) {
      Alert.alert('Error', 'Session lost. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await setGuestPassword(password, originalAnonymousId);
      // Success will be handled by useEffect
    } catch (e: any) {
      Alert.alert('Password Setup Failed', e.message || 'Something went wrong setting your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps='handled'>
      <View style={styles.form}>
        {step === 'verifying' ? (
          <>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.sub}>We have sent a verification link to your email. Please check your inbox and verify your account to proceed.</Text>
            <MaterialCommunityIcons name='email-check-outline' size={48} color='#0891B2' style={{ alignSelf: 'center', marginVertical: 24 }} />
            <Pressable style={styles.btn} onPress={() => router.back()}>
              <Text style={styles.btnText}>Back to Sign In</Text>
            </Pressable>
          </>
        ) : step === 'password' ? (
          <>
            <Text style={styles.title}>Set Password</Text>
            <Text style={styles.sub}>Almost there! Set a secure password for your account.</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name='lock-outline' size={20} color='#64748B' />
              <TextInput style={styles.input} placeholder='Password (min 6 chars)' placeholderTextColor='#94A3B8' secureTextEntry value={password} onChangeText={setPassword} />
            </View>
            <Pressable style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.btnText}>Finish Setup</Text>}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.sub}>Join thousands preparing for nursing exams</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name='account-outline' size={20} color='#64748B' />
              <TextInput style={styles.input} placeholder='Full Name' placeholderTextColor='#94A3B8' autoCapitalize='words' value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name='email-outline' size={20} color='#64748B' />
              <TextInput style={styles.input} placeholder='Email Address' placeholderTextColor='#94A3B8' keyboardType='email-address' autoCapitalize='none' value={email} onChangeText={setEmail} />
            </View>
            {!isGuest && (
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name='lock-outline' size={20} color='#64748B' />
                <TextInput style={styles.input} placeholder='Password (min 6 chars)' placeholderTextColor='#94A3B8' secureTextEntry value={password} onChangeText={setPassword} />
              </View>
            )}
            <View style={styles.verifyNote}>
              <MaterialCommunityIcons name='email-check-outline' size={18} color='#0891B2' />
              <Text style={styles.verifyText}>After signing up, you'll receive a verification email. Please verify your email to sign in.</Text>
            </View>
            <Pressable style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.btnText}>{isGuest ? 'Link Email' : 'Create Account'}</Text>}
            </Pressable>
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Pressable onPress={() => router.back()}><Text style={styles.loginLink}> Sign In</Text></Pressable>
            </View>
          </>
        )}
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




