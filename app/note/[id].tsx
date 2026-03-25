import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BookOpenText, Folder as FolderIcon } from 'lucide-react-native';
import { appTheme, elevatedCard } from '../../constants/appTheme';
import { formatLongDate, getNoteParagraphs } from '../../lib/note-utils';
import { supabase } from '../../lib/supabase';
import { type Note, useNotesStore } from '../../store/useNotesStore';

const labelStyle = {
  color: appTheme.colors.muted,
  fontSize: 12,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
};

export default function NoteReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const noteId = Array.isArray(id) ? id[0] : id;
  const { folders, fetchFolders } = useNotesStore();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadNote = async () => {
      if (!noteId) {
        if (active) {
          setError('Nota no encontrada');
          setLoading(false);
        }
        return;
      }

      try {
        if (folders.length === 0) {
          await fetchFolders();
        }

        const { data, error: noteError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (!active) {
          return;
        }

        if (noteError || !data) {
          setError('No pudimos cargar esta nota.');
          setLoading(false);
          return;
        }

        setNote(data as Note);
        setLoading(false);
      } catch {
        if (active) {
          setError('Ocurrio un problema al abrir la nota.');
          setLoading(false);
        }
      }
    };

    void loadNote();

    return () => {
      active = false;
    };
  }, [fetchFolders, folders.length, noteId]);

  const folderName = useMemo(() => {
    if (!note?.folder_id) {
      return null;
    }

    return folders.find((folder) => folder.id === note.folder_id)?.name ?? null;
  }, [folders, note?.folder_id]);

  const paragraphs = useMemo(() => getNoteParagraphs(note?.content), [note?.content]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: appTheme.colors.background }}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <Text style={{ color: appTheme.colors.muted, fontSize: 14, marginTop: 14 }}>Abriendo nota...</Text>
      </SafeAreaView>
    );
  }

  if (error || !note) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
        <View className="flex-1 justify-center px-6">
          <View className="rounded-[30px] px-6 py-6" style={{ backgroundColor: appTheme.colors.surface }}>
            <View className="rounded-[28px] px-6 py-6" style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}>
              <Text style={labelStyle}>Lectura</Text>
              <Text style={{ color: appTheme.colors.text, fontSize: 26, fontWeight: '700', marginTop: 10 }}>
                No se pudo abrir la nota
              </Text>
              <Text style={{ color: appTheme.colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
                {error ?? 'La nota no existe o ya no esta disponible.'}
              </Text>
              <Pressable
                className="mt-8 rounded-[22px] py-4 items-center"
                style={{ backgroundColor: appTheme.colors.primary, ...elevatedCard }}
                onPress={() => router.back()}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Volver</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: appTheme.colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 72 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={appTheme.colors.text} />
          </Pressable>

          {folderName ? (
            <View className="flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: appTheme.colors.secondarySoft }}>
              <FolderIcon size={14} color={appTheme.colors.primary} />
              <Text style={{ color: appTheme.colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
                {folderName}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>

        <View className="mt-8">
          <Text style={labelStyle}>Lectura</Text>
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
            {note.title || 'Sin titulo'}
          </Text>
          <Text style={{ color: appTheme.colors.muted, fontSize: 14, marginTop: 12 }}>
            Actualizada el {formatLongDate(note.updated_at)}
          </Text>
        </View>

        <View className="mt-8 rounded-[30px] px-6 py-6" style={{ backgroundColor: appTheme.colors.surface }}>
          <View className="rounded-[30px] px-6 py-7" style={{ backgroundColor: appTheme.colors.surfaceRaised, ...elevatedCard }}>
            <View className="flex-row items-center">
              <BookOpenText size={18} color={appTheme.colors.primary} />
              <Text style={{ color: appTheme.colors.text, fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                Vista de lectura
              </Text>
            </View>

            <View className="mt-8">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <Text
                    key={`${index}-${paragraph.slice(0, 12)}`}
                    style={{
                      color: appTheme.colors.text,
                      fontSize: 17,
                      lineHeight: 30,
                      marginBottom: 22,
                    }}
                  >
                    {paragraph}
                  </Text>
                ))
              ) : (
                <Text style={{ color: appTheme.colors.muted, fontSize: 16, lineHeight: 28 }}>
                  Esta nota no tiene texto legible todavia.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
