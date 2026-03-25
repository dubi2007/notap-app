import React, { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Folder as FolderIcon, Layers3, QrCode } from 'lucide-react-native';
import { appTheme, elevatedCard } from '../../constants/appTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotesStore } from '../../store/useNotesStore';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { folders, loadingFolders, fetchFolders } = useNotesStore();
  const router = useRouter();
  const rootFolders = folders.filter((folder) => !folder.parent_id);

  useEffect(() => {
    void fetchFolders();
  }, [fetchFolders]);

  const renderFolderCard = ({ item }: { item: (typeof rootFolders)[number] }) => {
    const childCount = folders.filter((candidate) => candidate.parent_id === item.id).length;

    return (
      <Pressable
        className="mb-4 rounded-[26px] px-5 py-5"
        style={{
          backgroundColor: appTheme.colors.surfaceRaised,
          ...elevatedCard,
        }}
        onPress={() => router.push({ pathname: '/folder/[id]', params: { id: item.id } })}
      >
        <View className="flex-row items-center">
          <View
            className="mr-4 h-12 w-1 rounded-full"
            style={{ backgroundColor: appTheme.colors.primary }}
          />

          <View
            className="mr-4 h-12 w-12 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: appTheme.colors.surface }}
          >
            <FolderIcon size={22} color={appTheme.colors.primary} />
          </View>

          <View className="flex-1">
            <Text style={{ color: appTheme.colors.text, fontSize: 18, fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: appTheme.colors.muted, fontSize: 14, marginTop: 4 }}>
              {childCount > 0 ? `${childCount} subcarpetas` : 'Abrir carpeta'}
            </Text>
          </View>

          <ChevronRight size={18} color={appTheme.colors.muted} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <FlatList
        data={rootFolders}
        keyExtractor={(item) => item.id}
        renderItem={renderFolderCard}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 132 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingFolders}
            onRefresh={() => {
              void fetchFolders();
            }}
            tintColor={appTheme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View className="mb-10">
            <Text style={labelStyle}>Biblioteca personal</Text>

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
                {user?.email?.split('@')[0] || 'Tu espacio'}{'\n'}ordenado como documentos.
              </Text>
            </View>

            <View
              className="mt-8 rounded-[30px] px-6 py-6"
              style={{ backgroundColor: appTheme.colors.surface }}
            >
              <Text style={labelStyle}>Resumen</Text>

              <View className="mt-5 flex-row gap-3">
                <View
                  className="flex-1 rounded-[24px] px-5 py-5"
                  style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
                >
                  <View className="flex-row items-center">
                    <Layers3 size={18} color={appTheme.colors.primary} />
                    <Text style={{ color: appTheme.colors.text, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                      Carpetas raiz
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: appTheme.colors.text,
                      fontSize: 34,
                      fontWeight: '700',
                      marginTop: 14,
                    }}
                  >
                    {rootFolders.length}
                  </Text>
                </View>

                <Pressable
                  className="flex-1 rounded-[24px] px-5 py-5"
                  style={{ backgroundColor: appTheme.colors.primary, ...elevatedCard }}
                  onPress={() => router.push('/scanner')}
                >
                  <QrCode size={20} color="#ffffff" />
                  <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700', marginTop: 14 }}>
                    Escanear QR
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 6, lineHeight: 20 }}>
                    Autoriza la web desde tu celular
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-8 flex-row items-end justify-between">
              <View>
                <Text style={labelStyle}>Carpetas</Text>
                <Text style={{ color: appTheme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 8 }}>
                  Coleccion principal
                </Text>
              </View>
              <Text style={{ color: appTheme.colors.muted, fontSize: 14 }}>{folders.length} en total</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            className="rounded-[28px] px-8 py-10"
            style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
          >
            <FolderIcon size={42} color={appTheme.colors.primary} />
            <Text style={{ color: appTheme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 18 }}>
              Aun no hay carpetas raiz
            </Text>
            <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
              Crea carpetas en la web y apareceran aqui con el mismo lenguaje visual de tu biblioteca.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
