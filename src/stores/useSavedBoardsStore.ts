import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Topology } from '../types';

export interface SavedBoard {
  id: string;
  name: string;
  savedAt: number;
  topology: Topology;
}

interface SavedBoardsState {
  boards: SavedBoard[];
  saveBoard: (topology: Topology, name?: string) => SavedBoard;
  deleteBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  lastBoard: () => SavedBoard | null;
}

function cloneTopology(topology: Topology): Topology {
  return JSON.parse(JSON.stringify(topology)) as Topology;
}

export const useSavedBoardsStore = create<SavedBoardsState>()(
  persist(
    (set, get) => ({
      boards: [],

      saveBoard: (topology, name) => {
        const now = Date.now();
        const board: SavedBoard = {
          id: `board-${now}`,
          name: name?.trim() || `Quadro ${new Date(now).toLocaleString('pt-BR')}`,
          savedAt: now,
          topology: cloneTopology(topology),
        };
        set({ boards: [board, ...get().boards].slice(0, 20) });
        return board;
      },

      deleteBoard: (id) =>
        set({ boards: get().boards.filter((b) => b.id !== id) }),

      renameBoard: (id, name) =>
        set({
          boards: get().boards.map((b) => (b.id === id ? { ...b, name } : b)),
        }),

      lastBoard: () => get().boards[0] ?? null,
    }),
    { name: 'netlab-saved-boards' }
  )
);
