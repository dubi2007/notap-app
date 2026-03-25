import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Folder {
  id: string;
  user_id?: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id?: string;
  title: string;
  folder_id: string | null;
  content: unknown;
  created_at?: string;
  updated_at: string;
}

interface NotesState {
  folders: Folder[];
  notes: Note[];
  loadingFolders: boolean;
  loadingNotes: boolean;
  fetchFolders: () => Promise<void>;
  fetchNotes: (folderId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set) => ({
  folders: [],
  notes: [],
  loadingFolders: false,
  loadingNotes: false,
  fetchFolders: async () => {
    set({ loadingFolders: true });
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      set({ folders: (data ?? []) as Folder[] });
    } finally {
      set({ loadingFolders: false });
    }
  },
  fetchNotes: async (folderId: string) => {
    set({ loadingNotes: true, notes: [] });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('folder_id', folderId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      set({ notes: (data ?? []) as Note[] });
    } finally {
      set({ loadingNotes: false });
    }
  },
}));
