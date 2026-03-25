import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ScanLine } from 'lucide-react-native';
import { appTheme, elevatedCard, glassCard } from '../../constants/appTheme';
import { postJsonToWeb } from '../../lib/web';
import { supabase } from '../../lib/supabase';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const resetScanner = useCallback(() => {
    setScanned(false);
    setProcessing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetScanner();

      return () => {
        resetScanner();
      };
    }, [resetScanner])
  );

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: appTheme.colors.background }}>
        <ActivityIndicator color={appTheme.colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: appTheme.colors.background }}>
        <View className="flex-1 justify-center">
          <View className="rounded-[30px] px-6 py-6" style={{ backgroundColor: appTheme.colors.surface }}>
            <View className="rounded-[28px] px-6 py-6" style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}>
              <View
                className="h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: appTheme.colors.secondarySoft }}
              >
                <Camera size={28} color={appTheme.colors.primary} />
              </View>

              <Text style={{ color: appTheme.colors.text, fontSize: 28, fontWeight: '700', marginTop: 18 }}>
                Activa la camara
              </Text>
              <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
                Necesitamos la camara para leer el QR que genera la web y sincronizar tu sesion.
              </Text>

              <Pressable
                className="mt-8 rounded-[22px] py-4 items-center"
                style={{ backgroundColor: appTheme.colors.primary, ...elevatedCard }}
                onPress={requestPermission}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Otorgar permiso</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) {
      return;
    }

    setScanned(true);

    const isAuthQR = data.includes('/auth/qr?');
    const sessionMatch = data.match(/[?&]session=([^&]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    if (isAuthQR && sessionId) {
      setProcessing(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          Alert.alert('Error', 'No has iniciado sesion en la app movil.');
          resetScanner();
          return;
        }

        const { response } = await postJsonToWeb('/api/auth/qr-confirm', { sessionId }, {
          scannedUrl: data,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          Alert.alert('Sesion autorizada', 'La sesion web ya quedo confirmada desde tu celular.', [
            {
              text: 'Volver',
              onPress: () => {
                resetScanner();
                router.replace('/(tabs)');
              },
            },
          ]);
        } else {
          const errData = await response.json().catch(() => ({}));
          Alert.alert('Error', `Fallo la autorizacion: ${errData.error || response.statusText}`);
          resetScanner();
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'No se pudo conectar con la web';
        Alert.alert('Error', message);
        resetScanner();
      } finally {
        setProcessing(false);
      }
    } else if (data.includes('token=')) {
      Alert.alert(
        'Codigo QR incorrecto',
        'Ese QR sirve para iniciar sesion en otro dispositivo. Usa el QR de la pestana QR del login web.',
        [{ text: 'Entendido', onPress: resetScanner }]
      );
    } else {
      Alert.alert('Codigo QR invalido', 'Este codigo no pertenece a Notas App.', [
        { text: 'Volver a intentar', onPress: resetScanner },
      ]);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.overlay }}>
          <View className="flex-1 justify-between px-6 py-6">
            <View
              className="self-start rounded-full px-4 py-2"
              style={{ backgroundColor: appTheme.colors.surfaceGlass, ...glassCard }}
            >
              <Text style={labelStyle}>Sincronizacion web</Text>
            </View>

            <View className="items-center">
              <View className="h-72 w-72 items-center justify-center rounded-[44px]" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }}>
                <View className="relative h-60 w-60 items-center justify-center">
                  <View className="absolute top-0 left-0 h-14 w-14 rounded-tl-[18px] border-l-4 border-t-4" style={{ borderColor: appTheme.colors.primary }} />
                  <View className="absolute top-0 right-0 h-14 w-14 rounded-tr-[18px] border-r-4 border-t-4" style={{ borderColor: appTheme.colors.primary }} />
                  <View className="absolute bottom-0 left-0 h-14 w-14 rounded-bl-[18px] border-b-4 border-l-4" style={{ borderColor: appTheme.colors.primary }} />
                  <View className="absolute bottom-0 right-0 h-14 w-14 rounded-br-[18px] border-b-4 border-r-4" style={{ borderColor: appTheme.colors.primary }} />

                  <View className="items-center">
                    <ScanLine size={28} color={appTheme.colors.primary} />
                    <Text style={{ color: appTheme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 14 }}>
                      Centra el QR
                    </Text>
                  </View>
                </View>
              </View>

              {processing && (
                <View
                  className="mt-6 rounded-[24px] px-6 py-5"
                  style={{ backgroundColor: appTheme.colors.surfaceGlass, ...glassCard }}
                >
                  <ActivityIndicator size="large" color={appTheme.colors.primary} />
                  <Text style={{ color: appTheme.colors.text, fontSize: 15, fontWeight: '700', marginTop: 14 }}>
                    Autorizando sesion...
                  </Text>
                </View>
              )}
            </View>

            <View
              className="rounded-[28px] px-5 py-5"
              style={{ backgroundColor: appTheme.colors.surfaceGlass, ...glassCard }}
            >
              <Text style={labelStyle}>Uso</Text>
              <Text style={{ color: appTheme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 10 }}>
                Escanea el QR del login web
              </Text>
              <Text style={{ color: appTheme.colors.muted, fontSize: 14, lineHeight: 23, marginTop: 8 }}>
                La autorizacion se hace aqui y la sesion se abre en la pantalla web. Si vuelves a esta pestana, el lector se reinicia automaticamente.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
