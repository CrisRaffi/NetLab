// OWASP ASVS v4.0.3 — V2.1 Política de senhas
// - Mínimo de 12 caracteres (V2.1.1) — sem regras arbitrárias de composição (NIST SP 800-63B)
// - Aceitar senhas de até 128 caracteres (V2.1.5)
// - Rejeitar senhas comuns/comprometidas (V2.1.4)

export const PASSWORD_MIN_LENGTH = 12;

const COMMON_PASSWORDS = new Set([
  '123456',
  '123456789',
  'qwerty',
  'password',
  '12345678',
  '111111',
  '1234567890',
  '1234567',
  'abc123',
  'password1',
  '123123',
  'iloveyou',
  '1q2w3e4r',
  'qwerty123',
  'monkey',
  'dragon',
  'letmein',
  'trustno1',
  'master',
  'sunshine',
  'princess',
  'admin',
  'welcome',
  'football',
  'shadow',
  'superman',
  'michael',
  'ninja',
  'mustang',
  'senha',
  'senha123',
  'brasil',
  'brasil123',
  'netlab',
  'netlab123',
]);

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (pw.length > 128) {
    return 'A senha não pode ultrapassar 128 caracteres.';
  }
  if (/^\s*$/.test(pw)) {
    return 'A senha não pode ser composta apenas de espaços.';
  }
  if (COMMON_PASSWORDS.has(pw.trim().toLowerCase())) {
    return 'Esta senha é muito comum e fácil de adivinhar. Escolha outra.';
  }
  return null;
}