// OWASP ASVS v4.0.3 — V2.2 Mitigação de força bruta
// Lockout progressivo por chave (normalmente o email) com janela de bloqueio
// crescente. A mitigação autoritativa é do Firebase Auth (throttling
// server-side / auth/too-many-requests); isso é uma camada extra no cliente.

const STORAGE_KEY = 'netlab-auth-lockout';

interface LockEntry {
  failures: number;
  lockedUntil: number;
}

type LockMap = Record<string, LockEntry>;

const MAX_LOCK_SECONDS = 900; // 15 min

function read(): LockMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LockMap) : {};
  } catch {
    return {};
  }
}

function write(map: LockMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage indisponível — lockout segue no cache de memória do chamador
  }
}

function lockSecondsFor(failures: number): number {
  if (failures <= 5) return 0;
  return Math.min(MAX_LOCK_SECONDS, 60 * 2 ** (failures - 5));
}

/** Segundos restantes de bloqueio para uma chave (0 = liberado). */
export function getLockRemainingSeconds(key: string): number {
  const map = read();
  const entry = map[key];
  if (!entry) return 0;
  const remaining = Math.max(0, Math.ceil((entry.lockedUntil - Date.now()) / 1000));
  if (remaining === 0) delete map[key];
  return remaining;
}

/** Registra uma falha e devolve os segundos de bloqueio ativos agora. */
export function registerFailure(key: string): number {
  const map = read();
  const prev = map[key];
  const failures = (prev?.failures ?? 0) + 1;
  const seconds = lockSecondsFor(failures);
  map[key] = { failures, lockedUntil: Date.now() + seconds * 1000 };
  write(map);
  return seconds;
}

/** Zera as falhas de uma chave (após sucesso de autenticação/reset). */
export function clearFailures(key: string) {
  const map = read();
  delete map[key];
  write(map);
}