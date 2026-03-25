import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, QrCode, ShieldCheck, User as UserIcon } from 'lucide-react-native';
import { appTheme, elevatedCard } from '../../constants/appTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [closingSession, setClosingSession] = useState(false);

  const handleSignOut = async () => {
    setClosingSession(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      await signOut();
      router.replace('/login');
    } finally {
      setClosingSession(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <View className="flex-1 px-6 pt-4">
        <Text style={labelStyle}>Perfil</Text>
        <Text
          style={{
            color: appTheme.colors.text,
            fontSize: 32,
            lineHeight: 40,
            fontWeight: '600',
            letterSpacing: -0.6,
            marginTop: 12,
          }}
        >
          Gestiona tu acceso{'\n'}desde el movil.
        </Text>

        <View
          className="mt-8 rounded-[30px] px-6 py-6"
          style={{ backgroundColor: appTheme.colors.surface }}
        >
          <View
            className="rounded-[28px] px-6 py-6"
            style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: appTheme.colors.secondarySoft }}
            >
              <UserIcon size={30} color={appTheme.colors.primary} />
            </View>

            <Text style={{ color: appTheme.colors.text, fontSize: 26, fontWeight: '700', marginTop: 20 }}>
              Sesion activa
            </Text>
            <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 8 }}>
              {user?.email}
            </Text>

            <View className="mt-8">
              <View className="rounded-[22px] px-5 py-5" style={{ backgroundColor: appTheme.colors.surface }}>
                <View className="flex-row items-center">
                  <QrCode size={18} color={appTheme.colors.primary} />
                  <Text style={{ color: appTheme.colors.text, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                    Sincronizacion web por QR
                  </Text>
                </View>
                <Text style={{ color: appTheme.colors.muted, fontSize: 14, lineHeight: 23, marginTop: 10 }}>
                  Desde aqui mantienes la sesion del telefono para autorizar la entrada en la web sin escribir la contrasena otra vez.
                </Text>
              </View>

              <View className="mt-4 rounded-[22px] px-5 py-5" style={{ backgroundColor: appTheme.colors.surface }}>
                <View className="flex-row items-center">
                  <ShieldCheck size={18} color={appTheme.colors.primary} />
                  <Text style={{ color: appTheme.colors.text, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                    Acceso seguro
                  </Text>
                </View>
                <Text style={{ color: appTheme.colors.muted, fontSize: 14, lineHeight: 23, marginTop: 10 }}>
                  Si cierras sesion aqui, la app deja de poder confirmar QR hasta que vuelvas a entrar.
                </Text>
              </View>
            </View>

            <Pressable
              className="mt-8 rounded-[22px] flex-row items-center justify-center py-4"
              style={{ backgroundColor: 'rgba(201, 75, 106, 0.12)' }}
              onPress={handleSignOut}
              disabled={closingSession}
            >
              {closingSession ? (
                <ActivityIndicator color={appTheme.colors.danger} />
              ) : (
                <>
                  <LogOut size={18} color={appTheme.colors.danger} />
                  <Text style={{ color: appTheme.colors.danger, fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                    Cerrar sesion
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
