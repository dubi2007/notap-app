import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, FileText, Folder as FolderIcon } from 'lucide-react-native';
import { appTheme, elevatedCard } from '../../constants/appTheme';
import { formatShortDate, getNotePreview } from '../../lib/note-utils';
import { useNotesStore } from '../../store/useNotesStore';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function FolderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { notes, loadingNotes, folders, loadingFolders, fetchNotes, fetchFolders } = useNotesStore();
  const folderId = Array.isArray(id) ? id[0] : id;
  const currentFolder = folders.find((folder) => folder.id === folderId);
  const parentFolder = folders.find((folder) => folder.id === currentFolder?.parent_id);
  const subFolders = folders.filter((folder) => folder.parent_id === folderId);

  useEffect(() => {
    if (folders.length === 0) {
      void fetchFolders();
    }

    if (folderId) {
      void fetchNotes(folderId);
    }
  }, [fetchFolders, fetchNotes, folderId, folders.length]);

  const refreshFolder = async () => {
    if (!folderId) {
      return;
    }

    await Promise.all([fetchFolders(), fetchNotes(folderId)]);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 72 }}
        refreshControl={
          <RefreshControl
            refreshing={loadingFolders || loadingNotes}
            onRefresh={() => {
              void refreshFolder();
            }}
            tintColor={appTheme.colors.primary}
          />
        }
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={appTheme.colors.text} />
          </Pressable>

          {parentFolder ? (
            <Pressable
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: appTheme.colors.secondarySoft }}
              onPress={() => router.push({ pathname: '/folder/[id]', params: { id: parentFolder.id } })}
            >
              <Text style={{ color: appTheme.colors.primary, fontSize: 13, fontWeight: '700' }}>
                Volver a {parentFolder.name}
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <View className="mt-8">
          <Text style={labelStyle}>Carpeta</Text>
          <Text
            style={{
              color: appTheme.colors.text,
              fontSize: 34,
              lineHeight: 42,
              fontWeight: '600',
              letterSpacing: -0.6,
              marginTop: 10,
            }}
          >
            {currentFolder?.name || 'Carpeta'}
          </Text>
          <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10, maxWidth: 320 }}>
            {parentFolder ? `Dentro de ${parentFolder.name}.` : 'Nivel principal de tu biblioteca digital.'}
          </Text>
        </View>

        <View
          className="mt-8 rounded-[30px] px-6 py-6"
          style={{ backgroundColor: appTheme.colors.surface }}
        >
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-[24px] px-5 py-5"
              style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
            >
              <Text style={labelStyle}>Subcarpetas</Text>
              <Text style={{ color: appTheme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 14 }}>
                {subFolders.length}
              </Text>
            </View>

            <View
              className="flex-1 rounded-[24px] px-5 py-5"
              style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
            >
              <Text style={labelStyle}>Notas</Text>
              <Text style={{ color: appTheme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 14 }}>
                {notes.length}
              </Text>
            </View>
          </View>
        </View>

        {(loadingFolders && folders.length === 0) || (loadingNotes && notes.length === 0 && subFolders.length === 0) ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
            <Text style={{ color: appTheme.colors.muted, fontSize: 14, marginTop: 14 }}>
              Cargando contenido...
            </Text>
          </View>
        ) : (
          <>
            {subFolders.length > 0 && (
              <View className="mt-10">
                <Text style={labelStyle}>Subcarpetas</Text>

                <View className="mt-5">
                  {subFolders.map((folder) => (
                    <Pressable
                      key={folder.id}
                      className="mb-4 rounded-[24px] px-5 py-5"
                      style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
                      onPress={() => router.push({ pathname: '/folder/[id]', params: { id: folder.id } })}
                    >
                      <View className="flex-row items-center">
                        <View className="mr-4 h-12 w-1 rounded-full" style={{ backgroundColor: appTheme.colors.primary }} />
                        <View
                          className="mr-4 h-12 w-12 items-center justify-center rounded-[16px]"
                          style={{ backgroundColor: appTheme.colors.surface }}
                        >
                          <FolderIcon size={22} color={appTheme.colors.primary} />
                        </View>
                        <View className="flex-1">
                          <Text style={{ color: appTheme.colors.text, fontSize: 17, fontWeight: '700' }}>
                            {folder.name}
                          </Text>
                          <Text style={{ color: appTheme.colors.muted, fontSize: 14, marginTop: 4 }}>
                            Abrir subcarpeta
                          </Text>
                        </View>
                        <ChevronRight size={18} color={appTheme.colors.muted} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View className="mt-8">
              <Text style={labelStyle}>Notas</Text>

              <View className="mt-5">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <Pressable
                      key={note.id}
                      className="mb-4 rounded-[28px] px-5 py-5"
                      style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
                      onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                    >
                      <View className="flex-row items-start">
                        <View className="mr-4 h-12 w-1 rounded-full" style={{ backgroundColor: appTheme.colors.primary }} />
                        <View
                          className="mr-4 mt-1 h-12 w-12 items-center justify-center rounded-[16px]"
                          style={{ backgroundColor: appTheme.colors.surface }}
                        >
                          <FileText size={22} color={appTheme.colors.accent} />
                        </View>

                        <View className="flex-1">
                          <Text style={{ color: appTheme.colors.text, fontSize: 18, fontWeight: '700' }}>
                            {note.title || 'Sin titulo'}
                          </Text>
                          <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 8 }}>
                            {getNotePreview(note.content)}
                          </Text>
                          <View className="mt-4 flex-row items-center justify-between">
                            <Text style={{ color: appTheme.colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
                              {formatShortDate(note.updated_at).toUpperCase()}
                            </Text>
                            <Text style={{ color: appTheme.colors.primary, fontSize: 13, fontWeight: '700' }}>
                              Leer nota
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View
                    className="rounded-[28px] px-8 py-10"
                    style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
                  >
                    <FileText size={42} color={appTheme.colors.primary} />
                    <Text style={{ color: appTheme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 18 }}>
                      No hay notas directas aqui
                    </Text>
                    <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
                      {subFolders.length > 0
                        ? 'Puedes seguir entrando a las subcarpetas o crear nuevas notas desde la web.'
                        : 'Crea o mueve notas desde la web y apareceran aqui listas para leer.'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
