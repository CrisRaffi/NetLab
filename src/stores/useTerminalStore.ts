import { create } from 'zustand';

interface TerminalState {
  open: boolean;
  deviceId: string | null;
  lines: Record<string, string[]>;
  history: string[];

  openTerminal: (deviceId: string) => void;
  closeTerminal: () => void;
  appendLines: (deviceId: string, lines: string[]) => void;
  clearLines: (deviceId: string) => void;
  addHistory: (command: string) => void;
}

export const useTerminalStore = create<TerminalState>()((set, get) => ({
  open: false,
  deviceId: null,
  lines: {},
  history: [],

  openTerminal: (deviceId) => set({ open: true, deviceId }),

  closeTerminal: () => set({ open: false }),

  appendLines: (deviceId, newLines) => {
    const current = get().lines[deviceId] ?? [];
    set({
      lines: {
        ...get().lines,
        [deviceId]: [...current, ...newLines].slice(-300),
      },
    });
  },

  clearLines: (deviceId) =>
    set({ lines: { ...get().lines, [deviceId]: [] } }),

  addHistory: (command) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    set({ history: [trimmed, ...get().history.filter(h => h !== trimmed)].slice(0, 50) });
  },
}));
