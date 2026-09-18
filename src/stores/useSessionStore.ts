import { create } from 'zustand';

export interface SessionEvent {
  id: string;
  timestamp: number;
  deviceId?: string;
  deviceName?: string;
  command?: string;
  type: 'system' | 'command' | 'dhcp' | 'dns' | 'web' | 'error' | 'packet';
  detail: string;
  success?: boolean;
}

export interface SessionState {
  events: SessionEvent[];
  logEvent: (event: Omit<SessionEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  exportText: (topologyName?: string) => string;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  events: [],
  logEvent: (event) =>
    set((state) => ({
      events: [
        { ...event, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, timestamp: Date.now() },
        ...state.events,
      ].slice(0, 500),
    })),
  clearEvents: () => set({ events: [] }),
  exportText: (topologyName = 'Laboratório NetLab') => {
    const lines: string[] = [
      `==========================================`,
      `Relatório de Sessão — ${topologyName}`,
      `Início: ${new Date(Date.now()).toLocaleString('pt-BR')}`,
      `==========================================`,
      '',
    ];
    const events = [...get().events].reverse();
    for (const e of events) {
      const ts = new Date(e.timestamp).toLocaleTimeString('pt-BR');
      const tag = e.type.toUpperCase().padEnd(8);
      const dev = e.deviceName ? `[${e.deviceName}]` : '';
      lines.push(`${ts} ${tag} ${dev} ${e.detail}`);
    }
    lines.push('', '--- Fim do Relatório ---');
    return lines.join('\r\n');
  },
}));