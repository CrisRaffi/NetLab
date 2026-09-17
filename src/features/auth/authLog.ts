// OWASP ASVS v4.0.3 — V7/8 Security Logging
// Registra eventos de autenticação localmente (localStorage) para fins de
// auditoria.  Em produção, eventos críticos deveriam ser encaminhados a um
// backend/SIEM.

type EventType =
  | 'login.success'
  | 'login.failed'
  | 'register.success'
  | 'register.failed'
  | 'reset.sent'
  | 'reset.failed'
  | 'logout';

export type AuthEventType = EventType;

interface AuthEvent {
  type: EventType;
  email?: string;
  detail?: string;
  at: string;
}

const STORAGE_KEY = 'netlab-auth-log';
const MAX_ENTRIES = 50;

function read(): AuthEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthEvent[]) : [];
  } catch {
    return [];
  }
}

function write(events: AuthEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function logAuthEvent(type: EventType, opts?: { email?: string; detail?: string }) {
  const events = read();
  events.push({
    type,
    email: opts?.email?.toLowerCase(),
    detail: opts?.detail,
    at: new Date().toISOString(),
  });
  // manter apenas os últimos MAX_ENTRIES
  const trimmed = events.slice(-MAX_ENTRIES);
  write(trimmed);

  // feedback no console para desenvolvimento
  if (type.endsWith('.failed')) {
    console.warn(`[auth] ${type}`, opts);
  } else {
    console.log(`[auth] ${type}`, opts?.email ?? '');
  }
}

export function getAuthLogs(): AuthEvent[] {
  return read().slice().reverse(); // mais recentes primeiro
}