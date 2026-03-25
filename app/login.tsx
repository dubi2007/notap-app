import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyRound, Lock, Mail } from 'lucide-react-native';
import { appTheme, elevatedCard } from '../constants/appTheme';
import { getWebApiUrl } from '../lib/web';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { setSession } = useAuthStore();
  const router = useRouter();

  const handlePasswordLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert('Completa tus datos', 'Ingresa correo y contrasena.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setSession(data.session);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Falta el correo', 'Ingresa tu correo para recibir el codigo.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getWebApiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmail(normalizedEmail);
        setOtp('');
        setOtpSent(true);
        Alert.alert('Codigo enviado', 'Revisa tu correo para continuar.');
      } else {
        Alert.alert('Error', data.error || 'No se pudo enviar el codigo.');
      }
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo conectar con la web.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail || normalizedOtp.length < 6) {
      Alert.alert('Codigo incompleto', 'Ingresa el codigo de 6 digitos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getWebApiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, code: normalizedOtp }),
      });
      const data = await res.json();
      if (data.emailOtp) {
        const { data: authData, error } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: data.emailOtp,
          type: 'magiclink',
        });

        if (error) {
          Alert.alert('Error', error.message);
          return;
        }

        setSession(authData.session);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', data.error || 'Codigo invalido.');
      }
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo verificar el codigo.');
    } finally {
      setLoading(false);
    }
  };

  const ctaStyle = {
    backgroundColor: appTheme.colors.primary,
    ...elevatedCard,
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={labelStyle}>Digital Curator</Text>

          <View className="mt-4 pl-8">
            <Text
              style={{
                color: appTheme.colors.text,
                fontSize: 34,
                lineHeight: 42,
                fontWeight: '600',
                letterSpacing: -0.6,
              }}
            >
              Inicia sesion en tu{'\n'}biblioteca privada.
            </Text>
          </View>

          <View
            className="mt-8 rounded-[32px] px-6 py-6"
            style={{ backgroundColor: appTheme.colors.surface }}
          >
            <View
              className="rounded-[28px] px-6 py-6"
              style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
            >
              <Text style={labelStyle}>Acceso</Text>
              <Text style={{ color: appTheme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 10 }}>
                Notas App
              </Text>
              <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 8 }}>
                Usa tu contrasena o un codigo. Despues podras autorizar el login web desde la pestana QR.
              </Text>

              <View className="mt-8 flex-row rounded-[22px] p-1" style={{ backgroundColor: appTheme.colors.surface }}>
                <Pressable
                  className="flex-1 rounded-[18px] py-3 items-center"
                  style={!useOtp ? ctaStyle : undefined}
                  onPress={() => setUseOtp(false)}
                >
                  <Text style={{ color: !useOtp ? '#FFFFFF' : appTheme.colors.muted, fontWeight: '700' }}>
                    Contrasena
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-1 rounded-[18px] py-3 items-center"
                  style={useOtp ? ctaStyle : undefined}
                  onPress={() => {
                    setUseOtp(true);
                    setOtpSent(false);
                    setOtp('');
                  }}
                >
                  <Text style={{ color: useOtp ? '#FFFFFF' : appTheme.colors.muted, fontWeight: '700' }}>
                    Codigo
                  </Text>
                </Pressable>
              </View>

              <View className="mt-6">
                <View
                  className="mb-4 flex-row items-center rounded-[22px] px-4 py-4"
                  style={{ backgroundColor: appTheme.colors.background }}
                >
                  <Mail size={18} color={appTheme.colors.muted} />
                  <TextInput
                    className="ml-3 flex-1"
                    style={{ color: appTheme.colors.text, fontSize: 16 }}
                    placeholder="Correo electronico"
                    placeholderTextColor={appTheme.colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>

                {!useOtp ? (
                  <>
                    <View
                      className="mb-6 flex-row items-center rounded-[22px] px-4 py-4"
                      style={{ backgroundColor: appTheme.colors.background }}
                    >
                      <Lock size={18} color={appTheme.colors.muted} />
                      <TextInput
                        className="ml-3 flex-1"
                        style={{ color: appTheme.colors.text, fontSize: 16 }}
                        placeholder="Contrasena"
                        placeholderTextColor={appTheme.colors.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>

                    <Pressable
                      className="rounded-[22px] py-4 items-center justify-center"
                      style={ctaStyle}
                      onPress={handlePasswordLogin}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Entrar</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <>
                    {otpSent && (
                      <View
                        className="mb-6 flex-row items-center rounded-[22px] px-4 py-4"
                        style={{ backgroundColor: appTheme.colors.background }}
                      >
                        <KeyRound size={18} color={appTheme.colors.muted} />
                        <TextInput
                          className="ml-3 flex-1"
                          style={{ color: appTheme.colors.text, fontSize: 16 }}
                          placeholder="Codigo de 6 digitos"
                          placeholderTextColor={appTheme.colors.muted}
                          value={otp}
                          onChangeText={(value) => setOtp(value.replace(/\D/g, ''))}
                          keyboardType="number-pad"
                          maxLength={6}
                        />
                      </View>
                    )}

                    <Pressable
                      className="rounded-[22px] py-4 items-center justify-center"
                      style={ctaStyle}
                      onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                          {otpSent ? 'Verificar y entrar' : 'Enviar codigo'}
                        </Text>
                      )}
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            <View className="mt-6 pl-6 pr-2">
              <Text style={labelStyle}>Consejo</Text>
              <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
                Si vas a entrar a la web con QR, primero inicia sesion aqui y luego abre la pestana QR en la barra inferior.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
